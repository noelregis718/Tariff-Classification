import React, { useState, useRef, useEffect } from 'react';

const EditableCell = ({ 
  value, 
  rowId, 
  fieldName, 
  onSave, 
  isEditing, 
  onStartEdit, 
  onCancelEdit 
}) => {
  const [editValue, setEditValue] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    onStartEdit();
  };

  const handleSave = () => {
    if (editValue !== value) {
      onSave(rowId, fieldName, editValue);
    }
    onCancelEdit();
  };

  const handleCancel = () => {
    setEditValue(value || '');
    onCancelEdit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="editable-cell-input">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="cell-input"
        />
        <div className="cell-actions">
          <button onClick={handleSave} className="save-btn">✓</button>
          <button onClick={handleCancel} className="cancel-btn">✗</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="editable-cell"
      onDoubleClick={handleDoubleClick}
    >
      {value || ''}
    </div>
  );
};

export default EditableCell;
