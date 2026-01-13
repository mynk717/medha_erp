'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { useSheetManager } from '@/lib/hooks/useSheetManager';
import Header from '@/components/Header';
import Dashboard from '../components/erp/Dashboard';
import Inventory from '../components/erp/Inventory';
import Sales from '../components/erp/Sales';
import Purchases from '../components/erp/Purchases';
import Invoices from '../components/erp/Invoices';
import Bills from '../components/erp/Bills';
import Settings from '../components/erp/Settings';
import Image from 'next/image';
import Reminders from '../components/erp/Reminders';
import SheetSwitcher from '../components/SheetSwitcher';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  FileText, 
  Receipt, 
  Settings as SettingsIcon,
  Link,
  Loader2,
  Bell
} from 'lucide-react';

export default function ERPPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use custom hook for sheet management
  const {
    userSheets,
    activeSheetId,
    connected,
    sheetId,
    loadUserSheets,
    handleConnect,
    handleSwitchSheet,
    handleAddSheet,
    handleRemoveSheet,
    handleUpdateSheetTag,
  } = useSheetManager(session);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Starting app initialization...');
      setIsInitializing(true);
      
      try {
        // Load Google Scripts
        await loadGoogleScripts();
        
        // Initialize Google Sheets Service
        const sheets = GoogleSheetsService.getInstance();
        await sheets.initialize();
        
        console.log('✅ Google Sheets initialized');
      } catch (error) {
        console.error('❌ Initialization error:', error);
      } finally {
        console.log('🏁 App initialization complete');
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated' && session?.user && !isInitializing) {
      loadUserSheets();
    }
  }, [status, session, isInitializing, router]);

  // Helper function to load Google scripts
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

      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = () => {
        gapiLoaded = true;
        checkBothLoaded();
      };
      document.body.appendChild(gapiScript);

      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.onload = () => {
        gisLoaded = true;
        checkBothLoaded();
      };
      document.body.appendChild(gisScript);
    });
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onTabSwitch={setActiveTab} />;
      case 'inventory': return <Inventory />;
      case 'sales': return <Sales />;
      case 'purchases': return <Purchases />;
      case 'invoices': return <Invoices />;
      case 'bills': return <Bills />;
      case 'reminders': return <Reminders />;
      case 'settings': return <Settings />;
      default: return <Dashboard onTabSwitch={setActiveTab} />;
    }
  };

  // Loading state
  if (isInitializing || status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p style={{ color: '#64748b' }}>Loading your workspace...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header Component */}
      <Header
        connected={connected}
        sheetId={sheetId}
        session={session}
        onConnect={handleConnect}
        onSettingsClick={() => setActiveTab('settings')}
      />

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
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
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
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: '40px'
      }}>
        {/* Sheet Switcher */}
        {session?.user && (
          <SheetSwitcher
            sheets={userSheets}
            activeSheetId={activeSheetId}
            onSwitch={handleSwitchSheet}
            onAdd={handleAddSheet}
            onRemove={handleRemoveSheet}
            onUpdateTag={handleUpdateSheetTag}
          />
        )}
        
        {/* Content */}
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
            <h2 style={{ color: '#1e293b', marginBottom: '16px', fontWeight: 700 }}>
              Welcome to Medha ERP
            </h2>
            <p style={{ color: '#475569', marginBottom: '32px', fontSize: '18px' }}>
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
              <ol style={{ margin: 0, color: '#1e293b', paddingLeft: '20px', fontWeight: 500 }}>
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
                  <code style={{ background: '#F8FAFC', padding: '2px 6px', borderRadius: '4px' }}>
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
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Link className="w-5 h-5" />
              Connect Google Sheet
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
