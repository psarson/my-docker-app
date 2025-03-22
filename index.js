const express = require('express'); 
const bodyParser = require('body-parser'); 
const cors = require('cors'); 
const pgp = require('pg-promise')();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());  // Enable CORS (MUST be before routes)
app.use(bodyParser.json()); // Parse JSON body

// Database Connection
const db = pgp({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// GET /db - Fetch All Users
app.get('/db', async (req, res) => {
  try {
    const users = await db.any('SELECT * FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('❌ Database query error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /db - Add a New User
app.post('/db', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    // Check if the email already exists
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Insert new user if email is unique
    const newUser = await db.one(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );

    res.status(201).json(newUser);
  } catch (error) {
    console.error('❌ Database insert error:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
});
