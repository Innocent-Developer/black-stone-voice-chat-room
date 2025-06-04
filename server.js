const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
app.use(express.json());
const dbconnect = require("./db connect/dbconnect");
const router = require("./routers/Routes.js");
dbconnect();


app.use("/",router);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
