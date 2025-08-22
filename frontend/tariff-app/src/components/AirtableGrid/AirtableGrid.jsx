// frontend/src/components/AirtableGrid/AirtableGrid.jsx
import React, { useState } from 'react';
import { useAirtable } from '../../hooks/useAirtable';
import CellActions from './CellActions';
// import HoverTooltip from './HoverTooltip';

const AirtableGrid = ({ onCellSelect, onQuestionClick, onAutofillClick, onFormSelect }) => {
  const { data, loading, error } = useAirtable();
  const [selectedCell, setSelectedCell] = useState(null);

  const handleCellClick = (rowId, fieldName, value) => {
    const cellData = { rowId, fieldName, value };
    setSelectedCell(cellData);
    onCellSelect(cellData);
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
                {data.fields?.map(field => (
                  <td 
                    key={field.id}
                    className={`cell ${field.name === 'final_hts_code' ? 'hts-code-cell' : ''}`}
                    onClick={() => handleCellClick(record.id, field.name, record.fields[field.name])}
                  >
                    {record.fields[field.name]}
                    {selectedCell?.rowId === record.id && selectedCell?.fieldName === field.name && (
                      <CellActions
                        onQuestion={onQuestionClick}
                        onAutofill={onAutofillClick}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* {hoveredCell && hoveredCell.fieldName === 'final_hts_code' && (
        // <HoverTooltip
        //   x={hoveredCell.x}
        //   y={hoveredCell.y}
        //   htsCode={hoveredCell.value}
        // />
    //   )
      } */}
    </div>
  );
};

export default AirtableGrid;