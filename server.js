// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const NodeCache = require("node-cache");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// In-memory cache
const cache = new NodeCache();

// Rate Limiting (100 req/min/IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
// app.options("*", cors())

// --- Middlewares ---
app.use(limiter);
app.use(compression());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization","userId"],
  credentials: true // only if you're using cookies/sessions
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
  })
);

require("./google-congif/passport.js");
app.use(passport.initialize());
app.use(passport.session());

// --- DB ---
const dbconnect = require("./db connect/dbconnect");
dbconnect();

// --- Routes ---
app.use("/", require("./routers/Routes.js"));
app.use("/auth", require("./auths/auth.js"));

// --- Cached Endpoint Example ---
app.get("/api/info/:id", async (req, res) => {
  const id = req.params.id;
  const key = `info_${id}`;

  const cached = cache.get(key);
  if (cached) {
    return res.json({ from: "cache", data: cached });
  }

  const data = { id, name: "Example", fetched: new Date() };
  cache.set(key, data, 60);
  res.json({ from: "live", data });
});

// --- Admin Broadcast ---
const sendAdminBroadcast = require("./officalMassege/createMassege.js");

app.post("/admin/broadcast", async (req, res) => {
  const { adminId, message } = req.body;
  if (!adminId || !message) {
    return res.status(400).json({ error: "adminId and message are required." });
  }

  try {
    await sendAdminBroadcast(Number(adminId), message);
    res.status(200).json({ status: "✅ Broadcast sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Health Check ---
app.get("/", (req, res) => {
  res.send(`✅ Server running `);
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
