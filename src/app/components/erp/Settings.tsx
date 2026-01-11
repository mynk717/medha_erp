// src/app/components/erp/Settings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSettings } from '@/types/erp';

export default function Settings() {
  const [settings, setSettings] = useState<BusinessSettings>({
    name: '',
    gstNumber: '',
    phone: '',
    address: '',
    stateCode: '',
    logo: '',
    invoiceTerms: '1. Payment due within 15 days\n2. Goods once sold will not be taken back\n3. Subject to local jurisdiction'
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('businessSettings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('businessSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>⚙️ Business Settings</h2>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Business Name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              Business Name *
            </label>
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
              placeholder="Medha Sanitary & Hardware"
              required
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* GST Number */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              GST Number
            </label>
            <input
              type="text"
              name="gstNumber"
              value={settings.gstNumber}
              onChange={handleChange}
              placeholder="22AAAAA0000A1Z5"
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Address */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              Business Address *
            </label>
            <textarea
              name="address"
              value={settings.address}
              onChange={handleChange}
              placeholder="Shop No. 5, Main Road, Raipur, Chhattisgarh - 492001"
              rows={3}
              required
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* State Code */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              State Code (for GST)
            </label>
            <input
              type="text"
              name="stateCode"
              value={settings.stateCode}
              onChange={handleChange}
              placeholder="22"
              maxLength={2}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              e.g., 22 for Chhattisgarh, 27 for Maharashtra
            </small>
          </div>

          {/* Logo URL */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              Logo URL (optional)
            </label>
            <input
              type="url"
              name="logo"
              value={settings.logo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Invoice Terms */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
              Invoice Terms & Conditions
            </label>
            <textarea
              name="invoiceTerms"
              value={settings.invoiceTerms}
              onChange={handleChange}
              rows={4}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          💾 Save Settings
        </button>

        {saved && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#10b981',
            color: 'white',
            borderRadius: '8px',
            fontWeight: '500'
          }}>
            ✅ Settings saved successfully!
          </div>
        )}
      </form>
    </div>
  );
}
