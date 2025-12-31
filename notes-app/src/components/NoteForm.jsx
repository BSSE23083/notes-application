import React, { useState } from 'react';

const NoteForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="note-title">
          Title (optional)
        </label>
        <input
          id="note-title"
          className="form-control"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="note-content">
          Content
        </label>
        <textarea
          id="note-content"
          className="form-control"
          placeholder="Type your note here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={saving}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-full-width"
        disabled={saving || !content.trim()}
      >
        {saving ? 'Saving…' : 'Add note'}
      </button>
    </form>
  );
};

export default NoteForm;
