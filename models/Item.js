// models/Item.js
const mongoose = require('mongoose');

const MAX_WORDS = 100;

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        if (!value) return true; // if empty, let it pass (or add required: true if necessary)
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount <= MAX_WORDS;
      },
      message: props =>
        `Full description must be at most ${MAX_WORDS} words, but got ${props.value ? props.value.trim().split(/\s+/).length : 0}.`
    }
  },
  fullDescription: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  imgLink: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);