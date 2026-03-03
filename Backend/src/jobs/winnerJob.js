const cron = require("node-cron");
const pool = require("../db");
const { todayISODate } = require("../utils/date");

/**
 * Simple rule:
 * - Every day at 00:00 server time, select yesterday's bid_for_date winner and store in featured_winners.
 * - Featured "today" endpoint returns today's winner row.
 *
 * This meets the "automated selection" requirement without overcomplicating time cutoffs.
 */

async function selectWinnerForDate(dateISO) {
  // prevent duplicates
  const [[already]] = await pool.query(
    "SELECT id FROM featured_winners WHERE featured_date=? LIMIT 1",
    [dateISO]
  );
  if (already) return;

  const [rows] = await pool.query(
    `SELECT user_id, bid_amount
     FROM bids
     WHERE bid_for_date=?
     ORDER BY bid_amount DESC, updated_at ASC
     LIMIT 1`,
    [dateISO]
  );

  if (!rows.length) return;

  const w = rows[0];
  await pool.query(
    "INSERT INTO featured_winners (featured_date, user_id, bid_amount, selected_at) VALUES (?,?,?,NOW())",
    [dateISO, w.user_id, w.bid_amount]
  );
}

function startWinnerJob() {
  // run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      // select winner for yesterday
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yISO = d.toISOString().slice(0, 10);
      await selectWinnerForDate(yISO);
      console.log("Winner job complete for:", yISO);
    } catch (e) {
      console.error("Winner job failed:", e.message);
    }
  });

  // optional: run once on boot for yesterday (safe)
  (async () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yISO = d.toISOString().slice(0, 10);
    await selectWinnerForDate(yISO);
  })();
}

module.exports = { startWinnerJob };