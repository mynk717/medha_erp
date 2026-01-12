'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogIn, Shield, Zap, Database } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/erp');
    }
  }, [status, router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1e40af',
            marginBottom: '8px'
          }}>
            Medha ERP
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Smart Business Management Platform
          </p>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '32px' }}>
          {[
            { icon: Shield, text: 'Secure Multi-Tenant Architecture' },
            { icon: Zap, text: 'Real-time Google Sheets Integration' },
            { icon: Database, text: 'Your Data, Your Control' }
          ].map((feature, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              marginBottom: '8px',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <feature.icon className="w-5 h-5 text-indigo-600" />
              <span style={{ fontSize: '14px', color: '#475569' }}>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/erp' })}
          disabled={status === 'loading'}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            if (status !== 'loading') {
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <LogIn className="w-5 h-5" />
          {status === 'loading' ? 'Loading...' : 'Sign in with Google'}
        </button>

        {/* Privacy Note */}
        <p style={{
          marginTop: '24px',
          fontSize: '12px',
          color: '#94a3b8',
          textAlign: 'center'
        }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
          All your data stays in your Google Sheet.
        </p>
      </div>
    </div>
  );
}
