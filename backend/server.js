const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const pool = require("./config/db");

const app = express();


pool
  .query("SELECT 1")
  .then(() => console.log("PostgreSQL connected ✅"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("LetsChat backend running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const users = {};
global.onlineUsers = users;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log("User joined:", userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
global.onlineUsers = users;
app.set("io", io);


app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route",
    userId: req.user.id,
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
