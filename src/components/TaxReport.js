import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Badge, Table } from 'react-bootstrap';
import { Download, TrendingUp } from 'lucide-react';
import { generateTaxReport, generateTaxHarvestingOpportunities } from '../utils/taxCalculator';
import '../style/TaxReport.css';

function TaxReport({ portfolio = [] }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [taxReport, setTaxReport] = useState(null);
  const [harvestOpportunities, setHarvestOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport();
  }, [selectedYear, portfolio]);

  const generateReport = async () => {
    try {
      setLoading(true);
      if (!portfolio || portfolio.length === 0) {
        setTaxReport(null);
        setHarvestOpportunities([]);
        return;
      }
      
      const report = generateTaxReport(selectedYear, portfolio);
      const opportunities = generateTaxHarvestingOpportunities(portfolio);
      
      // Ensure report has required fields
      const enrichedReport = {
        year: report.year,
        longTermGains: report.longTermGains || 0,
        shortTermGains: report.shortTermGains || 0,
        longTermCount: portfolio.filter(a => a.type?.includes('Stock') || a.type?.includes('ETF')).length,
        shortTermCount: 0,
        gains: portfolio.map((a, idx) => ({
          symbol: a.symbol || a.name || `Asset ${idx}`,
          costBasis: a.purchasePrice ? (a.purchasePrice * (a.quantity || 1)) : 0,
          currentValue: a.value || 0,
          gain: (a.value || 0) - (a.purchasePrice ? (a.purchasePrice * (a.quantity || 1)) : 0),
          type: a.soldDate ? 'long-term' : 'long-term',
        })),
      };
      
      setTaxReport(enrichedReport);
      setHarvestOpportunities(opportunities || []);
    } catch (err) {
      console.error('Error generating tax report:', err);
      setTaxReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!taxReport) return;
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tax-report-${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateCSV = () => {
    if (!taxReport) return '';
    const lines = [];
    lines.push('Tax Report ' + selectedYear);
    lines.push('Asset,Cost Basis,Current Value,Capital Gain,Type');
    if (taxReport.gains && taxReport.gains.length > 0) {
      taxReport.gains.forEach((gain) => {
        lines.push(`"${gain.symbol}","${gain.costBasis}","${gain.currentValue}","${gain.gain}","${gain.type}"`);
      });
    }
    return lines.join('\n');
  };

  if (loading) return <p className="text-muted">Loading tax report...</p>;
  if (!taxReport) return <Card className="p-4 text-center text-muted"><p>No assets to generate tax report.</p></Card>;

  const years = Array.from({ length: 10 }, (_, i) =>
    new Date().getFullYear() - i
  );

  return (
    <div className="tax-report-container">
      <h4 className="mb-4">📊 Tax Report & Harvesting Opportunities</h4>

      <Form.Group className="mb-4">
        <Form.Label>Select Year</Form.Label>
        <Form.Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Tax Summary Cards */}
      <div className="tax-summary-cards mb-4">
        <Card className="tax-card">
          <Card.Body>
            <h6 className="text-muted mb-2">Long-Term Gains</h6>
            <h3 className="text-success">${taxReport.longTermGains.toLocaleString()}</h3>
            <small className="text-muted">{taxReport.longTermCount} assets</small>
          </Card.Body>
        </Card>

        <Card className="tax-card">
          <Card.Body>
            <h6 className="text-muted mb-2">Short-Term Gains</h6>
            <h3 className={taxReport.shortTermGains >= 0 ? 'text-danger' : 'text-warning'}>
              ${taxReport.shortTermGains.toLocaleString()}
            </h3>
            <small className="text-muted">{taxReport.shortTermCount} assets</small>
          </Card.Body>
        </Card>

        <Card className="tax-card">
          <Card.Body>
            <h6 className="text-muted mb-2">Total Tax Liability (Est.)</h6>
            <h3 className="text-danger">
              ${(taxReport.longTermGains * 0.15 + taxReport.shortTermGains * 0.37).toLocaleString()}
            </h3>
            <small className="text-muted">Federal (15% LT, 37% ST)</small>
          </Card.Body>
        </Card>
      </div>

      {/* Capital Gains Table */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">Capital Gains Breakdown</h6>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead>
                <tr>
                  <th>Asset / Symbol</th>
                  <th>Cost Basis</th>
                  <th>Current Value</th>
                  <th>Capital Gain/Loss</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {taxReport.gains.length > 0 ? (
                  taxReport.gains.map((gain, idx) => (
                    <tr key={idx}>
                      <td>{gain.symbol}</td>
                      <td>${gain.costBasis.toLocaleString()}</td>
                      <td>${gain.currentValue.toLocaleString()}</td>
                      <td>
                        <span
                          className={gain.gain >= 0 ? 'text-success' : 'text-danger'}
                        >
                          <TrendingUp size={14} className="me-1" />
                          ${gain.gain.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <Badge bg={gain.type === 'long-term' ? 'info' : 'warning'}>
                          {gain.type}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No capital gains to report
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Tax-Loss Harvesting Opportunities */}
      {harvestOpportunities.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0">🌱 Tax-Loss Harvesting Opportunities</h6>
          </Card.Header>
          <Card.Body>
            <p className="text-muted small mb-3">
              Sell losing positions to offset gains. You can then buy similar (but not substantially identical) assets to maintain exposure.
            </p>
            <div className="harvest-list">
              {harvestOpportunities.map((opp, idx) => (
                <div key={idx} className="harvest-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{opp.symbol}</h6>
                      <p className="mb-0 small text-muted">{opp.description}</p>
                    </div>
                    <Badge bg="danger">${Math.abs(opp.loss).toLocaleString()}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Download Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={handleDownloadReport}
        className="mt-3"
      >
        <Download size={16} className="me-2" />
        Download as CSV
      </Button>
    </div>
  );
}

export default TaxReport;
