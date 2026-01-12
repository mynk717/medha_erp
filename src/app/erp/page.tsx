'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  CheckCircle,
  Loader2,
  Bell,
  LogOut,
  User
} from 'lucide-react';

export default function ERPPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connected, setConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sheetId, setSheetId] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userSheets, setUserSheets] = useState<Array<{id: string, tag: string, addedAt: number, lastUsed: number}>>([]);
const [activeSheetId, setActiveSheetId] = useState<string | null>(null);

  // ========== FUNCTIONS FIRST (BEFORE useEffect) ==========

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
// Load user's sheets from Redis
const loadUserSheets = async () => {
  if (!session?.user) {
    console.log('⏭️ No session, skipping sheet load');
    return;
  }
  
  console.log('👤 Loading user sheets for:', session.user.email);
  
  try {
    const response = await fetch('/api/sheets');
    
    if (!response.ok) {
      console.error('❌ Failed to fetch sheets:', response.status);
      throw new Error(`Failed to fetch sheets: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Sheets loaded:', data);
    
    setUserSheets(data.sheets || []);
    setActiveSheetId(data.activeSheetId);
    
    // If user has an active sheet, set it up
    if (data.activeSheetId) {
      console.log('📊 Setting active sheet:', data.activeSheetId);
      setSheetId(data.activeSheetId);
      const gsService = GoogleSheetsService.getInstance();
      gsService.setSpreadsheetId(data.activeSheetId);
      setConnected(true);
      
      // Also save to localStorage as backup
      localStorage.setItem('medhaSheetId', data.activeSheetId);
    }
    
  } catch (error) {
    console.error('❌ Error loading user sheets:', error);
    // Don't throw - just set empty state and continue
    setUserSheets([]);
    setActiveSheetId(null);
  }
};


// Switch to different sheet
const handleSwitchSheet = async (spreadsheetId: string) => {
  if (!session?.user) return;
  
  try {
    const response = await fetch('/api/sheets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        spreadsheetId, 
        setActive: true 
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to switch sheet');
    }
    
    setActiveSheetId(spreadsheetId);
    setSheetId(spreadsheetId);
    
    const sheets = GoogleSheetsService.getInstance();
    sheets.setSpreadsheetId(spreadsheetId);
    setConnected(true);
    
    await loadUserSheets();
    
    alert(`✅ Switched to sheet!`);
  } catch (error) {
    console.error('Error switching sheet:', error);
    alert('❌ Failed to switch sheet');
  }
};

// Add new sheet
const handleAddSheet = async (spreadsheetId: string, tag: string) => {
  if (!session?.user) return;
  
  try {
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetId, tag })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add sheet');
    }
    
    setSheetId(spreadsheetId);
    setActiveSheetId(spreadsheetId);
    
    const sheets = GoogleSheetsService.getInstance();
    sheets.setSpreadsheetId(spreadsheetId);
    setConnected(true);
    
    await loadUserSheets();
    
    alert(`✅ Sheet "${tag}" connected successfully!`);
  } catch (error) {
    console.error('Error adding sheet:', error);
    alert('❌ Failed to add sheet');
  }
};

// Replace handleRemoveSheet function
const handleRemoveSheet = async (spreadsheetId: string) => {
  if (!session?.user) return;
  
  try {
    const response = await fetch(`/api/sheets?id=${spreadsheetId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove sheet');
    }
    
    await loadUserSheets();
    
    if (spreadsheetId === activeSheetId) {
      setConnected(false);
      setSheetId('');
      setActiveSheetId(null);
    }
    
    alert('✅ Sheet removed');
  } catch (error) {
    console.error('Error removing sheet:', error);
    alert('❌ Failed to remove sheet');
  }
};

// Replace handleUpdateSheetTag function
const handleUpdateSheetTag = async (spreadsheetId: string, newTag: string) => {
  if (!session?.user) return;
  
  try {
    const response = await fetch('/api/sheets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        spreadsheetId, 
        tag: newTag 
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update tag');
    }
    
    await loadUserSheets();
    
    alert(`✅ Tag updated to "${newTag}"`);
  } catch (error) {
    console.error('Error updating tag:', error);
    alert('❌ Failed to update tag');
  }
};

const initializeApp = async () => {
  console.log('🚀 Starting app initialization...');
  setIsInitializing(true);
  
  try {
    // Load Google Scripts
    console.log('📚 Loading Google Scripts...');
    await loadGoogleScripts();
    
    // Initialize Google Sheets Service
    console.log('📊 Initializing Google Sheets...');
    const sheets = GoogleSheetsService.getInstance();
    await sheets.initialize();
    
    console.log('✅ Google Sheets initialized');
    
    // Check localStorage for saved sheet (fallback)
    const savedSheetId = localStorage.getItem('medhaSheetId');
    if (savedSheetId) {
      console.log('📋 Found saved sheet in localStorage:', savedSheetId);
      setSheetId(savedSheetId);
      sheets.setSpreadsheetId(savedSheetId);
      setConnected(true);
    }
    
  } catch (error) {
    console.error('❌ Initialization error:', error);
  } finally {
    console.log('🏁 App initialization complete');
    setIsInitializing(false);
  }
};


  const handleConnect = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      await sheets.authenticate();
      
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

  // ========== useEffect HOOKS (AFTER FUNCTIONS) ==========
// Debug logging
useEffect(() => {
  console.log('📊 Component State:', {
    status,
    isInitializing,
    connected,
    hasSession: !!session,
    userEmail: session?.user?.email,
    sheetsCount: userSheets.length,
    activeSheetId
  });
}, [status, isInitializing, connected, session, userSheets, activeSheetId]);

 // Initialize app once on mount
useEffect(() => {
  console.log('🎬 Component mounted, initializing app...');
  initializeApp();
}, []);

// Handle authentication and sheet loading
useEffect(() => {
  console.log('🔐 Auth status changed:', status);
  
  if (status === 'loading') {
    console.log('⏳ Auth still loading...');
    return;
  }
  
  if (status === 'unauthenticated') {
    console.log('🚫 User not authenticated, redirecting to login...');
    router.push('/login');
    return;
  }
  
  if (status === 'authenticated' && session?.user && !isInitializing) {
    console.log('✅ User authenticated, loading sheets...');
    loadUserSheets();
  }
}, [status, session, isInitializing, router]);


  // ========== RENDER ==========

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
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <div style={{ fontSize: '18px', color: '#64748b' }}>Initializing ERP System...</div>
        </div>
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
      {/* Header with Logo and User Profile */}
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
          {/* Logo Section */}
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
  
          {/* Right Side: Connection Status + User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Connection Status */}
            {connected ? (
              <span style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '8px 16px', 
                borderRadius: '20px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle className="w-4 h-4" />
                Connected: ...{sheetId.slice(-8)}
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
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Link className="w-4 h-4" />
                Connect Google Sheet
              </button>
            )}
  
            {/* User Profile Dropdown */}
            {session?.user && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                >
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'User'}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'white',
                      color: '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                      {session.user.name}
                    </div>
                  </div>
                </button>
  
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                      }}
                    />
                    
                    {/* Menu */}
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      minWidth: '220px',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      {/* User Info */}
                      <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f9fafb'
                      }}>
                        <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                          {session.user.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {session.user.email}
                        </div>
                      </div>
  
                      {/* Menu Items */}
                      <div style={{ padding: '8px' }}>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setActiveTab('settings');
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '14px',
                            color: '#374151',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <SettingsIcon className="w-4 h-4" />
                          Settings
                        </button>
                        
                        <div style={{
                          height: '1px',
                          background: '#e5e7eb',
                          margin: '8px 12px'
                        }} />
  
                        <button
                          onClick={() => signOut({ callbackUrl: '/login' })}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '14px',
                            color: '#dc2626',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
        {/* Sheet Switcher - Only show if authenticated */}
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
