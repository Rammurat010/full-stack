const { db } = require("../config/db");

async function findUserByEmail(email) {
  const [rows] = await db.execute(
    "SELECT id, name, email, password FROM users WHERE email = ?",
    [email],
  );

  return rows[0] || null;
}

async function createUser(name, email, password) {
  const [result] = await db.execute(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
  );

  return {
    id: result.insertId,
    name,
    email,
  };
}

async function findUserById(id) {
  const [rows] = await db.execute(
    "SELECT id, name, email FROM users WHERE id = ?",
    [id],
  );

  return rows[0] || null;
}

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
};
