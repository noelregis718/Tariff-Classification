// frontend/src/components/AirtableGrid/AirtableGrid.jsx
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
    const cellData = { rowId, fieldName, value };
    setSelectedCell(cellData);
    onCellSelect(cellData);
  };

  const handleCellDoubleClick = (rowId, fieldName) => {
    setEditingCell({ rowId, fieldName });
  };

  const handleCellSave = async (rowId, fieldName, newValue) => {
    try {
      await updateRecord(rowId, { [fieldName]: newValue });
      console.log('✅ Cell updated successfully');
    } catch (error) {
      console.error('❌ Failed to update cell:', error);
      // You might want to show a toast notification here
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleCellHover = (rowId, fieldName, event) => {
    setHoveredCell({ rowId, fieldName, x: event.clientX, y: event.clientY });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  const handleSelect = (rowId, fieldName) => {
    console.log('Selected:', { rowId, fieldName });
    // Implement your selection logic here
  };

  const handleQuestion = (rowId, fieldName, value) => {
    onQuestionClick({ rowId, fieldName, value });
  };

  const handleAutofill = (rowId, fieldName) => {
    onAutofillClick({ rowId, fieldName });
  };

  if (loading) return <div>Loading Airtable data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="airtable-grid">
      <div className="grid-header">
        <h2>Customs Classification Data</h2>
        <button onClick={onFormSelect} className="forms-button">
          Generate Forms
        </button>
      </div>
      
      <div className="grid-container">
        <table className="data-table">
          <thead>
            <tr>
              {data.fields?.map(field => (
                <th key={field.id}>{field.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.records?.map(record => (
              <tr key={record.id}>
                {data.fields?.map(field => {
                  const isEditing = editingCell?.rowId === record.id && editingCell?.fieldName === field.name;
                  const isHovered = hoveredCell?.rowId === record.id && hoveredCell?.fieldName === field.name;
                  const cellValue = record.fields[field.name];
                  
                  return (
                    <td 
                      key={field.id}
                      className={`cell ${field.name === 'final_hts_code' ? 'hts-code-cell' : ''}`}
                      onClick={() => handleCellClick(record.id, field.name, cellValue)}
                      onMouseEnter={(e) => handleCellHover(record.id, field.name, e)}
                      onMouseLeave={handleCellLeave}
                    >
                      {isEditing ? (
                        <EditableCell
                          value={cellValue}
                          rowId={record.id}
                          fieldName={field.name}
                          onSave={handleCellSave}
                          isEditing={isEditing}
                          onStartEdit={() => handleCellDoubleClick(record.id, field.name)}
                          onCancelEdit={handleCellCancel}
                        />
                      ) : (
                        <EditableCell
                          value={cellValue}
                          rowId={record.id}
                          fieldName={field.name}
                          onSave={handleCellSave}
                          isEditing={false}
                          onStartEdit={() => handleCellDoubleClick(record.id, field.name)}
                          onCancelEdit={handleCellCancel}
                        />
                      )}
                      
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
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AirtableGrid;