import React from 'react';

export default function StatusPill({ status }) {
  const cls = `status-${status.toLowerCase()}`;
  return <span className={`status-pill ${cls}`}>{status}</span>;
}
