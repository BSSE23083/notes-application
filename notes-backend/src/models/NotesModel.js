const { v4: uuidv4 } = require('uuid');

class NotesModel {
  constructor() {
    this.notes = [];
  }

  createNote(userId, noteData) {
    const note = {
      id: uuidv4(),
      userId,
      title: noteData.title || 'Untitled',
      content: noteData.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notes.push(note);
    return note;
  }

  getNotesByUserId(userId) {
    return this.notes.filter((note) => note.userId === userId);
  }

  getNoteById(noteId, userId) {
    return (
      this.notes.find((note) => note.id === noteId && note.userId === userId) ||
      null
    );
  }

  updateNote(noteId, userId, noteData) {
    const noteIndex = this.notes.findIndex(
      (note) => note.id === noteId && note.userId === userId
    );

    if (noteIndex === -1) {
      return null;
    }

    this.notes[noteIndex] = {
      ...this.notes[noteIndex],
      ...noteData,
      updatedAt: new Date().toISOString(),
    };

    return this.notes[noteIndex];
  }

  deleteNote(noteId, userId) {
    const initialLength = this.notes.length;

    this.notes = this.notes.filter(
      (note) => !(note.id === noteId && note.userId === userId)
    );

    return this.notes.length < initialLength;
  }

  getNoteCount(userId) {
    return this.notes.filter((note) => note.userId === userId).length;
  }

  clearAll() {
    this.notes = [];
  }
}

module.exports = new NotesModel();
