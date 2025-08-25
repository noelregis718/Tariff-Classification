import React, { useState } from 'react';
import { useAirtable } from '../../hooks/useAirtable';
import CellActions from './CellActions';
import EditableCell from './EditableCell';

const AirtableGrid = ({ onCellSelect, onQuestionClick, onAutofillClick, onFormSelect }) => {
  const { data, loading, error, updateRecord } = useAirtable();
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  const handleCellClick = (rowId, fieldName, value) => {
    try {
      const cellData = { rowId, fieldName, value };
      setSelectedCell(cellData);
      onCellSelect(cellData);
    } catch (error) {
      console.error('Error handling cell click:', error);
      if (window.showToast) {
        window.showToast('Error processing cell click', 'error');
      }
    }
  };

  const handleCellDoubleClick = (rowId, fieldName) => {
    try {
      setEditingCell({ rowId, fieldName });
    } catch (error) {
      console.error('Error starting cell edit:', error);
      if (window.showToast) {
        window.showToast('Error starting cell edit', 'error');
      }
    }
  };

  const handleCellSave = async (rowId, fieldName, newValue) => {
    try {
      await updateRecord(rowId, { [fieldName]: newValue });
      if (window.showToast) {
        window.showToast('Cell updated successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to update cell:', error);
      if (window.showToast) {
        window.showToast(`Failed to update cell: ${error.message || 'Unknown error'}`, 'error');
      }
      throw error; 
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleCellHover = (rowId, fieldName, event) => {
    try {
      setHoveredCell({ rowId, fieldName, x: event.clientX, y: event.clientY });
    } catch (error) {
      console.error('Error handling cell hover:', error);
    }
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  const handleSelect = (rowId, fieldName) => {
    try {
      console.log('Selected:', { rowId, fieldName });
      
    } catch (error) {
      console.error('Error handling selection:', error);
      if (window.showToast) {
        window.showToast('Error processing selection', 'error');
      }
    }
  };

  const handleQuestion = (rowId, fieldName, value) => {
    try {
      onQuestionClick({ rowId, fieldName, value });
    } catch (error) {
      console.error('Error handling question:', error);
      if (window.showToast) {
        window.showToast('Error processing question', 'error');
      }
    }
  };

  const handleAutofill = (rowId, fieldName) => {
    try {
      onAutofillClick({ rowId, fieldName });
    } catch (error) {
      console.error('Error handling autofill:', error);
      if (window.showToast) {
        window.showToast('Error processing autofill', 'error');
      }
    }
  };

  const testToast = (type) => {
    if (window.showToast) {
      switch (type) {
        case 'success':
          window.showToast('This is a success message!', 'success');
          break;
        case 'error':
          window.showToast('This is an error message!', 'error');
          break;
        case 'warning':
          window.showToast('This is a warning message!', 'warning');
          break;
        default:
          window.showToast('This is an info message!', 'info');
      }
    }
  };

  // Safe data access with fallbacks
  const safeData = data || {};
  const fields = safeData.fields || [];
  const records = safeData.records || [];

  if (loading) return (
    <div className="airtable-grid">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading Airtable data...</div>
      </div>
    </div>
  );

  return (
    <div className="airtable-grid">
      <div className="grid-header">
        <h2>Customs Classification Data</h2>
        <div className="header-actions">
          {/* <div className="toast-test-buttons">
            <button onClick={() => testToast('success')} className="toast-test-btn success">Test Success</button>
            <button onClick={() => testToast('error')} className="toast-test-btn error">Test Error</button>
            <button onClick={() => testToast('warning')} className="toast-test-btn warning">Test Warning</button>
            <button onClick={() => testToast('info')} className="toast-test-btn info">Test Info</button>
          </div> */}
          <button onClick={onFormSelect} className="forms-button">
            Generate Forms
          </button>
        </div>
      </div>
      
      {/* Show error as banner above table, not replacing it */}
      {error && (
        <div className="error-banner">
          <div className="error-icon">⚠️</div>
          <div className="error-message">
            <strong>Error Loading Data:</strong> {error.message || 'Unknown error occurred'}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}
      
      
      <div className="grid-container">
        <table className="data-table">
          <thead>
            <tr>
              {fields.map(field => (
                <th key={field.id || field.name}>{field.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={fields.length} className="no-data-cell">
                  {error ? 'No data available due to error' : 'No records found'}
                </td>
              </tr>
            ) : (
              records.map(record => (
                <tr key={record.id}>
                  {fields.map(field => {
                    try {
                      const isEditing = editingCell?.rowId === record.id && editingCell?.fieldName === field.name;
                      const isHovered = hoveredCell?.rowId === record.id && hoveredCell?.fieldName === field.name;
                      const cellValue = record.fields?.[field.name] || '';
                      
                      return (
                        <td 
                          key={`${record.id}-${field.name}`}
                          className={`cell ${field.name === 'final_hts_code' ? 'hts-code-cell' : ''}`}
                          onClick={() => handleCellClick(record.id, field.name, cellValue)}
                          onMouseEnter={(e) => handleCellHover(record.id, field.name, e)}
                          onMouseLeave={handleCellLeave}
                        >
                          <EditableCell
                            value={cellValue}
                            rowId={record.id}
                            fieldName={field.name}
                            onSave={handleCellSave}
                            isEditing={isEditing}
                            onStartEdit={() => handleCellDoubleClick(record.id, field.name)}
                            onCancelEdit={handleCellCancel}
                          />
                          
                          {isHovered && (
                            <CellActions
                              onSelect={() => handleSelect(record.id, field.name)}
                              onQuestion={() => handleQuestion(record.id, field.name, cellValue)}
                              onAutofill={() => handleAutofill(record.id, field.name)}
                              isVisible={true}
                            />
                          )}
                        </td>
                      );
                    } catch (error) {
                      console.error(`Error rendering cell ${field.name} for record ${record.id}:`, error);
                      return (
                        <td key={`${record.id}-${field.name}`} className="cell error-cell">
                          <div className="error-content">Error</div>
                        </td>
                      );
                    }
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AirtableGrid;