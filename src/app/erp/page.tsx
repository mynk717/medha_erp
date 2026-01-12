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
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const initializeApp = async () => {
    try {
      await loadGoogleScripts();
      const sheets = GoogleSheetsService.getInstance();
      const savedSheetId = localStorage.getItem('medhaSheetId');
      if (savedSheetId) {
        setSheetId(savedSheetId);
        sheets.setSpreadsheetId(savedSheetId);
      }
      await sheets.initialize();
      setIsInitializing(false);
    } catch (error) {
      console.error('Initialization error:', error);
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

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  // ========== RENDER ==========

  if (loading || status === 'loading') {
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
        background: 'white',
        borderBottom: '2px solid #e5e7eb',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        {/* Logo */}
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0 
        }}>
          Medha ERP
        </h1>
  
        {/* User Profile */}
        {session?.user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#6366f1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #6366f1'
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '18px'
                }}>
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>
                  {session.user.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {session.user.email}
                </div>
              </div>
            </button>
  
            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop to close menu */}
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
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  minWidth: '220px',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  {/* User Info Section */}
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
                        e.currentTarget.style.color = '#1f2937';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#374151';
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
                      onClick={() => {
                        signOut({ callbackUrl: '/login' });
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
                        color: '#dc2626',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fef2f2';
                        e.currentTarget.style.color = '#b91c1c';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#dc2626';
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
      </header>
  
      {/* Main Content Area */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '260px',
          background: 'white',
          borderRight: '2px solid #e5e7eb',
          padding: '24px 0'
        }}>
          {/* Sheet Connection Status */}
          {!sheetId ? (
            <div style={{
              margin: '0 20px 24px 20px',
              padding: '16px',
              background: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '12px'
            }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                📋 Connect Your Sheet
              </p>
              <button
                onClick={handleConnect}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Connect Sheet
              </button>
            </div>
          ) : (
            <div style={{
              margin: '0 20px 24px 20px',
              padding: '12px',
              background: '#d1fae5',
              border: '2px solid #10b981',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle className="w-4 h-4 text-green-600" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>
                Sheet Connected
              </span>
            </div>
          )}
  
          {/* Navigation Tabs */}
          <nav>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                    color: isActive ? 'white' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '15px',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s',
                    borderLeft: isActive ? '4px solid white' : '4px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.color = '#1e293b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>
  
        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto'
        }}>
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );  
}
