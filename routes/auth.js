// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    let { username, email, password, role, adminSecret } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // If role is set to admin, validate the admin secret.
    // Otherwise, default to "user"
    if (role === 'admin') {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid admin secret' });
      }
    } else {
      role = 'user';
    }
    
    const newUser = new User({ username, email, password, role });
    await newUser.save();
    
    // Create a JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login an existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Compare password (ensure your User model has a comparePassword method)
    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.status(200).json({
      token,
      user: {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 1. GET ALL USERS (Admin only)
router.get('/all', auth, async (req, res) => {
  try {
    // Check if the user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const allUsers = await User.find().select('-password'); // Exclude password field
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET a single user by ID (admin or the user themself)
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if the request user is admin or the same user
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Find the user by ID, excluding the password field
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. UPDATE USER BY ID (Admin or the user themself)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if the request user is admin or the same user
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Prevent updating the role if not admin
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change roles' });
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password in response

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE USER BY ID (Admin or the user themself)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if the request user is admin or the same user
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;