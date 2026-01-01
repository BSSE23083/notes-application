const logger = require('../utils/logger');
const { PutCommand, GetCommand, DeleteCommand, QueryCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

class NotesController {
  // GET ALL NOTES FOR A USER
  async getNotes(req, res, next) {
    try {
      const userId = req.userId;
      const docClient = req.app.get('db');

      const command = new QueryCommand({
        TableName: "Notes",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
      });

      const data = await docClient.send(command);
      const notes = data.Items || [];

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

  // GET A SINGLE NOTE BY ID
  async getNoteById(req, res, next) {
    try {
      const { noteId } = req.params;
      const userId = req.userId;
      const docClient = req.app.get('db');

      const command = new GetCommand({
        TableName: "Notes",
        Key: { userId, noteId },
      });

      const { Item: note } = await docClient.send(command);

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

  // CREATE A NEW NOTE
  async createNote(req, res, next) {
    try {
      const { title, content } = req.body;
      const userId = req.userId;
      const docClient = req.app.get('db');

      if (!content || content.trim() === '') {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Note content is required',
        });
      }

      const note = {
        userId: userId,
        noteId: Date.now().toString(),
        title: title || 'Untitled',
        content,
        createdAt: new Date().toISOString(),
      };

      const command = new PutCommand({
        TableName: "Notes",
        Item: note,
      });

      await docClient.send(command);

      logger.info(`Note created: ${note.noteId} for user ${userId}`);

      res.status(201).json({
        message: 'Note created successfully',
        note,
      });
    } catch (error) {
      logger.error('Create note error', error.message);
      next(error);
    }
  }

  // UPDATE AN EXISTING NOTE
  async updateNote(req, res, next) {
    try {
      const { noteId } = req.params;
      const { title, content } = req.body;
      const userId = req.userId;
      const docClient = req.app.get('db');

      if (content !== undefined && (!content || content.trim() === '')) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Note content cannot be empty',
        });
      }

      const command = new UpdateCommand({
        TableName: "Notes",
        Key: { userId, noteId },
        UpdateExpression: "set title = :t, content = :c, updatedAt = :u",
        ExpressionAttributeValues: {
          ":t": title || 'Untitled',
          ":c": content,
          ":u": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      });

      const data = await docClient.send(command);

      logger.info(`Note updated: ${noteId}`);

      res.json({
        message: 'Note updated successfully',
        note: data.Attributes,
      });
    } catch (error) {
      logger.error('Update note error', error.message);
      next(error);
    }
  }

  // DELETE A NOTE
  async deleteNote(req, res, next) {
    try {
      const { noteId } = req.params;
      const userId = req.userId;
      const docClient = req.app.get('db');

      const command = new DeleteCommand({
        TableName: "Notes",
        Key: { userId, noteId },
      });

      await docClient.send(command);
      logger.info(`Note deleted: ${noteId}`);

      res.json({
        message: 'Note deleted successfully',
      });
    } catch (error) {
      logger.error('Delete note error', error.message);
      next(error);
    }
  }

  // GET STATS
  async getStats(req, res, next) {
    try {
      const userId = req.userId;
      const docClient = req.app.get('db');

      const command = new QueryCommand({
        TableName: "Notes",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
      });

      const data = await docClient.send(command);
      const notes = data.Items || [];

      res.json({
        message: 'Statistics retrieved successfully',
        stats: {
          totalNotes: notes.length,
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