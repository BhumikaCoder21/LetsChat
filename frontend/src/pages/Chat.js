import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
function Chat() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [content, setContent] = useState("");
  const bottomRef = useRef(null);

  const token = localStorage.getItem("token");
  const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  };
  const currentUserId = getUserId();

  const fetchChats = async () => {
    const res = await axios.get("http://localhost:5000/api/chat", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setChats(res.data);
  };

  
  const fetchMessages = async (chatId) => {
    const res = await axios.get(`http://localhost:5000/api/message/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages(res.data);
  };

  const sendMessage = async () => {
    if (!content) return;

    await axios.post(
      "http://localhost:5000/api/message/send",
      { chatId: selectedChat, content },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setContent("");
    fetchMessages(selectedChat);
  };

  useEffect(() => {
    fetchChats();

    const userId = getUserId();
    socket.emit("join", userId);

    socket.on("receive_message", (msg) => {
      if (msg.chat_id === selectedChat) {
        setMessages((prev) => [...prev, msg]);
      }
    });
  }, [selectedChat]);

  useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
 

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "30%", borderRight: "1px solid gray" }}>
        <h3>Chats</h3>
        {chats.map((chat) => (
          <div
            key={chat.chat_id}
            onClick={() => {
              setSelectedChat(chat.chat_id);
              fetchMessages(chat.chat_id);
            }}
            style={{ cursor: "pointer", padding: "10px" }}
          >
            <p>
              <b>{chat.username}</b>
            </p>
            <p>{chat.last_message}</p>
          </div>
        ))}
      </div>

      <div style={{ width: "70%", padding: "10px" }}>
        <h3>Messages</h3>

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent:
                msg.sender_id === currentUserId ? "flex-end" : "flex-start",
            }}
          >
            <p
              style={{
                background:
                  msg.sender_id === currentUserId ? "#DCF8C6" : "#eee",
                padding: "8px",
                borderRadius: "10px",
                maxWidth: "60%",
              }}
            >
              {msg.content}
            </p>
          </div>
        ))}
        <div ref={bottomRef}></div>

        {selectedChat && (
          <>
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
