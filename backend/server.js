const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const urlRoutes = require("./routes/url.route");
const urlController = require("./controllers/url.controller");

const app = express();

app.use(
  cors({
    origin: ["https://crisp-url-shortener.vercel.app", "http://localhost:5000"],
    credentials: true,
  }),
);

app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use("/api/v1/urls", urlRoutes);

app.get("/:shortCode", urlController.handleRedirect);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
