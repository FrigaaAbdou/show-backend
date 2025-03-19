const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Item = require('../models/Item'); // Import Item model
const { verifyToken } = require('../middleware/auth');

// Add an item to the cart
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Check if the item exists
    const product = await Item.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
    } else {
      cart = new Cart({ userId, products: [{ productId, quantity }] });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Retrieve user's cart
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate('products.productId', 'name price imgLink description')
      .lean();

    if (!cart) {
      return res.json({ count: 0, products: [] });
    }

    res.json({ count: cart.products.length, cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update item quantity in the cart
router.put('/:userId/:productId', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const productIndex = cart.products.findIndex(p => p.productId.toString() === req.params.productId);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove an item from the cart
router.delete('/:userId/:productId', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { $pull: { products: { productId: req.params.productId } } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json({ message: 'Item removed from cart', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear entire cart
router.delete('/:userId', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ userId: req.params.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart is already empty' });
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;