'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSettings } from '@/types/erp';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { Save, Building2, Phone, MapPin, FileText, Globe, Calculator } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<BusinessSettings>({
    name: '',
    gstNumber: '',
    phone: '',
    address: '',
    stateCode: '',
    logo: '',
    invoiceTerms: '',
    gstEnabled: true,
    defaultGstRate: 18
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      const data = await sheets.getRange('Settings!A2:I2');
      
      if (data.length > 0) {
        const row = data[0];
        setSettings({
          name: row[0] || '',
          gstNumber: row[1] || '',
          phone: row[2] || '',
          address: row[3] || '',
          stateCode: row[4] || '',
          logo: row[5] || '',
          invoiceTerms: row[6] || '',
          gstEnabled: row[7] === 'true' || row[7] === true,
          defaultGstRate: parseFloat(row[8]) || 18
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const sheets = GoogleSheetsService.getInstance();
    const settingsRow = [
      settings.name,
      settings.gstNumber,
      settings.phone,
      settings.address,
      settings.stateCode,
      settings.logo,
      settings.invoiceTerms,
      settings.gstEnabled.toString(),
      settings.defaultGstRate.toString()
    ];

    try {
      await sheets.updateRow('Settings!A2:I2', settingsRow);
      alert('✅ Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading settings...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Building2 className="w-8 h-8 text-indigo-600" />
        <h2 style={{ color: '#1e40af', margin: 0 }}>Business Settings</h2>
      </div>
      
      <form onSubmit={handleSave}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Business Name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e40af'
            }}>
              <Building2 className="w-4 h-4" />
              Business Name *
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
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
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e40af'
            }}>
              <FileText className="w-4 h-4" />
              GST Number
            </label>
            <input
              type="text"
              value={settings.gstNumber}
              onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
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
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e40af'
            }}>
              <Phone className="w-4 h-4" />
              Phone
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
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
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e40af'
            }}>
              <MapPin className="w-4 h-4" />
              Address *
            </label>
            <textarea
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
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
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e40af'
            }}>
              <MapPin className="w-4 h-4" />
              State Code (for GST)
            </label>
            <input
              type="text"
              value={settings.stateCode}
              onChange={(e) => setSettings({ ...settings, stateCode: e.target.value })}
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
            <small style={{ color: '#64748b', fontSize: '12px' }}>e.g., 22 for Chhattisgarh</small>
          </div>

          {/* Logo URL */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e40af'
            }}>
              <Globe className="w-4 h-4" />
              Logo URL (optional)
            </label>
            <input
              type="url"
              value={settings.logo}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
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

          {/* GST Settings */}
          <div style={{ 
            gridColumn: '1 / -1',
            background: '#f0f9ff',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #3b82f6'
          }}>
            <h3 style={{ 
              color: '#1e40af', 
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Calculator className="w-5 h-5" />
              GST Configuration
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <input
                type="checkbox"
                id="gstEnabled"
                checked={settings.gstEnabled}
                onChange={(e) => setSettings({ ...settings, gstEnabled: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="gstEnabled" style={{ cursor: 'pointer', fontWeight: '600' }}>
                Enable GST Calculations
              </label>
            </div>

            {settings.gstEnabled && (
              <div>
                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Default GST Rate (%)
                </label>
                <select
                  value={settings.defaultGstRate}
                  onChange={(e) => setSettings({ ...settings, defaultGstRate: parseFloat(e.target.value) })}
                  style={{
                    padding: '14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    width: '200px'
                  }}
                >
                  <option value="0">0% (Exempt)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                  For intra-state: CGST ({settings.defaultGstRate / 2}%) + SGST ({settings.defaultGstRate / 2}%)<br />
                  For inter-state: IGST ({settings.defaultGstRate}%)
                </p>
              </div>
            )}
          </div>

          {/* Invoice Terms */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e40af'
            }}>
              <FileText className="w-4 h-4" />
              Invoice Terms & Conditions
            </label>
            <textarea
              value={settings.invoiceTerms}
              onChange={(e) => setSettings({ ...settings, invoiceTerms: e.target.value })}
              placeholder="1. Payment due within 15 days&#10;2. Goods once sold will not be taken back&#10;3. Subject to Raipur jurisdiction"
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
          disabled={saving}
          style={{
            background: saving ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px 40px',
            borderRadius: '8px',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
