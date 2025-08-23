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
  const [inputError, setInputError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-resize textarea to fit content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(60, textareaRef.current.scrollHeight) + 'px';
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value || '');
    setInputError('');
  }, [value]);

  const handleDoubleClick = () => {
    onStartEdit();
  };

  const handleTextareaChange = (e) => {
    setEditValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.max(60, e.target.scrollHeight) + 'px';
  };

  const handleSave = async () => {
    try {
      setInputError('');
      if (editValue !== value) {
        await onSave(rowId, fieldName, editValue);
        if (window.showToast) {
          window.showToast('Cell updated successfully', 'success');
        }
      }
      onCancelEdit();
    } catch (error) {
      console.error('Failed to save cell:', error);
      setInputError('Failed to save. Please try again.');
      if (window.showToast) {
        window.showToast(`Failed to update cell: ${error.message || 'Unknown error'}`, 'error');
      }
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setInputError('');
    onCancelEdit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter to save
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="editable-cell-input">
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={handleTextareaChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`cell-input ${inputError ? 'error' : ''}`}
          placeholder="Enter content..."
          rows={1}
        />
        {inputError && <div className="input-error">{inputError}</div>}
        <div className="cell-actions">
          <button onClick={handleSave} className="save-btn" title="Save (Ctrl+Enter)">✓</button>
          <button onClick={handleCancel} className="cancel-btn" title="Cancel (Esc)">✗</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="editable-cell"
      onDoubleClick={handleDoubleClick}
      title={value || ''}
    >
      <div className="cell-content">
        {value || ''}
      </div>
    </div>
  );
};

export default EditableCell;
