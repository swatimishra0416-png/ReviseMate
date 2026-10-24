
const mongoose = require('mongoose');

const generatedQuizSchema = new mongoose.Schema(
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
    sourceType: {
      type: String,
      required: true,
      enum: ['note', 'text', 'pdf', 'docx', 'webpage', 'youtube']
    },
    sourceName: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
          trim: true
        },
        options: {
          type: [String],
          required: true,
          validate: {
            validator: options =>
              Array.isArray(options) &&
              options.length === 4 &&
              options.every(option =>
                typeof option === 'string' && option.trim().length > 0
              ),
            message: 'Each question must have four non-empty options.'
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
          trim: true
        }
      }
    ]
  },
  { timestamps: true }
);

generatedQuizSchema.pre('validate', function () {
  for (const question of this.questions) {
    if (
      Array.isArray(question.options) &&
      !question.options.includes(question.correctAnswer)
    ) {
      question.invalidate(
        'correctAnswer',
        'The correct answer must match one of the four options.'
      );
    }
  }
});

module.exports = mongoose.model('GeneratedQuiz', generatedQuizSchema);
