import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Button, Modal, Card } from 'react-bootstrap';

const ResponsiveTable = ({ data, onDelete }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const renderTableContent = () => (
    <div className="table-responsive">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            {Object.keys(data[0] || {}).filter(key => key !== 'id' && key !== 'userEmail').map(header => (
              <th key={header} className="text-nowrap">
                {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </th>
            ))}
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {Object.entries(item)
                .filter(([key]) => key !== 'id' && key !== 'userEmail')
                .map(([key, value], i) => (
                  <td key={i} className="text-nowrap">
                    {value}
                  </td>
              ))}
              <td className="text-end">
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
      {!isFullscreen && (
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Saved Cash Details</h5>
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
        {renderTableContent()}
      </Card.Body>

      <Modal 
        show={isFullscreen} 
        onHide={() => setIsFullscreen(false)}
        fullscreen={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Cash Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {renderTableContent()}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ResponsiveTable;