const pool = require("../db");
const { sha256 } = require("../utils/crypto");

async function requireClientToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing bearer token" });

  const tokenHash = sha256(token);

  const [rows] = await pool.query(
    "SELECT id, is_revoked FROM client_tokens WHERE token_hash=? LIMIT 1",
    [tokenHash]
  );

  if (!rows.length) return res.status(401).json({ message: "Invalid token" });
  if (rows[0].is_revoked) return res.status(401).json({ message: "Token revoked" });

  // log usage
  await pool.query(
    "INSERT INTO token_usage_logs (client_token_id, endpoint, method, ip) VALUES (?,?,?,?)",
    [rows[0].id, req.originalUrl, req.method, req.ip]
  );

  req.clientTokenId = rows[0].id;
  next();
}

module.exports = { requireClientToken };