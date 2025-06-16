const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const socketIo = require("socket.io");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const dbconnect = require("./db connect/dbconnect");
const router = require("./routers/Routes.js");

dbconnect();

const sendAdminBroadcast = require("./officalMassege/createMassege.js");

// Express routes
app.use("/", router);

// Basic health check
app.get("/", (req, res) => {
  res.send(`Server Successfully started on port ${PORT}`);
});

// Create HTTP server from Express
const server = http.createServer(app);

// Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true); // accept all
    },
    methods: ["GET", "POST"],
  },
});

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log(`New socket connected: ${socket.id}`);

  // Join specific chat room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Message sending
  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data); // Send to everyone in room
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// send massege for amin to all users
app.post("/admin/broadcast", async (req, res) => {
  const { adminId, message } = req.body;

  if (!adminId || !message) {
    return res.status(400).json({ error: "adminId and message are required." });
  }

  try {
    await sendAdminBroadcast(Number(adminId), message, io);
    res.status(200).json({ status: "✅ Broadcast sent successfully" });
  } catch (error) {
    console.error("❌ Error in broadcast route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server with HTTP+Socket.IO
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
