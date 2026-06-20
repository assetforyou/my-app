import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, PiggyBank } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import FirestoreAssetService from '../firestoreAssetService';
import AssetScopeSelect from '../components/AssetScopeSelect';
import { useAssetScope } from '../utils/useAssetScope';
import '../style/AssetPages.css';

function Retirement({ userEmail, retirementList, setRetirementList, retirementTotal, setRetirementTotal, fetchRetirementDetails, assetFilter = 'all', scopeFilterBanner }) {
  const [scope, setScope] = useAssetScope(assetFilter);
  const [retirementDetails, setRetirementDetails] = useState({
    accountName: '',
    accountType: '',
    provider: '',
    currentBalance: '',
    contributionAmount: '',
    contributionFrequency: 'monthly',
    employerMatch: '',
    vestingSchedule: '',
    withdrawalAge: '',
    annualReturn: '',
    currency: 'USD',
    startDate: '',
    reminderNote: '',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const ACCOUNT_TYPES = [
    '401(k)', '403(b)', 'IRA - Traditional', 'IRA - Roth',
    'RRSP', 'TFSA', 'Pension Plan', 'SEP IRA', 'SIMPLE IRA',
    'Superannuation', 'Other Retirement Account'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRetirementDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveRetirementDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const newRetirement = {
        ...retirementDetails,
        userEmail,
        scope,
        id: Date.now()
      };

      const savedRetirement = await FirestoreAssetService.addAsset('Retirement', newRetirement);
      setRetirementList(prev => [...prev, savedRetirement]);
      setRetirementTotal(prev => prev + parseFloat(retirementDetails.currentBalance || 0));

      setRetirementDetails({
        accountName: '',
        accountType: '',
        provider: '',
        currentBalance: '',
        contributionAmount: '',
        contributionFrequency: 'monthly',
        employerMatch: '',
        vestingSchedule: '',
        withdrawalAge: '',
        annualReturn: '',
        currency: 'USD',
        startDate: '',
        reminderNote: '',
        reminderDate: ''
      });

      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (error) {
      console.error('Error saving retirement details:', error);
      setSaveButtonText('Save');
      alert('Failed to save retirement account details.');
    }
  };

  const handleDeleteRetirement = async (retirementId) => {
    if (window.confirm('Are you sure you want to delete this retirement account?')) {
      try {
        await FirestoreAssetService.deleteAsset('Retirement', retirementId, userEmail);
        setRetirementList(prev => prev.filter(retirement => retirement.id !== retirementId));
        alert('Retirement account deleted successfully.');
        fetchRetirementDetails(userEmail);
      } catch (error) {
        console.error('Error deleting retirement account:', error);
        alert('Failed to delete retirement account.');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      if (data.length > 0) {
        const entry = data[0];
        setRetirementDetails({
          accountName: entry.accountName || '',
          accountType: entry.accountType || '',
          provider: entry.provider || '',
          currentBalance: entry.currentBalance || '',
          contributionAmount: entry.contributionAmount || '',
          contributionFrequency: entry.contributionFrequency || 'monthly',
          employerMatch: entry.employerMatch || '',
          vestingSchedule: entry.vestingSchedule || '',
          withdrawalAge: entry.withdrawalAge || '',
          annualReturn: entry.annualReturn || '',
          currency: entry.currency || 'USD',
          startDate: entry.startDate || '',
          reminderNote: entry.reminderNote || '',
          reminderDate: entry.reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(retirementList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RetirementList");
    XLSX.writeFile(wb, "retirement_data.xlsx");
  };

  const renderFormControl = (key, value) => {
    if (key === 'currency') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'].map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'accountType') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Account Type</option>
          {ACCOUNT_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'contributionFrequency') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annually">Annually</option>
        </Form.Select>
      );
    }

    if (key === 'startDate' || key === 'reminderDate') {
      return (
        <Form.Control
          type="text"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
          name={key}
          placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    return (
      <Form.Control
        type={['currentBalance', 'contributionAmount', 'employerMatch', 'withdrawalAge', 'annualReturn'].includes(key) ? 'number' : 'text'}
        step={key === 'employerMatch' || key === 'annualReturn' ? '0.01' : '0.01'}
        name={key}
        placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        value={value}
        onChange={handleInputChange}
      />
    );
  };

  return (
    <Layout>
      <div className="container-fluid vk-asset-page">
        <div className="create-asset-header" style={{ marginBottom: '1.5rem' }}>
          <PiggyBank size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Retirement Accounts</h1>
          <p>Track 401k, IRA, RRSP, pensions and retirement savings</p>
        </div>
        {scopeFilterBanner}

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Retirement Account Details</h5>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" size="sm">
                    <MoreVertical size={16} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => fileInputRef.current.click()}>
                      <Upload size={16} className="me-2" /> Upload Excel
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleDownloadData}>
                      <Download size={16} className="me-2" /> Download Data
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Header>
              <Card.Body>
                <Form className="row g-3">
                  <div className="col-12">
                    <AssetScopeSelect value={scope} onChange={setScope} />
                  </div>
                  {Object.entries(retirementDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveRetirementDetails} 
                      className="w-100"
                    >
                      {saveButtonText}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>

          {/* Table Column */}
          <div className="col-12 col-xl-8">
             <Card className="mb-4 total-value-card">
               <Card.Header>
                 <h5 className="mb-0">Total Retirement Savings</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <PiggyBank size={32} style={{ color: 'var(--primary-500)' }} />
                   <div>
                     <div className="amount">${retirementTotal.toFixed(2)}</div>
                   </div>
                 </div>
               </Card.Body>
             </Card>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Your Retirement Accounts</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveTable 
                  data={retirementList}
                  onDelete={handleDeleteRetirement}
                />
              </Card.Body>
            </Card>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept=".xlsx, .xls"
        />
      </div>
    </Layout>
  );
}

export default Retirement;