import React from 'react';

const NoteCard = ({ note, onDelete, onEdit }) => {
  const handleEdit = () => onEdit(note);
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  return (
    <div className="note-card" onClick={handleEdit}>
      <div className="note-card-title">{note.title || 'Untitled'}</div>
      <div className="note-card-snippet">{note.content}</div>
      <div className="note-card-meta">
        {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
      </div>
      <div style={{ marginTop: 6, textAlign: 'right' }}>
        <button
          className="btn btn-danger btn-sm"
          type="button"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
