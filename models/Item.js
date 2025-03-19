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
      validator: function (value) {
        if (!value) return true; // si vide, laisser passer (ou ajouter required: true si nécessaire)
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount <= MAX_WORDS;
      },
      message: (props) =>
        `La description doit contenir au maximum ${MAX_WORDS} mots, mais en contient ${props.value ? props.value.trim().split(/\s+/).length : 0}.`,
    },
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
    default: '',
  },
  formationDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);