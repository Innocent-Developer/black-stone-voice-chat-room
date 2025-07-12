const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Middleware (Allow all origins) ---
app.use(cors({
  origin: "*", // Accept requests from all domains
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// --- Body Parsers ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// --- Session Middleware (Optional) ---
app.use(
  session({
    secret: process.env.JWT_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// --- Passport Init ---
require("./google-congif/passport.js");
app.use(passport.initialize());
app.use(passport.session());

// --- Connect to MongoDB ---
const dbconnect = require("./db connect/dbconnect");
dbconnect();

// --- Routes ---
app.use("/", require("./routers/Routes.js"));
app.use("/auth", require("./auths/auth.js"));

app.get("/", (req, res) => {
  res.send(`✅ Server Successfully started on port ${PORT}`);
});

// --- Admin Broadcast Route (Removed io) ---
const sendAdminBroadcast = require("./officalMassege/createMassege.js");

app.post("/admin/broadcast", async (req, res) => {
  const { adminId, message } = req.body;

  if (!adminId || !message) {
    return res.status(400).json({ error: "adminId and message are required." });
  }

  try {
    await sendAdminBroadcast(Number(adminId), message); // removed io
    res.status(200).json({ status: "✅ Broadcast sent successfully" });
  } catch (error) {
    console.error("❌ Error in broadcast route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
