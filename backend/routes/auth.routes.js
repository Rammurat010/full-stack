const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message: "Valid name, email and password (8–72 bytes) required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail],
    );

    if (existing.length) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, hashedPassword],
    );

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error("Register error:", error.message);
    return res.status(500).json({
      message: "Server error during registration",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const [users] = await db.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email.trim().toLowerCase()],
    );

    if (
      users.length === 0 ||
      !(await bcrypt.compare(password, users[0].password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
});

// CURRENT USER
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, name, email FROM users WHERE id = ?",
      [req.user.id],
    );

    if (!users.length) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.json({ user: users[0] });
  } catch (error) {
    console.error("User lookup error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
