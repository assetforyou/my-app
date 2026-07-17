import React, { useEffect, useState } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import FirestoreAssetService from '../firestoreAssetService';

function ImportMappingsManager({ show, onHide }) {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    let mounted = true;
    setLoading(true);
    FirestoreAssetService.fetchAllImportMappings()
      .then((list) => { if (mounted) setMappings(list); })
      .catch(() => { if (mounted) setMappings([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [show]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved mapping?')) return;
    try {
      await FirestoreAssetService.deleteImportMapping(id);
      setMappings((s) => s.filter((m) => m.id !== id));
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Failed to delete mapping');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Saved Import Mappings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? <p>Loading...</p> : (
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Updated</th>
                <th>Columns</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr key={m.id}>
                  <td>{m.type}</td>
                  <td>{m.updatedAt || '-'}</td>
                  <td style={{ maxWidth: 420, overflow: 'auto' }}><pre style={{ margin: 0 }}>{JSON.stringify(m.mapping, null, 2)}</pre></td>
                  <td><Button variant="danger" size="sm" onClick={() => handleDelete(m.id)}>Delete</Button></td>
                </tr>
              ))}
              {mappings.length === 0 && (
                <tr><td colSpan={4} className="text-center">No saved mappings</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImportMappingsManager;
