import React, { useState, useEffect } from 'react';
import Layout from '../components/AdLayout';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AlternativeInvestments = ({ userEmail = '', altInvestments = [] }) => {
  const [cryptoPortfolio, setCryptoPortfolio] = useState([]);
  const [nftPortfolio, setNftPortfolio] = useState([]);
  const [privateEquity, setPrivateEquity] = useState([]);
  const [ventureCapital, setVentureCapital] = useState([]);
  
  const calculatePortfolioMetrics = () => {
    // Mock data for demonstration - replace with actual data fetching
    const cryptoData = [
      { name: 'Bitcoin', value: 45000, holdings: 1.5 },
      { name: 'Ethereum', value: 3000, holdings: 10 },
      { name: 'Solana', value: 100, holdings: 50 }
    ];
    
    const nftData = [
      { name: 'CryptoPunk', value: 150000, lastSale: 145000 },
      { name: 'Bored Ape', value: 200000, lastSale: 190000 }
    ];
    
    const peData = [
      { name: 'Fund A', committed: 500000, called: 350000 },
      { name: 'Fund B', committed: 750000, called: 500000 }
    ];
    
    const vcData = [
      { name: 'Seed Fund', invested: 250000, valuation: 400000 },
      { name: 'Series A Fund', invested: 500000, valuation: 800000 }
    ];

    setCryptoPortfolio(cryptoData);
    setNftPortfolio(nftData);
    setPrivateEquity(peData);
    setVentureCapital(vcData);
  };

  useEffect(() => {
    calculatePortfolioMetrics();
  }, []);

  const getTotalValue = (portfolio, valueKey = 'value') => {
    return portfolio.reduce((sum, item) => sum + item[valueKey], 0);
  };

  return (
    <Layout>
      <div className="container-fluid px-4">
        <div className="row">
          <div className="col-12">
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Alternative Investment Analysis</h5>
              </Card.Header>
              <Card.Body>
                {/* Cryptocurrency Portfolio */}
                <div className="mb-4">
                  <h6>Cryptocurrency Portfolio</h6>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer>
                      <BarChart data={cryptoPortfolio}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-2">Total Crypto Value: ${getTotalValue(cryptoPortfolio).toLocaleString()}</p>
                </div>

                {/* NFT Portfolio */}
                <div className="mb-4">
                  <h6>NFT Portfolio</h6>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer>
                      <LineChart data={nftPortfolio}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                        <Line type="monotone" dataKey="lastSale" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-2">Total NFT Value: ${getTotalValue(nftPortfolio).toLocaleString()}</p>
                </div>

                {/* Private Equity */}
                <div className="mb-4">
                  <h6>Private Equity Investments</h6>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer>
                      <BarChart data={privateEquity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="committed" fill="#8884d8" />
                        <Bar dataKey="called" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-2">Total Committed: ${getTotalValue(privateEquity, 'committed').toLocaleString()}</p>
                </div>

                {/* Venture Capital */}
                <div className="mb-4">
                  <h6>Venture Capital Investments</h6>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer>
                      <BarChart data={ventureCapital}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="invested" fill="#8884d8" />
                        <Bar dataKey="valuation" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-2">Total Invested: ${getTotalValue(ventureCapital, 'invested').toLocaleString()}</p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AlternativeInvestments;