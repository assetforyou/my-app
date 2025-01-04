import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Button, Modal, Card, Form } from 'react-bootstrap';

const ResponsiveTable = ({ data, onDelete, onSelectionChange }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItems, setSelectedItems] = useState(data.map(item => item.id));

  const handleCheckboxChange = (id) => {
    const updatedSelection = selectedItems.includes(id)
      ? selectedItems.filter(itemId => itemId !== id)
      : [...selectedItems, id];
    
    setSelectedItems(updatedSelection);
    if (onSelectionChange) {
      onSelectionChange(updatedSelection);
    }
  };

  const handleSelectAll = (e) => {
    const newSelection = e.target.checked ? data.map(item => item.id) : [];
    setSelectedItems(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const formatValue = (key, value, item) => {
    if (value === null || value === undefined || value === '') {
      // Return placeholders for date fields
      if (key === 'purchaseDate') return 'Set purchase date';
      if (key === 'reminderDate') return 'Set reminder date';
      if (key === 'transactionDate') return 'Set transaction date';
      return '-';
    }
    
    // Handle currency values (amount or value fields)
    if ((key === 'amount' || key === 'value') && !isNaN(value)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: item.currency || 'USD'
      }).format(value);
    }
    
    // Handle date fields with placeholders
    if (key.toLowerCase().includes('date')) {
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          // If invalid date
          if (key === 'purchaseDate') return 'Set purchase date';
          if (key === 'reminderDate') return 'Set reminder date';
          if (key === 'transactionDate') return 'Set transaction date';
          return 'Invalid date';
        }
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        // If date parsing fails
        if (key === 'purchaseDate') return 'Set purchase date';
        if (key === 'reminderDate') return 'Set reminder date';
        if (key === 'transactionDate') return 'Set transaction date';
        return 'Invalid date';
      }
    }
    
    // Handle numbers with commas
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return value;
  };

  const getHeaders = () => {
    if (!data || data.length === 0) return [];
    const sample = data[0];
    return Object.keys(sample).filter(key => 
      key !== 'id' && key !== 'userEmail' && key !== 'currency'
    );
  };

  const formatHeader = (header) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const getValueStyle = (key, value) => {
    // Add styles for placeholder text
    if (value === null || value === undefined || value === '') {
      if (key.toLowerCase().includes('date')) {
        return { color: '#6c757d', fontStyle: 'italic' };
      }
    }
    return {};
  };

  const TableContent = () => (
    <div className="table-responsive">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th className="align-middle">
              <Form.Check
                type="checkbox"
                checked={selectedItems.length === data.length}
                onChange={handleSelectAll}
              />
            </th>
            {getHeaders().map(header => (
              <th key={header} className="align-middle">
                {formatHeader(header)}
              </th>
            ))}
            <th className="text-end align-middle">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="align-middle">
                <Form.Check
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleCheckboxChange(item.id)}
                />
              </td>
              {getHeaders().map((key, i) => (
                <td 
                  key={i} 
                  className="align-middle"
                  style={getValueStyle(key, item[key])}
                >
                  {formatValue(key, item[key], item)}
                </td>
              ))}
              <td className="text-end align-middle">
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <Card>
        {!isFullscreen && (
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Details</h5>
            <Button
              variant="light"
              size="sm"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 size={16} />
            </Button>
          </Card.Header>
        )}

        <Card.Body className="p-0">
          <TableContent />
        </Card.Body>
      </Card>

      <Modal 
        show={isFullscreen} 
        onHide={() => setIsFullscreen(false)}
        fullscreen={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Full Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <TableContent />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ResponsiveTable;