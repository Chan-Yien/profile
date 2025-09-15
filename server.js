const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studentProfile', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Message schema
const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String
});
const Message = mongoose.model('Message', MessageSchema);

// User schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', UserSchema);

// Contact form route
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(200).json({ message: 'Message saved successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

// Admin dashboard route
app.get('/messages', async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: 'User registered!' });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, 'secretkey');
  res.json({ message: 'Login successful', token });
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
