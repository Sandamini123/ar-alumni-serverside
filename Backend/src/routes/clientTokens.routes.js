const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/authSession");
const { requireAdmin } = require("../middleware/requireAdmin");
const { schemas } = require("../utils/validators");
const { randomToken, sha256 } = require("../utils/crypto");

const router = express.Router();

/**
 * @swagger
 * /api/admin/client-tokens:
 *   post:
 *     summary: Create new client bearer token (admin only)
 *     tags: [Admin]
 */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { error, value } = schemas.createClientToken.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const token = randomToken();
  const tokenHash = sha256(token);

  await pool.query(
    "INSERT INTO client_tokens (name, token_hash, is_revoked) VALUES (?,?,0)",
    [value.name, tokenHash]
  );

  // Show token once (like API keys)
  res.status(201).json({ message: "Client token created", token });
});

/**
 * @swagger
 * /api/admin/client-tokens:
 *   get:
 *     summary: List client tokens + usage count (admin only)
 *     tags: [Admin]
 */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ct.id, ct.name, ct.is_revoked, ct.created_at, ct.revoked_at,
            (SELECT COUNT(*) FROM token_usage_logs tul WHERE tul.client_token_id=ct.id) as usageCount
     FROM client_tokens ct
     ORDER BY ct.id DESC`
  );
  res.json({ tokens: rows });
});

/**
 * @swagger
 * /api/admin/client-tokens/{id}/revoke:
 *   post:
 *     summary: Revoke client token (admin only)
 *     tags: [Admin]
 */
router.post("/:id/revoke", requireAuth, requireAdmin, async (req, res) => {
  await pool.query("UPDATE client_tokens SET is_revoked=1, revoked_at=NOW() WHERE id=?", [req.params.id]);
  res.json({ message: "Token revoked" });
});

/**
 * @swagger
 * /api/admin/client-tokens/{id}/usage:
 *   get:
 *     summary: View token usage logs (admin only)
 *     tags: [Admin]
 */
router.get("/:id/usage", requireAuth, requireAdmin, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT endpoint, method, used_at, ip
     FROM token_usage_logs
     WHERE client_token_id=?
     ORDER BY used_at DESC
     LIMIT 200`,
    [req.params.id]
  );
  res.json({ logs: rows });
});

module.exports = router;