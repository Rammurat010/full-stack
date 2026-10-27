require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { db, connectDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");
    res.json({
      message: "Database working successfully!",
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ message: "Database query failed" });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    process.exit(1);
  }
}

startServer();
