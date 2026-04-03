const express = require("express");
const router = express.Router();
const { createChat,getUserChats } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createChat);
router.get("/", authMiddleware, getUserChats);

module.exports = router;
