const express = require("express");
const router = express.Router();
const { createChat } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createChat);

module.exports = router;
