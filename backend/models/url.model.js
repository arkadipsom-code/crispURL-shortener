const pool = require("../config/db");

async function findUrlByLongUrl(longUrl) {
  const result = await pool.query("SELECT * FROM urls WHERE long_url = $1", [
    longUrl,
  ]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function createNewUrl(longUrl) {
  const result = await pool.query(
    "INSERT INTO urls (long_url) VALUES($1) RETURNING *",
    [longUrl],
  );
  return result.rows[0];
}

async function findUrlById(id) {
  const result = await pool.query("SELECT * FROM urls WHERE id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function incrementClickCount(id) {
  const result = await pool.query(
    "UPDATE urls SET clicks = clicks + 1 WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0];
}

module.exports = {
  findUrlByLongUrl,
  createNewUrl,
  findUrlById,
  incrementClickCount,
};
