'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { 
  Link, 
  CheckCircle, 
  Settings as SettingsIcon,
  LogOut 
} from 'lucide-react';

interface HeaderProps {
  connected: boolean;
  sheetId: string;
  session: any;
  onConnect: () => void;
  onSettingsClick: () => void;
}

export default function Header({ connected, sheetId, session, onConnect, onSettingsClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
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

        {/* Right Side */}
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
              onClick={onConnect}
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
                          onSettingsClick();
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
  );
}
