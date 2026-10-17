
const dns = require('node:dns');
dns.setServers(['8.8.8.8']);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Note = require('./models/Note');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'ReviseMate backend is running!',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

// GET: Fetch all notes, newest first
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Fetch notes error:', error.message);
    res.status(500).json({ message: 'Failed to fetch notes.' });
  }
});

// GET: Fetch one note
app.get('/api/notes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID.' });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    res.json(note);
  } catch (error) {
    console.error('Fetch note error:', error.message);
    res.status(500).json({ message: 'Failed to fetch note.' });
  }
});

// POST: Create a note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, subject, content } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof subject !== 'string' ||
      typeof content !== 'string' ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: 'Title, subject, and non-empty content are required.'
      });
    }

    const note = await Note.create({
      title: title.trim(),
      subject,
      content
    });

    res.status(201).json(note);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Create note error:', error.message);
    res.status(500).json({ message: 'Failed to create note.' });
  }
});

// PUT: Update a note
app.put('/api/notes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID.' });
    }

    const { title, subject, content } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof subject !== 'string' ||
      typeof content !== 'string' ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: 'Title, subject, and non-empty content are required.'
      });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        subject,
        content
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    res.json(note);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Update note error:', error.message);
    res.status(500).json({ message: 'Failed to update note.' });
  }
});

// DELETE: Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID.' });
    }

    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    console.error('Delete note error:', error.message);
    res.status(500).json({ message: 'Failed to delete note.' });
  }
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
      console.log(`ReviseMate backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
