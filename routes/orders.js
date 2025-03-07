const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { products, totalPrice } = req.body;
    // Associate the order with the currently logged in user
    const order = new Order({ 
      user: req.user.id, 
      products, 
      totalPrice 
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get orders
// - Admins get all orders
// - Regular users get only their orders
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find().populate('user products.product');
    } else {
      orders = await Order.find({ user: req.user.id }).populate('products.product');
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single order by ID (accessible by admin or order owner)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only admin or the user who placed the order can access it
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an order by ID
// For example, admins may update any order's status, while a user might cancel their own order
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Check authorization: allow update if admin or if order belongs to user
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(order, updateData);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an order by ID (accessible by admin or order owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Only admin or the order owner can delete
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // If the order is not pending and the requester is not admin, prevent deletion
    if (order.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Order cannot be deleted after it is processed' });
    }
    
    await order.deleteOne();
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;