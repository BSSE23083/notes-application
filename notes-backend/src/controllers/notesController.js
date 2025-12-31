const NotesModel = require('../models/NotesModel');
const logger = require('../utils/logger');

class NotesController {
  async getNotes(req, res, next) {
    try {
      const userId = req.userId;
      const notes = NotesModel.getNotesByUserId(userId);
      logger.debug(`Fetched ${notes.length} notes for user ${userId}`);

      res.json({
        message: 'Notes retrieved successfully',
        notes,
        count: notes.length,
      });
    } catch (error) {
      logger.error('Get notes error', error.message);
      next(error);
    }
  }

  async getNoteById(req, res, next) {
    try {
      const { noteId } = req.params;
      const userId = req.userId;

      const note = NotesModel.getNoteById(noteId, userId);

      if (!note) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Note not found',
        });
      }

      res.json({
        message: 'Note retrieved successfully',
        note,
      });
    } catch (error) {
      logger.error('Get note error', error.message);
      next(error);
    }
  }

  async createNote(req, res, next) {
    try {
      const { title, content } = req.body;
      const userId = req.userId;

      if (!content || content.trim() === '') {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Note content is required',
        });
      }

      const note = NotesModel.createNote(userId, {
        title: title || 'Untitled',
        content,
      });

      logger.info(`Note created: ${note.id} for user ${userId}`);

      res.status(201).json({
        message: 'Note created successfully',
        note,
      });
    } catch (error) {
      logger.error('Create note error', error.message);
      next(error);
    }
  }

  async updateNote(req, res, next) {
    try {
      const { noteId } = req.params;
      const { title, content } = req.body;
      const userId = req.userId;

      const note = NotesModel.getNoteById(noteId, userId);

      if (!note) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Note not found',
        });
      }

      if (content !== undefined && (!content || content.trim() === '')) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Note content cannot be empty',
        });
      }

      const updatedNote = NotesModel.updateNote(noteId, userId, {
        title: title || note.title,
        content: content !== undefined ? content : note.content,
      });

      logger.info(`Note updated: ${noteId}`);

      res.json({
        message: 'Note updated successfully',
        note: updatedNote,
      });
    } catch (error) {
      logger.error('Update note error', error.message);
      next(error);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const { noteId } = req.params;
      const userId = req.userId;

      const note = NotesModel.getNoteById(noteId, userId);

      if (!note) {
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Note not found',
        });
      }

      NotesModel.deleteNote(noteId, userId);
      logger.info(`Note deleted: ${noteId}`);

      res.json({
        message: 'Note deleted successfully',
      });
    } catch (error) {
      logger.error('Delete note error', error.message);
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const userId = req.userId;
      const count = NotesModel.getNoteCount(userId);
      const notes = NotesModel.getNotesByUserId(userId);

      res.json({
        message: 'Statistics retrieved successfully',
        stats: {
          totalNotes: count,
          totalCharacters: notes.reduce((sum, n) => sum + n.content.length, 0),
        },
      });
    } catch (error) {
      logger.error('Get stats error', error.message);
      next(error);
    }
  }
}

module.exports = new NotesController();
