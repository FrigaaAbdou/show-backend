require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// ✅ CORS must come early
const allowedOrigins = [
  'https://cesi-app.netlify.app',
  'https://deploy-preview-2--cesi-app.netlify.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use(helmet());

// ✅ Routes (after middleware)
app.get('/item', (req, res) => {
  res.send('item route works!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const itemsRouter = require('./routes/item');
app.use('/api/item', itemsRouter);

const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
