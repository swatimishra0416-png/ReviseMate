
const dns = require('node:dns');
dns.setServers(['8.8.8.8']);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Note = require('./models/Note');
const Flashcard = require('./models/Flashcard');

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

// Reusable input validation
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

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'ReviseMate backend is running!',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

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

// Handle malformed JSON and oversized requests
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

// Connect to MongoDB before accepting requests
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


// GET: Fetch all flashcards, newest first
app.get('/api/flashcards', async (req, res) => {
  try {
    const flashcards = await Flashcard.find().sort({ updatedAt: -1 });
    res.json(flashcards);
  } catch (error) {
    console.error('Fetch flashcards error:', error.message);
    res.status(500).json({ message: 'Failed to fetch flashcards.' });
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
    res.status(500).json({ message: 'Failed to create flashcard.' });
  }
});

// PUT: Update a flashcard
app.put('/api/flashcards/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid flashcard ID.' });
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
      { new: true, runValidators: true }
    );

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found.' });
    }

    res.json(flashcard);
  } catch (error) {
    console.error('Update flashcard error:', error.message);
    res.status(500).json({ message: 'Failed to update flashcard.' });
  }
});

app.patch('/api/flashcards/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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
    console.error('Error updating flashcard status:', error);

    res.status(500).json({
      message: 'Could not update flashcard status.'
    });
  }
});


// DELETE: Delete a flashcard
app.delete('/api/flashcards/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid flashcard ID.' });
    }

    const flashcard = await Flashcard.findByIdAndDelete(req.params.id);

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found.' });
    }

    res.json({ message: 'Flashcard deleted successfully.' });
  } catch (error) {
    console.error('Delete flashcard error:', error.message);
    res.status(500).json({ message: 'Failed to delete flashcard.' });
  }
});
