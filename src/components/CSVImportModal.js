import React, { useState, useRef } from 'react';
import { Modal, Button, Form, ProgressBar, Table } from 'react-bootstrap';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import FirestoreAssetService from '../firestoreAssetService';

const CSVImportModal = ({ show, onHide, userEmail, onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [selectedType, setSelectedType] = useState('custom');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });
  const fileInputRef = useRef(null);

  const ASSET_TYPES = [
    { value: 'stocks', label: 'Stocks' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'etfs', label: 'ETFs' },
    { value: 'bonds', label: 'Bonds' },
    { value: 'metals', label: 'Metals' },
    { value: 'cash', label: 'Cash' },
    { value: 'autos', label: 'Vehicles' },
    { value: 'properties', label: 'Properties' },
    { value: 'loans', label: 'Loans' },
    { value: 'customAssets', label: 'Custom Assets' },
  ];

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setParsedData(data);
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResults({ success: 0, failed: 0, errors: [] });

    const assetType = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
    let successCount = 0;
    let failedCount = 0;
    let errorList = [];

    for (let i = 0; i < parsedData.length; i++) {
      try {
        const asset = {
          ...parsedData[i],
          userEmail,
          id: Date.now() + i
        };
        
        await FirestoreAssetService.addAsset(assetType, asset);
        successCount++;
      } catch (error) {
        failedCount++;
        errorList.push({ row: i + 2, error: error.message });
      }
      
      setProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setResults({ success: successCount, failed: failedCount, errors: errorList });
    setImporting(false);
    
    if (successCount > 0 && onImportComplete) {
      setTimeout(() => onImportComplete(), 1000);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setSelectedType('custom');
    setProgress(0);
    setResults({ success: 0, failed: 0, errors: [] });
  };

  const handleClose = () => {
    handleReset();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Upload size={20} className="me-2" />
          Bulk Import Assets
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {!file && (
          <div className="upload-dropzone" onClick={() => fileInputRef.current.click()}>
            <Upload size={48} className="text-muted mb-3" />
            <h5>Drop your CSV/Excel file here</h5>
            <p className="text-muted">or click to browse</p>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept=".csv,.xlsx,.xls"
            />
          </div>
        )}

        {file && parsedData.length > 0 && !importing && results.success === 0 && results.failed === 0 && (
          <>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">{file.name}</span>
                <Button variant="outline-danger" size="sm" onClick={handleReset}>
                  <X size={14} className="me-1" /> Remove
                </Button>
              </div>
              <p className="text-muted small mb-3">
                {parsedData.length} rows detected • {Object.keys(parsedData[0] || {}).length} columns
              </p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Import as Asset Type</Form.Label>
              <Form.Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {ASSET_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="preview-table-container mb-3">
              <h6>Preview</h6>
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    {Object.keys(parsedData[0] || {}).slice(0, 6).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).slice(0, 6).map((value, i) => (
                        <td key={i}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
              {parsedData.length > 5 && (
                <p className="text-muted small text-center">
                  + {parsedData.length - 5} more rows
                </p>
              )}
            </div>
          </>
        )}

        {importing && (
          <div className="import-progress">
            <h5 className="mb-3">Importing assets...</h5>
            <ProgressBar now={progress} label={`${progress}%`} className="mb-2" />
            <p className="text-muted small">Please wait while your assets are being imported</p>
          </div>
        )}

        {(results.success > 0 || results.failed > 0) && (
          <div className="import-results">
            <div className="d-flex gap-4 mb-4 justify-content-center">
              <div className="text-center">
                <Check size={32} className="text-success mb-2" />
                <div className="fw-bold text-success h3">{results.success}</div>
                <div className="text-muted small">Successfully imported</div>
              </div>
              <div className="text-center">
                <AlertCircle size={32} className="text-danger mb-2" />
                <div className="fw-bold text-danger h3">{results.failed}</div>
                <div className="text-muted small">Failed</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="error-list">
                <h6>Errors</h6>
                <ul className="list-group">
                  {results.errors.slice(0, 10).map((err, index) => (
                    <li key={index} className="list-group-item list-group-item-danger">
                      Row {err.row}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        {file && parsedData.length > 0 && !importing && results.success === 0 && results.failed === 0 && (
          <Button variant="primary" onClick={handleImport}>
            <Upload size={16} className="me-2" />
            Import {parsedData.length} assets
          </Button>
        )}
        {(results.success > 0 || results.failed > 0) && (
          <Button variant="primary" onClick={handleReset}>
            Import Another File
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CSVImportModal;