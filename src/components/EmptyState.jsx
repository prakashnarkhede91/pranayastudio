import React from 'react';

export default function EmptyState({ title, body, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <p className="em-title">{title}</p>
      <p>{body}</p>
      {actionLabel && (
        <button className="btn btn-thread" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
