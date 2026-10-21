
const dns = require('node:dns');
dns.setServers(['8.8.8.8']);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Note = require('./models/Note');
const Flashcard = require('./models/Flashcard');
const MindMap = require('./models/MindMap');
const QuizQuestion = require('./models/QuizQuestion');
const QuizAttempt = require('./models/QuizAttempt');

const app = express();
const PORT = process.env.PORT || 3000;


// Hide Express technology details from response headers
app.disable('x-powered-by');

// Allow requests from the local Angular development server
app.use(cors({
  origin: 'http://localhost:4200'
}));

// Limit incoming JSON request size
app.use(express.json({ limit: '2mb' }));

// Allowed subjects
const allowedSubjects = [
  'Computer Networks',
  'DBMS',
  'Operating Systems',
  'Data Structures'
];

const allowedMindMapSubjects = [
  'Computer Networks',
  'DBMS',
  'Operating Systems',
  'Data Structures'
];

// ==================================================
// NOTE VALIDATION
// ==================================================

function validateNoteInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'A valid JSON object is required.';
  }

  const { title, subject, content } = body;

  if (typeof title !== 'string' || !title.trim()) {
    return 'A non-empty title is required.';
  }

  if (title.trim().length > 200) {
    return 'Title cannot exceed 200 characters.';
  }

  if (
    typeof subject !== 'string' ||
    !allowedSubjects.includes(subject)
  ) {
    return 'Please select a valid subject.';
  }

  if (typeof content !== 'string' || !content.trim()) {
    return 'Non-empty study material is required.';
  }

  if (content.length > 100000) {
    return 'Study material cannot exceed 100,000 characters.';
  }

  return null;
}

// ==================================================
// HEALTH CHECK
// ==================================================

app.get('/', (req, res) => {
  res.json({
    message: 'ReviseMate backend is running!',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

// ==================================================
// NOTES API
// ==================================================

// GET: Fetch all notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Fetch notes error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch notes.'
    });
  }
});

// GET: Fetch one note
app.get('/api/notes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid note ID.'
      });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: 'Note not found.'
      });
    }

    res.json(note);
  } catch (error) {
    console.error('Fetch note error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch note.'
    });
  }
});

// POST: Create a note
app.post('/api/notes', async (req, res) => {
  const validationError = validateNoteInput(req.body);

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  try {
    const { title, subject, content } = req.body;

    const note = await Note.create({
      title: title.trim(),
      subject,
      content: content.trim()
    });

    res.status(201).json(note);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'The note contains invalid data.'
      });
    }

    console.error('Create note error:', error.message);
    res.status(500).json({
      message: 'Failed to create note.'
    });
  }
});

// PUT: Update a note
app.put('/api/notes/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: 'Invalid note ID.'
    });
  }

  const validationError = validateNoteInput(req.body);

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  try {
    const { title, subject, content } = req.body;

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        subject,
        content: content.trim()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!note) {
      return res.status(404).json({
        message: 'Note not found.'
      });
    }

    res.json(note);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'The note contains invalid data.'
      });
    }

    console.error('Update note error:', error.message);
    res.status(500).json({
      message: 'Failed to update note.'
    });
  }
});

// DELETE: Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: 'Invalid note ID.'
    });
  }

  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: 'Note not found.'
      });
    }

    res.json({
      message: 'Note deleted successfully.'
    });
  } catch (error) {
    console.error('Delete note error:', error.message);
    res.status(500).json({
      message: 'Failed to delete note.'
    });
  }
});

// ==================================================
// FLASHCARDS API
// ==================================================

// GET: Fetch all flashcards, newest first
app.get('/api/flashcards', async (req, res) => {
  try {
    const flashcards = await Flashcard.find().sort({ updatedAt: -1 });
    res.json(flashcards);
  } catch (error) {
    console.error('Fetch flashcards error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch flashcards.'
    });
  }
});

