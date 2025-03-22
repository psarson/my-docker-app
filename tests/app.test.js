const request = require('supertest');
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Mock Database (Use a testing database later)
const users = [];

// Mock Routes for Testing
app.get('/db', (req, res) => {
  res.json(users);
});

app.post('/db', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);

  res.status(201).json(newUser);
});

describe('Testing API Endpoints', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/db')
      .send({ name: 'John Doe', email: 'john@example.com' });
      
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('John Doe');
  });

  it('should not create a user with existing email', async () => {
    const response = await request(app)
      .post('/db')
      .send({ name: 'Jane Doe', email: 'john@example.com' });

    expect(response.statusCode).toBe(409);
  });

  it('should return all users', async () => {
    const response = await request(app).get('/db');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });
});
