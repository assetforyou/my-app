import React, { useState, useEffect } from 'react';
import { Maximize2 } from 'lucide-react';
import { Button, Modal, Card, Form } from 'react-bootstrap';

const ResponsiveTable = ({ data, onDelete, onSelectionChange }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Ensure data is an array and filter out invalid items
  const validData = Array.isArray(data) ? data.filter(item => item && item.id) : [];

  // Update selectedItems when data changes
  useEffect(() => {
    const newSelectedItems = validData.map(item => item.id);
    setSelectedItems(newSelectedItems);
    if (onSelectionChange) {
      onSelectionChange(newSelectedItems);
    }
  }, [data]);

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
    const newSelection = e.target.checked ? validData.map(item => item.id) : [];
    setSelectedItems(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const formatValue = (key, value, item) => {
    if (value === null || value === undefined || value === '') {
      if (key === 'purchaseDate') return 'Set purchase date';
      if (key === 'reminderDate') return 'Set reminder date';
      if (key === 'transactionDate') return 'Set transaction date';
      return '-';
    }
    
    if ((key === 'amount' || key === 'value') && !isNaN(value)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: item.currency || 'USD'
      }).format(value);
    }
    
    if (key.toLowerCase().includes('date')) {
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
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
        if (key === 'purchaseDate') return 'Set purchase date';
        if (key === 'reminderDate') return 'Set reminder date';
        if (key === 'transactionDate') return 'Set transaction date';
        return 'Invalid date';
      }
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return value;
  };

  const getHeaders = () => {
    if (!validData || validData.length === 0) return [];
    const sample = validData[0];
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
    if (value === null || value === undefined || value === '') {
      if (key.toLowerCase().includes('date')) {
        return { color: '#6c757d', fontStyle: 'italic' };
      }
    }
    return {};
  };

  const handleLocalDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (onDelete) {
        // Ensure the id is treated as a string
        await onDelete(String(id));
      }
    }
  };

  const TableContent = () => (
    <div className="table-responsive">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th className="align-middle">
              <Form.Check
                type="checkbox"
                checked={selectedItems.length === validData.length && validData.length > 0}
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
          {validData.length > 0 ? (
            validData.map((item, index) => (
              <tr key={item.id || index}>
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
                    onClick={() => handleLocalDelete(item.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={getHeaders().length + 2} className="text-center">
                No data available
              </td>
            </tr>
          )}
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