// POST: Create a flashcard
app.post('/api/flashcards', async (req, res) => {
  try {
    const { question, answer, subject } = req.body || {};

    if (
      typeof question !== 'string' ||
      !question.trim() ||
      question.trim().length > 1000 ||
      typeof answer !== 'string' ||
      !answer.trim() ||
      answer.trim().length > 5000 ||
      typeof subject !== 'string' ||
      !allowedSubjects.includes(subject)
    ) {
      return res.status(400).json({
        message: 'Enter a valid question, answer, and subject.'
      });
    }

    const flashcard = await Flashcard.create({
      question: question.trim(),
      answer: answer.trim(),
      subject
    });

    res.status(201).json(flashcard);
  } catch (error) {
    console.error('Create flashcard error:', error.message);
    res.status(500).json({
      message: 'Failed to create flashcard.'
    });
  }
});

// PUT: Update a flashcard
app.put('/api/flashcards/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid flashcard ID.'
      });
    }

    const { question, answer, subject } = req.body || {};

    if (
      typeof question !== 'string' ||
      !question.trim() ||
      question.trim().length > 1000 ||
      typeof answer !== 'string' ||
      !answer.trim() ||
      answer.trim().length > 5000 ||
      typeof subject !== 'string' ||
      !allowedSubjects.includes(subject)
    ) {
      return res.status(400).json({
        message: 'Enter a valid question, answer, and subject.'
      });
    }

    const flashcard = await Flashcard.findByIdAndUpdate(
      req.params.id,
      {
        question: question.trim(),
        answer: answer.trim(),
        subject
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!flashcard) {
      return res.status(404).json({
        message: 'Flashcard not found.'
      });
    }

    res.json(flashcard);
  } catch (error) {
    console.error('Update flashcard error:', error.message);
    res.status(500).json({
      message: 'Failed to update flashcard.'
    });
  }
});

// PATCH: Update flashcard status
app.patch('/api/flashcards/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid flashcard ID.'
      });
    }

    if (!['needs-revision', 'known'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be needs-revision or known.'
      });
    }

    const flashcard = await Flashcard.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!flashcard) {
      return res.status(404).json({
        message: 'Flashcard not found.'
      });
    }

    res.json(flashcard);
  } catch (error) {
    console.error('Error updating flashcard status:', error.message);
    res.status(500).json({
      message: 'Could not update flashcard status.'
    });
  }
});

// DELETE: Delete a flashcard
app.delete('/api/flashcards/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid flashcard ID.'
      });
    }

    const flashcard = await Flashcard.findByIdAndDelete(req.params.id);

    if (!flashcard) {
      return res.status(404).json({
        message: 'Flashcard not found.'
      });
    }

    res.json({
      message: 'Flashcard deleted successfully.'
    });
  } catch (error) {
    console.error('Delete flashcard error:', error.message);
    res.status(500).json({
      message: 'Failed to delete flashcard.'
    });
  }
});

// ==================================================
// MIND MAPS API
// ==================================================

// GET: Fetch all saved mind maps
app.get('/api/mindmaps', async (req, res) => {
  try {
    const mindMaps = await MindMap.find().sort({ subject: 1 });
    res.json(mindMaps);
  } catch (error) {
    console.error('Error fetching mind maps:', error.message);
    res.status(500).json({
      message: 'Could not fetch mind maps.'
    });
  }
});

// GET: Fetch a mind map for one subject
app.get('/api/mindmaps/:subject', async (req, res) => {
  try {
    const subject = req.params.subject;

    if (!allowedMindMapSubjects.includes(subject)) {
      return res.status(400).json({
        message: 'Invalid subject.'
      });
    }

    const mindMap = await MindMap.findOne({ subject });

    if (!mindMap) {
      return res.status(404).json({
        message: 'Mind map not found for this subject.'
      });
    }

    res.json(mindMap);
  } catch (error) {
    console.error('Error fetching subject mind map:', error.message);
    res.status(500).json({
      message: 'Could not fetch the mind map.'
    });
  }
});

