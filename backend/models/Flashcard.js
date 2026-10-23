
const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ['needs-revision', 'known'],
      default: 'needs-revision'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Flashcard', flashcardSchema);
