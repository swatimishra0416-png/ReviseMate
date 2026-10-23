
const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (options) {
          return (
            options.length === 4 &&
            options.every(option =>
              typeof option === 'string' && option.trim().length > 0
            )
          );
        },
        message: 'Each question must have exactly four non-empty options.'
      }
    },

    correctAnswer: {
      type: String,
      required: true,
      trim: true
    },

    explanation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    }
  },
  {
    timestamps: true
  }
);

// Ensure the correct answer is one of the provided options.
quizQuestionSchema.pre('validate', function () {
  if (
    Array.isArray(this.options) &&
    !this.options.includes(this.correctAnswer)
  ) {
    this.invalidate(
      'correctAnswer',
      'The correct answer must match one of the four options.'
    );
  }
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
