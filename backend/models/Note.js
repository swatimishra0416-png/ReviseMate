
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 100000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Note', noteSchema);
