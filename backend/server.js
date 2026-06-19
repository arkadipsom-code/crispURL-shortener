const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const pool = require("./config/db");
const path = require("path");
const urlRoutes = require("./routes/url.route");
const urlController = require("./controllers/url.controller");
`node --trace-warnings ...`;

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

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
