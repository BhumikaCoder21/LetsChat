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

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

   const chats = await pool.query(
     `SELECT DISTINCT ON (c.id)
      c.id AS chat_id,
      c.is_group,
      m.content AS last_message,
      m.created_at
      FROM chats c
      JOIN chat_members cm ON c.id = cm.chat_id
      LEFT JOIN messages m ON m.chat_id = c.id
      WHERE cm.user_id = $1
      ORDER BY c.id, m.created_at DESC`,
     [userId],
   );

    res.json(chats.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
