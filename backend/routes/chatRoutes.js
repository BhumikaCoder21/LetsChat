const express = require("express");
const router = express.Router();
const { createChat,getUserChats,createGroupChat} = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createChat);
router.get("/", authMiddleware, getUserChats);
router.post("/group", authMiddleware, createGroupChat);

module.exports = router;
