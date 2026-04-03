const pool = require("../config/db");

exports.createChat = async (req, res) => {
  try {
    const { userId } = req.body; 
    const currentUserId = req.user.id;

    const chat = await pool.query(
      "INSERT INTO chats (is_group) VALUES (false) RETURNING *",
    );

    const chatId = chat.rows[0].id;

    await pool.query(
      "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2), ($1, $3)",
      [chatId, currentUserId, userId],
    );

    res.json({ message: "Chat created", chatId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
