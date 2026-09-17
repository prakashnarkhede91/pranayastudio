import React from 'react';
import { ORDER_STAGES } from '../data/store.jsx';

export default function StatusTape({ status, onSelect }) {
  const currentIndex = ORDER_STAGES.indexOf(status);

  return (
    <div className="tape-container">
      <div className="tape">
        {ORDER_STAGES.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          let className = 'tape-step';
          if (isDone) className += ' done';
          if (isCurrent) className += ' current';

          return (
            <div
              key={stage}
              className={className}
              onClick={() => onSelect && onSelect(stage)}
              title={`Move stage to ${stage}`}
            >
              <div className="line" />
              <div className="dot-node">{isDone ? '✓' : idx + 1}</div>
              <span className="stage-label">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
