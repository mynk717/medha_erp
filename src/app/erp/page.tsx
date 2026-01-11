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
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      
      // Load Google API script
      await loadGoogleAPI();
      
      // Initialize the service
      await sheets.initialize();
      
      // Check if already connected
      const savedSheetId = sheets.getSpreadsheetId();
      if (savedSheetId) {
        // Try to authenticate silently (user was previously connected)
        setIsConnected(true);
      }
      
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize:', error);
      setIsInitializing(false);
    }
  };

  const loadGoogleAPI = (): Promise<void> => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (typeof window !== 'undefined' && window.gapi) {
        resolve();
        return;
      }

      // Load gapi script
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = () => resolve();
      document.body.appendChild(gapiScript);

      // Load Google Identity Services
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      document.body.appendChild(gisScript);
    });
  };

  const handleConnect = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      
      // Authenticate user
      await sheets.authenticate();
      
      // Prompt for spreadsheet ID
      const sheetId = prompt(
        '📋 Enter your Google Sheet ID:\n\n' +
        'Find it in the URL:\n' +
        'https://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit\n\n' +
        'Paste the ID part only:'
      );
      
      if (sheetId && sheetId.length > 20) {
        sheets.setSpreadsheetId(sheetId);
        setIsConnected(true);
        alert('✅ Connected successfully! You can now use the ERP system.');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert('❌ Connection failed. Please try again.');
    }
  };

  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '18px', color: '#64748b' }}>Initializing ERP System...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#1e40af', marginBottom: '16px', fontSize: '32px' }}>
            🏢 Medha ERP System
          </h1>
          <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px' }}>
            Connect your Google Sheet to get started
          </p>
          
          <div style={{
            background: '#e8f4f8',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px',
            borderLeft: '4px solid #3b82f6',
            textAlign: 'left'
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
                <strong>Connect:</strong> Click button below and paste your Sheet ID
              </li>
            </ol>
          </div>

          <button
            onClick={handleConnect}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '18px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            🔗 Connect Google Sheet
          </button>
        </div>
      </div>
    );
  }

  // Main ERP Interface (only shown when connected)
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h1 style={{ color: '#1e40af', margin: 0, fontSize: '24px' }}>
            🏢 Medha ERP System
          </h1>
          <div style={{
            background: '#10b981',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            ✅ Connected
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '8px',
          marginBottom: '20px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'inventory', label: '📦 Inventory' },
            { id: 'purchases', label: '💰 Purchases' },
            { id: 'sales', label: '💵 Sales' },
            { id: 'invoices', label: '📋 Invoices' },
            { id: 'bills', label: '📄 Bills' },
            { id: 'settings', label: '⚙️ Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1',
                minWidth: '120px',
                padding: '14px 18px',
                border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#64748b',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          {activeTab === 'dashboard' && <Dashboard onTabSwitch={setActiveTab} />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'sales' && <Sales />}
          {activeTab === 'purchases' && <Purchases />}
          {activeTab === 'invoices' && <Invoices />}
          {activeTab === 'bills' && <Bills />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>
    </div>
  );
}
