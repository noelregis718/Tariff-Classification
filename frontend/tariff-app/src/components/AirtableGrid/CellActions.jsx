// frontend/src/components/AirtableGrid/CellActions.jsx
import React from 'react';

const CellActions = ({ 
  onQuestion, 
  onAutofill, 
  onSelect,
  isVisible = false 
}) => {
  if (!isVisible) return null;

  return (
    <div className="cell-actions-overlay">
      <button 
        onClick={onSelect} 
        className="action-btn select-btn"
        title="Select (Mark as reviewed)"
      >
        ✔
      </button>
      <button 
        onClick={onQuestion} 
        className="action-btn question-btn"
        title="Question (Open RAG panel)"
      >
        ?
      </button>
      <button 
        onClick={onAutofill} 
        className="action-btn autofill-btn"
        title="Self-fill (Auto-populate fields)"
      >
        ↔
      </button>
    </div>
  );
};

export default CellActions;