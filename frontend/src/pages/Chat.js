import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

function Chat() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [content, setContent] = useState("");
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const token = localStorage.getItem("token");

  const getUserId = () => {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  };

  const getUsername = () => {
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.username;
  };

  const username = getUsername();
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
    if (!content.trim()) return;

    await axios.post(
      "http://localhost:5000/api/message/send",
      { chatId: selectedChat, content },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setContent("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    fetchChats();

    const userId = getUserId();

    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("join", userId);

    socketRef.current.on("receive_message", (msg) => {
      if (msg.chat_id === selectedChat) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [selectedChat]);


  useEffect(() => {
    if (selectedChat) fetchMessages(selectedChat);
  }, [selectedChat]);

 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100">
     
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } w-full md:w-1/3 bg-white border-r flex-col`}
      >
        <div className="p-4 font-bold text-lg border-b">Chats 💬</div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.chat_id}
              onClick={() => setSelectedChat(chat.chat_id)}
              className={`p-4 cursor-pointer border-b ${
                selectedChat === chat.chat_id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-semibold">{chat.username}</p>
              <p className="text-sm text-gray-500">{chat.last_message}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`${
          selectedChat ? "flex" : "hidden md:flex"
        } w-full md:w-2/3 flex-col`}
      >
   
        <div className="p-4 bg-white border-b flex items-center justify-between">

          <div className="flex items-center gap-3">
           
            <button
              className="md:hidden text-lg"
              onClick={() => setSelectedChat(null)}
            >
              ⬅️
            </button>

            <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center text-lg">
              {chats
                .find((c) => c.chat_id === selectedChat)
                ?.username?.charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <p className="font-semibold text-lg">
                {chats.find((c) => c.chat_id === selectedChat)?.username}
              </p>
              <p className="text-xs text-gray-500">online</p> 
            </div>
          </div>

          
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
     
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex justify-center items-center h-full text-gray-400">
              Start conversation 👋
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] ${
                  msg.sender_id === currentUserId
                    ? "bg-green-500 text-white"
                    : "bg-white border"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          <div ref={bottomRef}></div>
        </div>

        {selectedChat && (
          <div className="p-4 bg-white border-t flex gap-2">
            <input
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!content.trim()}
              className={`px-5 rounded-full ${
                content.trim()
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              ➤
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
