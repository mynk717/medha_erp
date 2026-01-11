// src/app/erp/page.tsx - FIXED
'use client';

import React, { useState, useEffect } from 'react';
import { GoogleSheetsService } from '@/lib/googleSheets';
import Dashboard from '../components/erp/Dashboard';
import Inventory from '../components/erp/Inventory';
import Sales from '../components/erp/Sales';
import Purchases from '../components/erp/Purchases';
import Invoices from '../components/erp/Invoices';
import Bills from '../components/erp/Bills';
import Settings from '../components/erp/Settings';

export default function ERPPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connected, setConnected] = useState(false);
  const [sheetId, setSheetId] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('medhaSheetId');
    const storedApiKey = localStorage.getItem('googleApiKey');
    
    if (stored) {
      setSheetId(stored);
      setConnected(true);
    }
    
    if (storedApiKey) {
      setApiKey(storedApiKey);
      initializeAPI(storedApiKey);
    }
  }, []);

  const initializeAPI = async (key: string) => {
    const sheets = GoogleSheetsService.getInstance();
    await sheets.initialize(key);
  };

  const handleConnect = async () => {
    const key = prompt('Enter your Google Sheets API Key:');
    if (!key) return;
    
    localStorage.setItem('googleApiKey', key);
    setApiKey(key);
    
    const sheets = GoogleSheetsService.getInstance();
    await sheets.initialize(key);
    
    try {
      await sheets.authenticate();
      
      const id = prompt('Enter your Google Sheet ID:');
      if (id && id.length > 20) {
        sheets.setSpreadsheetId(id);
        setSheetId(id);
        setConnected(true);
        alert('✅ Connected successfully!');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('❌ Connection failed. Check your API key and permissions.');
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabSwitch={setActiveTab} />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      case 'invoices':
        return <Invoices />;
      case 'bills':
        return <Bills />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onTabSwitch={setActiveTab} />;
    }
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'inventory', label: '📦 Inventory' },
    { id: 'sales', label: '💵 Sales' },
    { id: 'purchases', label: '💰 Purchases' },
    { id: 'invoices', label: '📄 Invoices' },
    { id: 'bills', label: '📋 Bills' },
    { id: 'settings', label: '⚙️ Settings' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Medha ERP</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {connected ? (
              <span style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '8px 16px', 
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                ✅ Connected: ...{sheetId.slice(-8)}
              </span>
            ) : (
              <button
                onClick={handleConnect}
                style={{
                  background: 'white',
                  color: '#667eea',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🔗 Connect Google Sheet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
          padding: '0 40px',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                color: activeTab === tab.id ? '#667eea' : '#64748b',
                borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: '40px'
      }}>
        {connected ? (
          renderActiveTab()
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ color: '#1e40af', marginBottom: '16px' }}>Welcome to Medha ERP</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
              Connect your Google Sheet to get started
            </p>
            <button
              onClick={handleConnect}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '16px 40px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              🔗 Connect Google Sheet
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
