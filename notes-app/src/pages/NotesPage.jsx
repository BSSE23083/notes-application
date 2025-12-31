import ReactMarkdown from 'react-markdown';

import React, { useState, useEffect } from 'react';
import notesApi from '../api/notesApi';
import '../App.css';
import '../styles/Modal.css';
import GeminiChatSidebar from '../components/GeminiChatSidebar';

const NotesPage = ({ onLogout }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await notesApi.getNotes();
      const arr = response.notes || response || [];
      arr.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );
      setNotes(arr);
      if (!editingNote && arr.length > 0) {
        setEditingNote(arr[0]);
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Error loading notes');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const handleNewPage = () => {
    setEditingNote({ title: '', content: '' });
  };

  const handleSelectPage = (note) => {
    setEditingNote(note);
  };

  const handleDeletePage = async (noteId) => {
    try {
      setError('');
      await notesApi.deleteNote(noteId);
      const remaining = notes.filter((n) => n.id !== noteId);
      setNotes(remaining);
      if (editingNote && editingNote.id === noteId) {
        setEditingNote(remaining[0] || null);
      }
    } catch (err) {
      setError(err.message || 'Error deleting page');
    }
  };

  const handleSavePage = async () => {
    if (!editingNote || !editingNote.content?.trim()) return;
    setSaving(true);
    try {
      setError('');
      if (editingNote.id) {
        await notesApi.updateNote(editingNote.id, {
          title: editingNote.title,
          content: editingNote.content,
        });
      } else {
        const created = await notesApi.createNote({
          title: editingNote.title,
          content: editingNote.content,
        });
        setEditingNote(created);
      }
      await loadNotes();
    } catch (err) {
      setError(err.message || 'Error saving page');
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (value) => {
    setEditingNote((prev) => (prev ? { ...prev, title: value } : prev));
  };

  const handleContentChange = (value) => {
    setEditingNote((prev) => (prev ? { ...prev, content: value } : prev));
  };

  // Called when clicking "Use in note" in chat
  const handleAppendFromChat = (text) => {
    setEditingNote((prev) => {
      if (!prev) return prev;
      const existing = prev.content || '';
      const appended = existing ? `${existing}\n\n${text}` : text;
      return { ...prev, content: appended };
    });
  };

  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="workspace-name">My Notes</div>
        </div>

        <button className="sidebar-new-page" onClick={handleNewPage}>
          + New page
        </button>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">All pages</div>
          {loading ? (
            <div className="sidebar-loading">Loading…</div>
          ) : notes.length === 0 ? (
            <button
              className="sidebar-item sidebar-item-active"
              type="button"
            >
              No pages yet
            </button>
          ) : (
            notes.map((note) => {
              const isActive = editingNote && editingNote.id === note.id;
              return (
                <div
                  key={note.id}
                  className={
                    'sidebar-page-row' +
                    (isActive ? ' sidebar-page-row-active' : '')
                  }
                >
                  <button
                    type="button"
                    className={
                      'sidebar-item' + (isActive ? ' sidebar-item-active' : '')
                    }
                    onClick={() => handleSelectPage(note)}
                  >
                    {note.title || 'Untitled'}
                  </button>
                  <button
                    type="button"
                    className="sidebar-page-delete"
                    onClick={() => handleDeletePage(note.id)}
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </nav>
      </aside>

      <main className="notion-main">
        <div className="header">
          <div className="header-left">
            <h1>Notes</h1>
            <p className="subtitle">Minimal Notion-style workspace</p>
          </div>
          <button className="btn-logout" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {!editingNote ? (
          <p className="empty-state">
            Select a page from the sidebar or click “New page”.
          </p>
        ) : (
          <div className="page-shell">
            <div className="page-inner">
              <input
                className="page-title-input"
                placeholder="Untitled"
                value={editingNote.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
              />

              <textarea
                className="page-content-input"
                placeholder="Type your page content…"
                value={editingNote.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
              />

              <div className="page-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSavePage}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gemini chat sidebar on the right, with callback */}
        <GeminiChatSidebar onUseInNote={handleAppendFromChat} />
      </main>
    </div>
  );
};

export default NotesPage;
