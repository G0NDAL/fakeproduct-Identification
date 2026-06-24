const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173", // for local testing
    "https://fakeproduct-identification.vercel.app/" // your deployed frontend
  ],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// MySQL connection (FIXED)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Register user
app.post('/api/register', (req, res) => {
  const {
    user_id,
    first_name,
    last_name,
    user_role,
    user_email,
    user_password,
    user_address,
    user_phone
  } = req.body;

  const sql = `
    INSERT INTO users_types 
    (user_id, first_name, last_name, user_role, created_at, user_email, user_password, user_address, user_phone) 
    VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)
  `;

  db.query(sql,
    [user_id, first_name, last_name, user_role, user_email, user_password, user_address, user_phone],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, user_id });
    }
  );
});

// Fetch users
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users_types', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});