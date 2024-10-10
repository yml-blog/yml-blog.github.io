const express = require('express');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/workplace_complaints', { useNewUrlParser: true, useUnifiedTopology: true });

// User model
const User = mongoose.model('User', {
  username: String,
  password: String
});

// Complaint model
const Complaint = mongoose.model('Complaint', {
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  isPublic: Boolean,
  createdAt: { type: Date, default: Date.now }
});

// User registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).send('User registered');
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
    res.json({ token });
  } else {
    res.status(400).send('Invalid credentials');
  }
});

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied');
  try {
    const verified = jwt.verify(token, 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Submit a complaint
app.post('/complaints', authenticate, async (req, res) => {
  const { content, isPublic } = req.body;
  const complaint = new Complaint({ user: req.user.userId, content, isPublic });
  await complaint.save();
  res.status(201).send('Complaint submitted');
});

// Get public complaints
app.get('/complaints/public', async (req, res) => {
  const complaints = await Complaint.find({ isPublic: true }).populate('user', 'username');
  res.json(complaints);
});

// Get user's own complaints
app.get('/complaints/my', authenticate, async (req, res) => {
  const complaints = await Complaint.find({ user: req.user.userId });
  res.json(complaints);
});

app.listen(3000, () => console.log('Server running on port 3000'));
