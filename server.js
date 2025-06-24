const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const socketIo = require("socket.io");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow all origins and methods for CORS (including mobile/web/admin apps)
app.use(cors({
  origin: true,            // dynamically reflects request origin
  credentials: true,       // allow credentials (cookies/sessions)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.options("*", cors());   // handle preflight globally

// ✅ Parse JSON and form data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Cookie and session middleware
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
}));

// ✅ Passport configuration (Google login or local auth)
require("./google-congif/passport.js");
app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB Connection
const dbconnect = require("./db connect/dbconnect");
dbconnect();

// ✅ All routes
const router = require("./routers/Routes.js");
app.use("/", router);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send(`✅ Server is running on port ${PORT}`);
});

// ✅ Admin Broadcast Message Route (with Socket.IO)
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
    console.error("❌ Broadcast Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Google OAuth routes
app.use("/auth", require("./auths/auth.js"));

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Socket.IO Setup with Open CORS
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for sockets (safe if no credentials)
    methods: ["GET", "POST"],
  },
});

// ✅ Socket.IO Logic
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`🟢 Joined room: ${roomId}`);
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
