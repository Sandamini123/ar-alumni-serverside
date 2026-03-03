const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/authSession");
const { schemas } = require("../utils/validators");
const { todayISODate, monthStartEnd } = require("../utils/date");

const router = express.Router();

async function getMonthlyFeatureLimit(userId) {
  // base limit 3; if they participated in any event this month => +1
  const { start, end } = monthStartEnd(new Date());
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);

  const [[eventCount]] = await pool.query(
    "SELECT COUNT(*) as c FROM event_participation WHERE user_id=? AND event_date>=? AND event_date<?",
    [userId, startISO, endISO]
  );

  return eventCount.c > 0 ? 4 : 3;
}

async function getMonthlyWins(userId) {
  const { start, end } = monthStartEnd(new Date());
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);

  const [[wins]] = await pool.query(
    "SELECT COUNT(*) as c FROM featured_winners WHERE user_id=? AND featured_date>=? AND featured_date<?",
    [userId, startISO, endISO]
  );
  return wins.c;
}

/**
 * @swagger
 * /api/bidding/status:
 *   get:
 *     summary: My bidding status for today + remaining monthly slots
 *     tags: [Bidding]
 */
router.get("/status", requireAuth, async (req, res) => {
  const userId = req.session.user.id;
  const today = todayISODate();

  const [[myBid]] = await pool.query(
    "SELECT bid_amount FROM bids WHERE user_id=? AND bid_for_date=? LIMIT 1",
    [userId, today]
  );

  const [[topBid]] = await pool.query(
    "SELECT MAX(bid_amount) as maxBid FROM bids WHERE bid_for_date=?",
    [today]
  );

  const maxBid = Number(topBid.maxBid || 0);
  const myBidAmount = myBid ? Number(myBid.bid_amount) : 0;

  // Blind feedback: only win/lose, no amounts
  let status = "NO_BID";
  if (myBid) status = myBidAmount >= maxBid ? "WINNING" : "LOSING";

  const limit = await getMonthlyFeatureLimit(userId);
  const wins = await getMonthlyWins(userId);

  res.json({
    today,
    status,
    remainingMonthlySlots: Math.max(0, limit - wins)
  });
});

/**
 * @swagger
 * /api/bidding/bid:
 *   post:
 *     summary: Place or update bid (increase only). Blind system.
 *     tags: [Bidding]
 */
router.post("/bid", requireAuth, async (req, res) => {
  const { error, value } = schemas.bid.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const userId = req.session.user.id;
  const today = todayISODate();

  // Monthly limit check (wins-based)
  const limit = await getMonthlyFeatureLimit(userId);
  const wins = await getMonthlyWins(userId);
  if (wins >= limit) {
    return res.status(403).json({ message: `Monthly feature limit reached (${limit}).` });
  }

  const [[existing]] = await pool.query(
    "SELECT id, bid_amount FROM bids WHERE user_id=? AND bid_for_date=? LIMIT 1",
    [userId, today]
  );

  if (!existing) {
    await pool.query(
      "INSERT INTO bids (user_id, bid_amount, bid_for_date) VALUES (?,?,?)",
      [userId, value.bidAmount, today]
    );
  } else {
    const oldAmount = Number(existing.bid_amount);
    if (Number(value.bidAmount) <= oldAmount) {
      return res.status(400).json({ message: "Bid update must be higher than current bid" });
    }
    await pool.query("UPDATE bids SET bid_amount=? WHERE id=?", [value.bidAmount, existing.id]);
  }

  // return blind feedback
  const [[topBid]] = await pool.query("SELECT MAX(bid_amount) as maxBid FROM bids WHERE bid_for_date=?", [today]);
  const maxBid = Number(topBid.maxBid || 0);
  const status = Number(value.bidAmount) >= maxBid ? "WINNING" : "LOSING";

  res.json({ message: "Bid saved", today, status });
});

module.exports = router;