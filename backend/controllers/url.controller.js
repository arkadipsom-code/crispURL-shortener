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

    let urlRecord = await urlService.findUrlByLongUrl(longUrl);

    if (!urlRecord) {
      urlRecord = await urlService.createNewUrl(longUrl);
    }

    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    return res.status(200).json({
      message: "URL shortened successfully",
      longUrl: urlRecord.long_url,
      shortCode: urlRecord.short_code,
      shortUrl: `${baseUrl}/${urlRecord.short_code}`,
    });
  } catch (error) {
    console.error("Error occurred while shortening URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleRedirect(req, res) {
  try {
    const { shortCode } = req.params;
    const urlRecord = await urlService.findUrlByShortCode(shortCode);

    if (!urlRecord) {
      return res.status(404).send("<h1>CrispURL Not Found</h1>");
    }

    await urlService.incrementClickCount(urlRecord.id);

    return res.redirect(urlRecord.long_url);
  } catch (error) {
    console.error("Error occurred while redirecting URL:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = { handleShortenUrl, handleRedirect };
