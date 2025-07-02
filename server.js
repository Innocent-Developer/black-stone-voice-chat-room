const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const socketIo = require("socket.io");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
  origin: true, // explicitly allow frontend domains
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// --- Session setup (optional, if NOT using JWT only) ---
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// --- Passport ---
require("./google-congif/passport.js");
app.use(passport.initialize());
app.use(passport.session());

// --- MongoDB ---
const dbconnect = require("./db connect/dbconnect");
dbconnect();

// --- Routes ---
const router = require("./routers/Routes.js");
app.use("/", router);
app.use("/auth", require("./auths/auth.js")); // Google OAuth routes

app.get("/", (req, res) => {
  res.send(`✅ Server Successfully started on port ${PORT}`);
});

// --- Socket.IO ---
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`📡 New socket connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`📥 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// --- Admin broadcast (optional custom logic) ---
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

// --- Start server ---
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
