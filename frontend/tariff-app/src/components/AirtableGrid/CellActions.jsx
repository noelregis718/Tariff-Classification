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
        onClick={onQuestion} 
        className="action-btn question-btn"
        title="Question (Open RAG panel)"
      >
        ?
      </button>
    </div>
  );
};

export default CellActions;