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

    return () => socket.off("receive_message");
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
              onClick={() => {
                setSelectedChat(chat.chat_id);
                fetchMessages(chat.chat_id);
              }}
              className="p-4 cursor-pointer hover:bg-gray-100 border-b"
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
        
        <div className="p-4 bg-white border-b flex items-center gap-2 font-semibold">
          
          <button
            className="md:hidden text-lg"
            onClick={() => setSelectedChat(null)}
          >
            ⬅️
          </button>

          {selectedChat ? "Chat" : "Select a chat"}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                className={`px-4 py-2 rounded-lg max-w-xs ${
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
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              onClick={sendMessage}
              className="bg-green-500 text-white px-4 rounded-lg hover:bg-green-600"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
