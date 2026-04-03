const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const pool = require("./config/db");

pool
  .query("SELECT 1")
  .then(() => console.log("PostgreSQL connected ✅"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("LetsChat backend running");
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route",
    userId: req.user.id,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

