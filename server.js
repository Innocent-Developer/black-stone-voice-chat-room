// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const NodeCache = require("node-cache");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow cookies behind proxies (for secure cookies to work)
app.set("trust proxy", true);

// ✅ In-memory cache
const cache = new NodeCache();

// ✅ Allowed Frontend Origins
const allowedOrigins = [
  "https://admps.funchatparty.online", // Your admin panel frontend domain
  "https://admps.blackstonevoicechatroom.online",
  "http://localhost:3000",
  "http://localhost:5000",
];

// ✅ CORS Middleware with credentials support
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "userId"],
  })
);

// ✅ Debug log for CORS headers (optional, remove in production)
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log("CORS Headers:", {
      "Access-Control-Allow-Origin": res.getHeader("Access-Control-Allow-Origin"),
      "Access-Control-Allow-Credentials": res.getHeader("Access-Control-Allow-Credentials"),
    });
  });
  next();
});

// ✅ Middleware
app.use(compression());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ✅ Session for login/authorization if needed
app.use(
  session({
    secret: process.env.JWT_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,     // true if your site is served over HTTPS
      sameSite: "None", // required for cross-site cookies
    },
  })
);

// ✅ Passport Setup (Google Login or other auth)
require("./google-congif/passport.js");
app.use(passport.initialize());
app.use(passport.session());

// ✅ Database Connection
const dbconnect = require("./db connect/dbconnect");
dbconnect();

// ✅ Your main routes
app.use("/", require("./routers/Routes.js"));
app.use("/auth", require("./auths/auth.js"));

// ✅ Example: Cached Endpoint (test route)
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

// ✅ Admin Broadcast (official message) POST handler
const sendAdminBroadcast = require("./officalMassege/createMassege.js");

// app.post("/chats/users/admin/send", async (req, res) => {
//   const { title, content, image } = req.body;
//   const userId = req.headers.userid;

//   if (!userId || !content) {
//     return res.status(400).json({ error: "userId and content are required." });
//   }

//   try {
//     await sendAdminBroadcast(userId, { title, content, image });
//     res.status(200).json({ message: "✅ Message sent successfully." });
//   } catch (err) {
//     console.error("Broadcast error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("✅ Server running");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
