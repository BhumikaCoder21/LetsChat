const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const users = await pool.query(
      "SELECT id, username FROM users WHERE id != $1",
      [currentUserId],
    );

    res.json(users.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
