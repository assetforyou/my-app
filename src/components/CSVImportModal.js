import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Modal, Button, Form, ProgressBar, Table } from 'react-bootstrap';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import FirestoreAssetService from '../firestoreAssetService';
import AssetScopeSelect from './AssetScopeSelect';
import ImportMappingsManager from './ImportMappingsManager';
import { ASSET_SCOPE } from '../utils/assetScope';

const CSVImportModal = ({ show, onHide, userEmail, onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [selectedType, setSelectedType] = useState('custom');
  const [scope, setScope] = useState(ASSET_SCOPE.PERSONAL);
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

  const FIELD_TEMPLATES = {
    stocks: ['symbol', 'name', 'quantity', 'price', 'total'],
    crypto: ['symbol', 'name', 'amount', 'price', 'total'],
    etfs: ['symbol', 'name', 'shares', 'price', 'total'],
    bonds: ['name', 'faceValue', 'maturityDate', 'currentValue'],
    metals: ['type', 'weight', 'unitPrice', 'total'],
    cash: ['name', 'amount', 'currency'],
    autos: ['make', 'model', 'year', 'value'],
    properties: ['address', 'price', 'totalMonthlyCost'],
    loans: ['institution', 'loanValue', 'interestRate'],
    customAssets: ['name', 'value', 'notes'],
  };

  const REQUIRED_FIELDS = {
    stocks: ['symbol', 'quantity'],
    crypto: ['symbol', 'amount'],
    cash: ['amount'],
    properties: ['address', 'price'],
    autos: ['value'],
  };

  const [mapping, setMapping] = useState({});
  const [dryRun, setDryRun] = useState(true);
  const [showMappingsManager, setShowMappingsManager] = useState(false);

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
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setParsedData(data);
      // initialize mapping with 'ignore' defaults
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      const initialMapping = {};
      headers.forEach((h) => { initialMapping[h] = 'ignore'; });
      setMapping(initialMapping);
    };
    reader.readAsBinaryString(selectedFile);
  };

  // Load saved mapping for the selected type when type changes
  useEffect(() => {
    let mounted = true;
    if (!selectedType) return undefined;
    async function load() {
      try {
        const saved = await FirestoreAssetService.fetchImportMapping(selectedType);
        if (mounted && saved && saved.mapping) setMapping(saved.mapping);
      } catch (err) {
        // ignore — user may not be signed in or mapping not found
      }
    }
    load();
    return () => { mounted = false; };
  }, [selectedType]);


  const handleDownloadTemplate = (type) => {
    const headers = FIELD_TEMPLATES[type] || ['name', 'value'];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'template');
    XLSX.writeFile(wb, `${type}_template.xlsx`);
  };

  const autoMap = () => {
    if (!parsedData || parsedData.length === 0) return;
    const headers = Object.keys(parsedData[0]);
    const template = FIELD_TEMPLATES[selectedType] || [];
    const newMap = {};
    headers.forEach((h) => {
      const low = h.toLowerCase();
      const found = template.find((t) => low.includes(t.toLowerCase()));
      newMap[h] = found || 'ignore';
    });
    setMapping(newMap);
  };

  const saveMapping = async () => {
    try {
      await FirestoreAssetService.saveImportMapping(selectedType, mapping);
      // eslint-disable-next-line no-alert
      alert('Mapping saved for ' + selectedType);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save mapping', err);
      // eslint-disable-next-line no-alert
      alert('Failed to save mapping. Please sign in and try again.');
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResults({ success: 0, failed: 0, errors: [] });

    const assetType = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
    const headers = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
    const rowsToProcess = [];
    const errorList = [];

    // Normalize rows according to mapping
    parsedData.forEach((row, ri) => {
      const normalized = {};
      headers.forEach((h) => {
        const target = mapping[h];
        if (target && target !== 'ignore') {
          normalized[target] = row[h];
        }
      });
      normalized.userEmail = userEmail;
      normalized.scope = scope;
      normalized.id = `${Date.now()}-${ri}`;

      const req = REQUIRED_FIELDS[selectedType] || [];
      const missing = req.filter((f) => !(normalized[f] !== undefined && normalized[f] !== ''));
      if (missing.length > 0) {
        errorList.push({ row: ri + 2, error: `Missing required fields: ${missing.join(', ')}` });
      } else {
        rowsToProcess.push({ normalized, rowIndex: ri });
      }
    });

    let successCount = 0;
    let failedCount = errorList.length;

    // Process rows in batches so large imports don't block the UI
    const batchSize = 50;
    for (let offset = 0; offset < rowsToProcess.length; offset += batchSize) {
      const batch = rowsToProcess.slice(offset, offset + batchSize);
      // For dry-run we don't persist; we just validate
      if (dryRun) {
        successCount += batch.length;
        setProgress(Math.round(((offset + batch.length) / rowsToProcess.length) * 100));
        // yield to event loop briefly
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }

      // Persist batch in parallel
      // eslint-disable-next-line no-await-in-loop
      const results = await Promise.all(batch.map((b) => FirestoreAssetService.addAsset(assetType, b.normalized).then(() => ({ ok: true })).catch((err) => ({ ok: false, err }))));
      results.forEach((res, i) => {
        if (res.ok) successCount += 1;
        else {
          failedCount += 1;
          const rowIndex = batch[i].rowIndex;
          errorList.push({ row: rowIndex + 2, error: res.err?.message || 'Unknown error' });
        }
      });
      setProgress(Math.round(((offset + batch.length) / rowsToProcess.length) * 100));
      // small pause between batches
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 100));
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
    setScope(ASSET_SCOPE.PERSONAL);
    setProgress(0);
    setResults({ success: 0, failed: 0, errors: [] });
    setMapping({});
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
            <div className="mb-3 d-flex justify-content-between align-items-start">
              <div>
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

              <div style={{ minWidth: 200 }}>
                <Form.Label>Template</Form.Label>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleDownloadTemplate(selectedType)}>
                      Download template
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => autoMap()}>
                      Auto-map
                    </Button>
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <Button size="sm" variant="outline-primary" onClick={saveMapping}>Save mapping</Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => setShowMappingsManager(true)}>Manage mappings</Button>
                    <Form.Check type="switch" id="dryRunSwitch" label="Dry run (validate only)" checked={dryRun} onChange={() => setDryRun((v) => !v)} />
                  </div>
              </div>
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

            <AssetScopeSelect value={scope} onChange={setScope} name="import-scope" id="import-scope" />

            <div className="mapping-container mb-3">
              <h6>Column mapping</h6>
              <p className="text-muted small">Map file columns to asset fields. Unmapped columns are ignored.</p>
              <Table size="sm">
                <thead>
                  <tr>
                    <th>CSV Column</th>
                    <th>Map to</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(parsedData[0] || {}).map((col) => (
                    <tr key={col}>
                      <td style={{ minWidth: 220 }}>{col}</td>
                      <td>
                        <Form.Select value={mapping[col] || 'ignore'} onChange={(e) => setMapping((m) => ({ ...m, [col]: e.target.value }))}>
                          <option value="ignore">Ignore</option>
                          {(FIELD_TEMPLATES[selectedType] || []).map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                          {['name','value','total','currency','notes','date'].map((f) => (
                            !(FIELD_TEMPLATES[selectedType] || []).includes(f) && <option key={f} value={f}>{f}</option>
                          ))}
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="preview-table-container mb-3">
              <h6>Preview (first 5 rows)</h6>
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
        {showMappingsManager && (
          <ImportMappingsManager show={showMappingsManager} onHide={() => setShowMappingsManager(false)} />
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