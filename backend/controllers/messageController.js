const pool = require("../config/db");
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user.id;

    const newMessage = await pool.query(
      "INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
      [chatId, senderId, content],
    );

    res.json(newMessage.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await pool.query(
      "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
      [chatId]
    );

    res.json(messages.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
