const express = require('express');
const notesController = require('../controllers/notesController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Notes CRUD Routes
router.get('/', notesController.getNotes.bind(notesController));
router.get('/stats', notesController.getStats.bind(notesController));
router.post('/', notesController.createNote.bind(notesController));
router.get('/:noteId', notesController.getNoteById.bind(notesController));
router.put('/:noteId', notesController.updateNote.bind(notesController));
router.delete('/:noteId', notesController.deleteNote.bind(notesController));

module.exports = router;
