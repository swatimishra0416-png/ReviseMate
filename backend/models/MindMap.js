
const mongoose = require('mongoose');

const mindMapTopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    subtopics: {
      type: [String],
      default: []
    }
  },
  {
    _id: false
  }
);

const mindMapSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    centralTopic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    topics: {
      type: [mindMapTopicSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MindMap', mindMapSchema);
