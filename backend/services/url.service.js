const pool = require("../config/db");
const { encodeToBase62 } = require("../utils/base62");

async function findUrlByLongUrl(longUrl) {
  const result = await pool.query("SELECT * FROM urls WHERE long_url = $1", [
    longUrl,
  ]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function createNewUrl(longUrl) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertResult = await client.query(
      "INSERT INTO urls (long_url) VALUES($1) RETURNING id",
      [longUrl],
    );
    const id = insertResult.rows[0].id;

    const shortCode = encodeToBase62(id);

    const updateResult = await client.query(
      "UPDATE urls SET short_code = $1 WHERE id = $2 RETURNING *",
      [shortCode, id],
    );

    await client.query("COMMIT");
    return updateResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function findUrlByShortCode(shortCode) {
  const result = await pool.query("SELECT * FROM urls WHERE short_code = $1", [
    shortCode,
  ]);
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
  findUrlByShortCode,
  incrementClickCount,
};
