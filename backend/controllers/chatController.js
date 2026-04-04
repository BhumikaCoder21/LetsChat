const pool = require("../config/db");

exports.createChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;
    if (userId === currentUserId) {
      return res.status(400).json({ error: "Cannot chat with yourself" });
    }

    const existingChat = await pool.query(
      `SELECT c.id
      FROM chats c
      JOIN chat_members cm1 ON c.id = cm1.chat_id
      JOIN chat_members cm2 ON c.id = cm2.chat_id
      WHERE cm1.user_id = $1 AND cm2.user_id = $2 AND c.is_group = false`,
      [currentUserId, userId],
    );

    if (existingChat.rows.length > 0) {
      return res.json({ chatId: existingChat.rows[0].id });
    }

    const chat = await pool.query(
      "INSERT INTO chats (is_group) VALUES (false) RETURNING id",
    );

    const chatId = chat.rows[0].id;

    await pool.query(
      "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2), ($1, $3)",
      [chatId, currentUserId, userId],
    );

    res.json({ chatId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await pool.query(
      `SELECT DISTINCT ON (c.id)
    c.id AS chat_id,
    c.is_group,
    u.username,
    m.content AS last_message,
    m.created_at
    FROM chats c
    JOIN chat_members cm ON c.id = cm.chat_id
    JOIN users u ON u.id = cm.user_id
    LEFT JOIN messages m ON m.chat_id = c.id
    WHERE cm.user_id != $1 AND c.id IN (
    SELECT chat_id FROM chat_members WHERE user_id = $1
  )
  ORDER BY c.id, m.created_at DESC `,
      [req.user.id],
    );

    res.json(chats.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.createGroupChat = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { name, users } = req.body; 

    const chat = await pool.query(
      "INSERT INTO chats (is_group, name) VALUES (true, $1) RETURNING id",
      [name],
    );

    const chatId = chat.rows[0].id;
    const allUsers = [...users, currentUserId];

    for (let userId of allUsers) {
      await pool.query(
        "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)",
        [chatId, userId],
      );
    }
   res.json({ chatId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
