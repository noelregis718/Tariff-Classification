// frontend/src/components/AirtableGrid/CellActions.jsx
import React from 'react';

const CellActions = ({ onQuestion, onAutofill }) => {
  return (
    <div className="cell-actions">
      <button 
        className="action-btn question-btn"
        onClick={onQuestion}
        title="Ask question about this cell"
      >
        ?
      </button>
      <button 
        className="action-btn autofill-btn"
        onClick={onAutofill}
        title="Auto-fill related cells"
      >
        ↔
      </button>
    </div>
  );
};

export default CellActions;