// PUT: Create or save a mind map for a subject
app.put('/api/mindmaps/:subject', async (req, res) => {
  try {
    const subject = req.params.subject;
    const body = req.body || {};
    const { centralTopic, topics } = body;

    if (!allowedMindMapSubjects.includes(subject)) {
      return res.status(400).json({
        message: 'Invalid subject.'
      });
    }

    if (
      typeof centralTopic !== 'string' ||
      !centralTopic.trim() ||
      centralTopic.trim().length > 150
    ) {
      return res.status(400).json({
        message: 'A valid central topic is required.'
      });
    }

    if (!Array.isArray(topics) || topics.length > 100) {
      return res.status(400).json({
        message: 'Topics must be an array containing at most 100 topics.'
      });
    }

    for (const topic of topics) {
      if (
        !topic ||
        typeof topic.title !== 'string' ||
        !topic.title.trim() ||
        topic.title.trim().length > 100 ||
        !Array.isArray(topic.subtopics) ||
        topic.subtopics.length > 100
      ) {
        return res.status(400).json({
          message: 'Each topic must have a valid title and subtopics array.'
        });
      }

      if (
        topic.subtopics.some(
          subtopic =>
            typeof subtopic !== 'string' ||
            !subtopic.trim() ||
            subtopic.trim().length > 150
        )
      ) {
        return res.status(400).json({
          message: 'Each subtopic must be a non-empty string of at most 150 characters.'
        });
      }
    }

    const cleanTopics = topics.map(topic => ({
      title: topic.title.trim(),
      subtopics: topic.subtopics.map(subtopic => subtopic.trim())
    }));

    const mindMap = await MindMap.findOneAndUpdate(
      { subject },
      {
        $set: {
          subject,
          centralTopic: centralTopic.trim(),
          topics: cleanTopics
        }
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json(mindMap);
  } catch (error) {
    console.error('Error saving mind map:', error.message);
    res.status(500).json({
      message: 'Could not save the mind map.'
    });
  }
});

// DELETE: Delete a saved mind map for a subject
app.delete('/api/mindmaps/:subject', async (req, res) => {
  try {
    const subject = req.params.subject;

    if (!allowedMindMapSubjects.includes(subject)) {
      return res.status(400).json({
        message: 'Invalid subject.'
      });
    }

    const mindMap = await MindMap.findOneAndDelete({ subject });

    if (!mindMap) {
      return res.status(404).json({
        message: 'Mind map not found.'
      });
    }

    res.json({
      message: 'Mind map deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting mind map:', error.message);
    res.status(500).json({
      message: 'Could not delete the mind map.'
    });
  }
});

// ==================================================
// ERROR-HANDLING MIDDLEWARE
// Keep this AFTER all API routes
// ==================================================

/* ==================================================
   QUIZ ATTEMPTS API
================================================== */

// POST: Save a completed quiz attempt
app.post('/api/quiz/attempts', async (req, res) => {
  try {
    const { subject, score, totalQuestions } = req.body || {};

    const allowedSubjects = [
      'Computer Networks',
      'DBMS',
      'Operating Systems',
      'Data Structures'
    ];

    if (!allowedSubjects.includes(subject)) {
      return res.status(400).json({
        message: 'Invalid subject.'
      });
    }

    if (
      !Number.isInteger(score) ||
      !Number.isInteger(totalQuestions) ||
      totalQuestions < 1 ||
      score < 0 ||
      score > totalQuestions
    ) {
      return res.status(400).json({
        message: 'Score and total questions must be valid integers.'
      });
    }

    const attempt = await QuizAttempt.create({
      subject,
      score,
      totalQuestions,
      completedAt: new Date()
    });

    return res.status(201).json({
      message: 'Quiz attempt saved successfully.',
      attempt
    });
  } catch (error) {
    console.error('Save quiz attempt error:', error.message);

    return res.status(500).json({
      message: 'Could not save quiz attempt.'
    });
  }
});

// GET: Retrieve quiz attempt history
app.get('/api/quiz/attempts', async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = {};

    if (subject) {
      const allowedSubjects = [
        'Computer Networks',
        'DBMS',
        'Operating Systems',
        'Data Structures'
      ];

      if (!allowedSubjects.includes(subject)) {
        return res.status(400).json({
          message: 'Invalid subject.'
        });
      }

      filter.subject = subject;
    }

    const attempts = await QuizAttempt.find(filter)
      .sort({ completedAt: -1 })
      .limit(100);

    return res.json(attempts);
  } catch (error) {
    console.error('Fetch quiz attempts error:', error.message);

    return res.status(500).json({
      message: 'Could not fetch quiz attempts.'
    });
  }
});


/* ==================================================
   QUIZ QUESTIONS API
================================================== */

// GET: Fetch quiz questions, optionally filtered by subject
app.get('/api/quiz/questions', async (req, res) => {
  try {
    const { subject } = req.query;

    const filter = {};

    if (subject) {
      if (!allowedSubjects.includes(subject)) {
        return res.status(400).json({
          message: 'Invalid subject.'
        });
      }

      filter.subject = subject;
    }

    const questions = await QuizQuestion.find(filter)
      .select('-correctAnswer -explanation')
      .sort({ createdAt: 1 });

    res.json(questions);
  } catch (error) {
    console.error('Fetch quiz questions error:', error.message);

    res.status(500).json({
      message: 'Could not fetch quiz questions.'
    });
  }
});

// GET: Fetch the answer and explanation for a question
app.get('/api/quiz/questions/:id/answer', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid question ID.'
      });
    }

    const question = await QuizQuestion.findById(req.params.id)
      .select('correctAnswer explanation');

    if (!question) {
      return res.status(404).json({
        message: 'Question not found.'
      });
    }

    res.json({
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
  } catch (error) {
    console.error('Fetch quiz answer error:', error.message);

    res.status(500).json({
      message: 'Could not fetch the answer.'
    });
  }
});

