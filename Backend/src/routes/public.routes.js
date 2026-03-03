const express = require("express");
const pool = require("../db");
const { requireClientToken } = require("../middleware/authClientToken");
const { todayISODate } = require("../utils/date");

const router = express.Router();

/**
 * @swagger
 * /api/public/featured:
 *   get:
 *     summary: Get today's featured alumnus (requires Bearer token)
 *     tags: [Public API]
 *     security:
 *       - BearerAuth: []
 */
router.get("/featured", requireClientToken, async (req, res) => {
  const today = todayISODate();

  const [[winner]] = await pool.query(
    `SELECT fw.featured_date, fw.bid_amount, p.full_name, p.bio, p.linkedin_url, p.profile_image_path
     FROM featured_winners fw
     JOIN profiles p ON p.user_id = fw.user_id
     WHERE fw.featured_date=? LIMIT 1`,
    [today]
  );

  if (!winner) return res.json({ date: today, featured: null });

  return res.json({
    date: today,
    featured: winner
  });
});

module.exports = router;