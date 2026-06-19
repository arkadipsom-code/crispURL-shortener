const urlService = require("../services/url.service");

async function handleShortenUrl(req, res) {
  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: "URL is required!" });
    }

    try {
      let parsedUrl = new URL(longUrl);

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res
          .status(400)
          .json({ error: "Only HTTP and HTTPS protocols are supported" });
      }
    } catch (err) {
      return res.status(400).json({ error: "Invalid URL format!" });
    }

    const shortCode = await urlService.shortenUrl(longUrl);
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    return res.status(200).json({
      message: "URL shortened successfully",
      longUrl,
      shortCode,
      shortUrl: `${baseUrl}/${shortCode}`,
    });
  } catch (error) {
    console.error("Error occurred while shortening URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleRedirect(req, res) {
  try {
    const { shortCode } = req.params;
    const longUrl = await urlService.getLongUrl(shortCode);

    if (!longUrl) {
      return res.status(404).json({ error: "URL not found" });
    }

    return res.redirect(longUrl);
  } catch (error) {
    console.error("Error occurred while redirecting URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { handleShortenUrl, handleRedirect };
