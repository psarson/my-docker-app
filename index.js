const http = require('http');
const { Client } = require('pg');

const PORT = process.env.PORT || 3000;

// Database Connection
const db = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 5000, // Timeout after 5 seconds
});

db.connect()
  .then(() => console.log("🚀 Connected to PostgreSQL"))
  .catch(err => {
    console.error("❌ Database connection error", err);
    process.exit(1); // Exit process if database fails
  });

const server = http.createServer(async (req, res) => {
  if (req.url === "/db") {
    try {
      const result = await db.query("SELECT NOW()");
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`Database time: ${result.rows[0].now}`);
    } catch (error) {
      console.error("❌ Query error", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Database error");
    }
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello from Docker!");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

