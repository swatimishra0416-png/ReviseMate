
const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      enum: [
        'Computer Networks',
        'DBMS',
        'Operating Systems',
        'Data Structures'
      ]
    },

    score: {
      type: Number,
      required: true,
      min: 0
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },

    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

quizAttemptSchema.pre('validate', function () {
  if (this.score > this.totalQuestions) {
    this.invalidate(
      'score',
      'Score cannot exceed the total number of questions.'
    );
  }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
