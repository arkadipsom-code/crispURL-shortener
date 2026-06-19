const urlModel = require("../models/url.model");
const { encodeToBase62, decodeFromBase62 } = require("../utils/base62");

async function shortenUrl(longUrl) {
  let urlRecord = await urlModel.findUrlByLongUrl(longUrl);

  if (!urlRecord) {
    urlRecord = await urlModel.createNewUrl(longUrl);
  }

  return encodeToBase62(parseInt(urlRecord.id));
}

const POSTGRES_MAX_BIGINT = 9223372036854775807n;

async function getLongUrl(shortCode) {
  try {
    if (!shortCode || shortCode === "favicon.ico") return null;

    const dbId = decodeFromBase62(shortCode);

    if (BigInt(dbId) > POSTGRES_MAX_BIGINT) {
      console.warn(`Blocked overflow attempt with ID: ${dbId}`);
      return null;
    }

    const urlRecord = await urlModel.findUrlById(dbId);

    if (urlRecord) {
      urlModel
        .incrementClickCount(dbId)
        .catch((err) => console.error("Failed to increment click count:", err));
      return urlRecord.long_url;
    }

    return null;
  } catch (error) {
    console.error("Decoding/Service error:", error);
    return null;
  }
}

module.exports = {
  shortenUrl,
  getLongUrl,
};
