import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AlternativeInvestments = ({ 
  cryptoList = [], 
  nftList = [], 
  privateEquityList = [], 
  ventureCapitalList = [] 
}) => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [timeframe, setTimeframe] = useState('1M');

  const getTotalValue = (portfolio, valueKey = 'value') => {
    return portfolio.reduce((sum, item) => sum + parseFloat(item[valueKey] || 0), 0);
  };

  const renderMetricsCard = (title, value, change) => (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="text-sm text-gray-500">{title}</Card.Title>
        <div className="mt-2 d-flex align-items-baseline">
          <h3 className="mb-0">${value.toLocaleString()}</h3>
          {change !== undefined && (
            <span className={`ms-2 ${change >= 0 ? 'text-success' : 'text-danger'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="p-4">
      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          {renderMetricsCard("Total Crypto Value", getTotalValue(cryptoList, 'total'))}
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          {renderMetricsCard("Total NFT Value", getTotalValue(nftList, 'value'))}
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          {renderMetricsCard("Private Equity Committed", getTotalValue(privateEquityList, 'committed'))}
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          {renderMetricsCard("VC Portfolio Value", getTotalValue(ventureCapitalList, 'valuation'))}
        </div>
      </div>

      {/* Crypto Portfolio Chart */}
      {cryptoList.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Cryptocurrency Portfolio</h5>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cryptoList}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="total" name="Current Value" fill="#8884d8" />
                  <Bar dataKey="number" name="Holdings" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* NFT Portfolio Chart */}
      {nftList.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">NFT Portfolio Performance</h5>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nftList}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Current Value" stroke="#8884d8" />
                  <Line type="monotone" dataKey="lastSale" name="Last Sale" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Private Equity Chart */}
      {privateEquityList.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Private Equity Investments</h5>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={privateEquityList}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="committed" name="Committed Capital" fill="#8884d8" />
                  <Bar dataKey="called" name="Called Capital" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Show message if no data */}
      {!cryptoList.length && !nftList.length && !privateEquityList.length && !ventureCapitalList.length && (
        <Card>
          <Card.Body className="text-center py-4 text-muted">
            No alternative investments data available. Add some investments to see them displayed here.
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AlternativeInvestments;