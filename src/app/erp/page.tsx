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
import Image from 'next/image';

export default function ERPPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connected, setConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sheetId, setSheetId] = useState('');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load Google API scripts
      await loadGoogleScripts();
      
      const sheets = GoogleSheetsService.getInstance();
      
      // Check if previously connected
      const savedSheetId = localStorage.getItem('medhaSheetId');
      if (savedSheetId) {
        setSheetId(savedSheetId);
        sheets.setSpreadsheetId(savedSheetId);
      }
      
      // Initialize GAPI (no API key needed for OAuth)
      await sheets.initialize();
      
      setIsInitializing(false);
    } catch (error) {
      console.error('Initialization error:', error);
      setIsInitializing(false);
    }
  };

  const loadGoogleScripts = (): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.gapi && window.google) {
        resolve();
        return;
      }

      let gapiLoaded = false;
      let gisLoaded = false;

      const checkBothLoaded = () => {
        if (gapiLoaded && gisLoaded) resolve();
      };

      // Load GAPI
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = () => {
        gapiLoaded = true;
        checkBothLoaded();
      };
      document.body.appendChild(gapiScript);

      // Load GIS
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.onload = () => {
        gisLoaded = true;
        checkBothLoaded();
      };
      document.body.appendChild(gisScript);
    });
  };

  const handleConnect = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      
      // Step 1: Authenticate (this will get access token via OAuth)
      await sheets.authenticate();
      
      // Step 2: Ask for spreadsheet ID
      const id = prompt(
        '📋 Enter your Google Sheet ID:\n\n' +
        'Find it in the URL:\n' +
        'https://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit\n\n' +
        'Paste the ID part only:'
      );
      
      if (id && id.length > 20) {
        sheets.setSpreadsheetId(id);
        setSheetId(id);
        setConnected(true);
        alert('✅ Connected successfully! You can now use the ERP system.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('❌ Connection failed. Please try again and make sure you grant permissions.');
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onTabSwitch={setActiveTab} />;
      case 'inventory': return <Inventory />;
      case 'sales': return <Sales />;
      case 'purchases': return <Purchases />;
      case 'invoices': return <Invoices />;
      case 'bills': return <Bills />;
      case 'settings': return <Settings />;
      default: return <Dashboard onTabSwitch={setActiveTab} />;
    }
  };

  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '18px', color: '#64748b' }}>Initializing ERP System...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header with Logo */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Image 
              src="/medha-logo.png" 
              alt="Medha Logo" 
              width={50} 
              height={50}
              style={{ borderRadius: '8px' }}
            />
            <h1 style={{ margin: 0, fontSize: '28px' }}>Medha ERP</h1>
          </div>
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
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
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
            <div style={{ marginBottom: '24px' }}>
              <Image 
                src="/medha-logo.png" 
                alt="Medha Logo" 
                width={100} 
                height={100}
                style={{ borderRadius: '12px' }}
              />
            </div>
            <h2 style={{ color: '#1e40af', marginBottom: '16px' }}>Welcome to Medha ERP</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>
              Connect your Google Sheet to get started
            </p>
            
            <div style={{
              background: '#e8f4f8',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '24px',
              borderLeft: '4px solid #3b82f6',
              textAlign: 'left',
              maxWidth: '600px',
              margin: '0 auto 24px'
            }}>
              <h3 style={{ color: '#1e40af', margin: '0 0 12px 0' }}>📋 First Time Setup</h3>
              <ol style={{ margin: 0, color: '#334155', paddingLeft: '20px' }}>
                <li>
                  <strong>Create a sheet:</strong>{' '}
                  <a 
                    href="https://docs.google.com/spreadsheets/d/1Q6zMcTWDqk2qpZsjsXqWY3ewnq14kCWwZZgsFQ13CdM/copy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#3b82f6' }}
                  >
                    Click here to duplicate template
                  </a>
                </li>
                <li style={{ marginTop: '8px' }}>
                  <strong>Get your Sheet ID:</strong> Copy from URL:{' '}
                  <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                    docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit
                  </code>
                </li>
                <li style={{ marginTop: '8px' }}>
                  <strong>Connect:</strong> Click button below and grant permissions
                </li>
              </ol>
            </div>
            
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
