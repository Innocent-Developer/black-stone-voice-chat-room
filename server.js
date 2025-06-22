const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const socketIo = require("socket.io");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Allow all origins and methods for CORS
app.use(cors({
  origin: true, // allow all origins dynamically
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

const dbconnect = require("./db connect/dbconnect");
const router = require("./routers/Routes.js");

dbconnect();

const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");

require("./google-congif/passport.js");

// Express routes
app.use("/", router);

// Health check
app.get("/", (req, res) => {
  res.send(`Server Successfully started on port ${PORT}`);
});

app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with open CORS
const io = socketIo(server, {
  cors: {
    origin: "*", // allow all origins
    methods: ["GET", "POST"],
  },
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log(`New socket connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Broadcast message to all users
const sendAdminBroadcast = require("./officalMassege/createMassege.js");

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

// Google OAuth route
app.use("/auth", require("./auths/auth.js"));

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
