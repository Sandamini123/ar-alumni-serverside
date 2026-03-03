const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { randomToken, sha256 } = require("../utils/crypto");
const { sendEmail } = require("../utils/mailer");
const { schemas } = require("../utils/validators");
const { authLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

function assertUniversityDomain(email) {
  const allowed = (process.env.ALLOWED_EMAIL_DOMAIN || "").toLowerCase().trim();
  const domain = email.split("@")[1]?.toLowerCase();
  return domain === allowed;
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register alumni (university domain required)
 *     tags: [Auth]
 */
router.post("/register", authLimiter, async (req, res) => {
  const { error, value } = schemas.register.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const { email, password } = value;

  if (!assertUniversityDomain(email)) {
    return res.status(400).json({ message: "University email domain required" });
  }

  const [exists] = await pool.query("SELECT id FROM users WHERE email=? LIMIT 1", [email]);
  if (exists.length) return res.status(409).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);

  const [result] = await pool.query(
    "INSERT INTO users (email, password_hash, is_verified, role) VALUES (?,?,0,'alumni')",
    [email, passwordHash]
  );

  const userId = result.insertId;

  const token = randomToken();
  const tokenHash = sha256(token);
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await pool.query(
    "INSERT INTO user_tokens (user_id, token_hash, token_type, expires_at) VALUES (?,?, 'VERIFY_EMAIL', ?)",
    [userId, tokenHash, expires]
  );

  const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Welcome! Verify your email using this link (valid 1 hour):\n${verifyLink}`
  });

  return res.status(201).json({ message: "Registered. Please verify email (check console email)." });
});

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email using token
 *     tags: [Auth]
 */
router.post("/verify-email", async (req, res) => {
  const { error, value } = schemas.verifyToken.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const tokenHash = sha256(value.token);

  const [rows] = await pool.query(
    `SELECT id, user_id, expires_at, used_at
     FROM user_tokens
     WHERE token_hash=? AND token_type='VERIFY_EMAIL'
     LIMIT 1`,
    [tokenHash]
  );

  if (!rows.length) return res.status(400).json({ message: "Invalid token" });

  const t = rows[0];
  if (t.used_at) return res.status(400).json({ message: "Token already used" });
  if (new Date(t.expires_at) < new Date()) return res.status(400).json({ message: "Token expired" });

  await pool.query("UPDATE users SET is_verified=1 WHERE id=?", [t.user_id]);
  await pool.query("UPDATE user_tokens SET used_at=NOW() WHERE id=?", [t.id]);

  return res.json({ message: "Email verified. You can login now." });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login (session-based). Requires verified email
 *     tags: [Auth]
 */
router.post("/login", authLimiter, async (req, res) => {
  const { error, value } = schemas.login.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const { email, password } = value;

  const [rows] = await pool.query(
    "SELECT id, email, password_hash, is_verified, role FROM users WHERE email=? LIMIT 1",
    [email]
  );
  if (!rows.length) return res.status(401).json({ message: "Invalid credentials" });

  const user = rows[0];
  if (!user.is_verified) return res.status(403).json({ message: "Email not verified" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  req.session.user = { id: user.id, email: user.email, role: user.role };

  return res.json({ message: "Logged in", user: req.session.user });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current session user
 *     tags: [Auth]
 */
router.get("/me", async (req, res) => {
  return res.json({ user: req.session.user || null });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout (destroy session)
 *     tags: [Auth]
 */
router.post("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("phantasmagoria.sid");
    res.json({ message: "Logged out" });
  });
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset token (console email)
 *     tags: [Auth]
 */
router.post("/forgot-password", authLimiter, async (req, res) => {
  const { error, value } = schemas.forgot.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const { email } = value;

  const [rows] = await pool.query("SELECT id FROM users WHERE email=? LIMIT 1", [email]);
  // Always respond same (avoid account enumeration)
  if (!rows.length) return res.json({ message: "If account exists, reset link will be sent." });

  const userId = rows[0].id;

  const token = randomToken();
  const tokenHash = sha256(token);
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

  await pool.query(
    "INSERT INTO user_tokens (user_id, token_hash, token_type, expires_at) VALUES (?,?, 'RESET_PASSWORD', ?)",
    [userId, tokenHash, expires]
  );

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    text: `Reset your password using this link (valid 30 mins):\n${resetLink}`
  });

  return res.json({ message: "If account exists, reset link will be sent (check console)." });
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 */
router.post("/reset-password", authLimiter, async (req, res) => {
  const { error, value } = schemas.reset.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const tokenHash = sha256(value.token);

  const [rows] = await pool.query(
    `SELECT id, user_id, expires_at, used_at
     FROM user_tokens
     WHERE token_hash=? AND token_type='RESET_PASSWORD'
     LIMIT 1`,
    [tokenHash]
  );

  if (!rows.length) return res.status(400).json({ message: "Invalid token" });

  const t = rows[0];
  if (t.used_at) return res.status(400).json({ message: "Token already used" });
  if (new Date(t.expires_at) < new Date()) return res.status(400).json({ message: "Token expired" });

  const passwordHash = await bcrypt.hash(value.newPassword, 12);

  await pool.query("UPDATE users SET password_hash=? WHERE id=?", [passwordHash, t.user_id]);
  await pool.query("UPDATE user_tokens SET used_at=NOW() WHERE id=?", [t.id]);

  return res.json({ message: "Password reset successful. Please login." });
});

module.exports = router;