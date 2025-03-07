require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();


// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: 'https://test-depoly-app.netlify.app', // Allow only the frontend
  credentials: true,
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const itemsRouter = require('./routes/item');
app.use('/api/item', itemsRouter);

const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);

// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));