// POST: Create a quiz question
app.post('/api/quiz/questions', async (req, res) => {
  try {
    const {
      subject,
      question,
      options,
      correctAnswer,
      explanation
    } = req.body || {};

    if (!allowedSubjects.includes(subject)) {
      return res.status(400).json({
        message: 'Please select a valid subject.'
      });
    }

    if (
      typeof question !== 'string' ||
      !question.trim() ||
      question.trim().length > 1000
    ) {
      return res.status(400).json({
        message: 'Enter a valid question.'
      });
    }

    if (
      !Array.isArray(options) ||
      options.length !== 4 ||
      !options.every(
        option =>
          typeof option === 'string' &&
          option.trim().length > 0
      )
    ) {
      return res.status(400).json({
        message: 'Provide exactly four non-empty options.'
      });
    }

    if (
      typeof correctAnswer !== 'string' ||
      !options.some(
        option => option.trim() === correctAnswer.trim()
      )
    ) {
      return res.status(400).json({
        message: 'The correct answer must match one of the options.'
      });
    }

    if (
      typeof explanation !== 'string' ||
      !explanation.trim() ||
      explanation.trim().length > 2000
    ) {
      return res.status(400).json({
        message: 'Enter a valid explanation.'
      });
    }

    const newQuestion = await QuizQuestion.create({
      subject,
      question: question.trim(),
      options: options.map(option => option.trim()),
      correctAnswer: correctAnswer.trim(),
      explanation: explanation.trim()
    });

    res.status(201).json({
      message: 'Quiz question created successfully.',
      question: {
        _id: newQuestion._id,
        subject: newQuestion.subject,
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        explanation: newQuestion.explanation
      }
    });
  } catch (error) {
    console.error('Create quiz question error:', error.message);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Could not create the quiz question.'
    });
  }
});

// DELETE: Delete a quiz question
app.delete('/api/quiz/questions/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid question ID.'
      });
    }

    const question = await QuizQuestion.findByIdAndDelete(
      req.params.id
    );

    if (!question) {
      return res.status(404).json({
        message: 'Question not found.'
      });
    }

    res.json({
      message: 'Quiz question deleted successfully.'
    });
  } catch (error) {
    console.error('Delete quiz question error:', error.message);

    res.status(500).json({
      message: 'Could not delete the quiz question.'
    });
  }
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Invalid JSON in request body.'
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'Request body is too large.'
    });
  }

  console.error('Request error:', error.message);

  res.status(500).json({
    message: 'An unexpected server error occurred.'
  });
});

// ==================================================
// START SERVER AFTER ALL ROUTES ARE REGISTERED
// ==================================================

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from the .env file.');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(
        `ReviseMate backend running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
