const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/authSession");
const { schemas } = require("../utils/validators");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage });

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get my profile + sections
 *     tags: [Profile]
 */
router.get("/", requireAuth, async (req, res) => {
  const userId = req.session.user.id;

  const [[profile]] = await pool.query("SELECT * FROM profiles WHERE user_id=? LIMIT 1", [userId]);
  const [degrees] = await pool.query("SELECT * FROM degrees WHERE user_id=? ORDER BY id DESC", [userId]);
  const [certs] = await pool.query("SELECT * FROM certifications WHERE user_id=? ORDER BY id DESC", [userId]);
  const [licences] = await pool.query("SELECT * FROM licences WHERE user_id=? ORDER BY id DESC", [userId]);
  const [courses] = await pool.query("SELECT * FROM short_courses WHERE user_id=? ORDER BY id DESC", [userId]);
  const [employment] = await pool.query("SELECT * FROM employment_history WHERE user_id=? ORDER BY id DESC", [userId]);

  return res.json({ profile: profile || null, degrees, certifications: certs, licences, shortCourses: courses, employment });
});

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create/Update base profile
 *     tags: [Profile]
 */
router.post("/", requireAuth, async (req, res) => {
  const { error, value } = schemas.profileUpsert.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const userId = req.session.user.id;

  const [[existing]] = await pool.query("SELECT id FROM profiles WHERE user_id=? LIMIT 1", [userId]);

  if (!existing) {
    await pool.query(
      "INSERT INTO profiles (user_id, full_name, bio, linkedin_url) VALUES (?,?,?,?)",
      [userId, value.fullName, value.bio || null, value.linkedinUrl || null]
    );
  } else {
    await pool.query(
      "UPDATE profiles SET full_name=?, bio=?, linkedin_url=? WHERE user_id=?",
      [value.fullName, value.bio || null, value.linkedinUrl || null, userId]
    );
  }

  return res.json({ message: "Profile saved" });
});

/**
 * @swagger
 * /api/profile/image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Profile]
 */
router.post("/image", requireAuth, upload.single("image"), async (req, res) => {
  const userId = req.session.user.id;
  const filePath = `/uploads/${req.file.filename}`;

  // Ensure profile exists
  const [[profile]] = await pool.query("SELECT id FROM profiles WHERE user_id=? LIMIT 1", [userId]);
  if (!profile) {
    await pool.query("INSERT INTO profiles (user_id, full_name) VALUES (?,?)", [userId, "Your Name"]);
  }

  await pool.query("UPDATE profiles SET profile_image_path=? WHERE user_id=?", [filePath, userId]);
  return res.json({ message: "Image uploaded", path: filePath });
});

// Helper for add/delete items
function makeAddDeleteRoutes({ table, schema }) {
  router.post(`/${table}`, requireAuth, async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const userId = req.session.user.id;

    const fields = Object.keys(value);
    const cols = fields.map(f => f.replace(/[A-Z]/g, m => "_" + m.toLowerCase()));
    const placeholders = cols.map(() => "?").join(",");

    await pool.query(
      `INSERT INTO ${table} (user_id, ${cols.join(",")}) VALUES (?,${placeholders})`,
      [userId, ...fields.map(f => value[f])]
    );
    res.status(201).json({ message: `${table} added` });
  });

  router.delete(`/${table}/:id`, requireAuth, async (req, res) => {
    const userId = req.session.user.id;
    await pool.query(`DELETE FROM ${table} WHERE id=? AND user_id=?`, [req.params.id, userId]);
    res.json({ message: `${table} deleted` });
  });
}

makeAddDeleteRoutes({ table: "degrees", schema: schemas.degree });
makeAddDeleteRoutes({ table: "certifications", schema: schemas.cert });
makeAddDeleteRoutes({ table: "licences", schema: schemas.licence });
makeAddDeleteRoutes({ table: "short_courses", schema: schemas.shortCourse });
makeAddDeleteRoutes({ table: "employment_history", schema: schemas.employment });

module.exports = router;