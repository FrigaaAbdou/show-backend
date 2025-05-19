require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.get('/item', (req, res) => {
  res.send('item route works!');
});

// Middleware
app.use(express.json());
const allowedOrigins = [
  'https://cesi-app.netlify.app',                     // Production Netlify URL
  'https://deploy-preview-2--cesi-app.netlify.app',   // Preview deploys
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Only if you're using cookies/auth
}));
app.use(cors());

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
