'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSettings } from '@/types/erp';
import { 
  Save, 
  Building2, 
  Phone, 
  MapPin, 
  FileText, 
  Globe, 
  Calculator,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<any>({
    businessName: '',
    gstNumber: '',
    phone: '',
    address: '',
    stateCode: '',
    logo: '',
    invoiceTerms: '',
    gstEnabled: true,
    defaultGstRate: 18,
    email: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    upiId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      
      const data = await response.json();
      
      // Map API data to state
      setSettings({
        businessName: data.settings.businessName || '',
        gstNumber: data.settings.gstNumber || '',
        phone: data.settings.phone || '',
        address: data.settings.address || '',
        stateCode: data.settings.stateCode || '',
        logo: data.settings.logo || '',
        invoiceTerms: data.settings.invoiceTerms || '',
        gstEnabled: data.settings.gstEnabled ?? true,
        defaultGstRate: data.settings.defaultGstRate || 18,
        email: data.settings.email || '',
        bankName: data.settings.bankName || '',
        accountNumber: data.settings.accountNumber || '',
        ifsc: data.settings.ifsc || '',
        upiId: data.settings.upiId || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
      alert('Failed to load settings');
    }
  };

  // ✅ NEW: Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or SVG)');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    setUploadingLogo(true);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update settings with base64 image
      setSettings({ ...settings, logo: base64 });
      alert('✅ Logo uploaded! Click "Save Settings" to apply changes.');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('❌ Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // ✅ NEW: Remove logo
  const handleRemoveLogo = () => {
    if (confirm('Remove business logo?')) {
      setSettings({ ...settings, logo: '' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      alert('✅ Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: '#1e293b', 
        fontSize: '16px' 
      }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '24px' 
      }}>
        <Building2 className="w-8 h-8" style={{ color: '#6366f1' }} />
        <h2 style={{ color: '#1e293b', margin: 0, fontSize: '24px', fontWeight: '700' }}>
          Business Settings
        </h2>
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
              color: '#1e293b',
              fontSize: '14px'
            }}>
              <Building2 className="w-4 h-4" />
              Business Name *
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              placeholder="Medha Sanitary & Hardware"
              required
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1e293b',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* ✅ NEW: Logo Upload Section */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e293b',
              fontSize: '14px'
            }}>
              <ImageIcon className="w-4 h-4" />
              Business Logo
            </label>
            
            {/* Logo Preview */}
            {settings.logo && (
              <div style={{ 
                marginBottom: '12px', 
                padding: '16px', 
                background: '#f8fafc', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '2px solid #e2e8f0'
              }}>
                <img 
                  src={settings.logo} 
                  alt="Business Logo" 
                  style={{ 
                    maxHeight: '80px', 
                    maxWidth: '200px',
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }} 
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}

            {/* Upload Button */}
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
                disabled={uploadingLogo}
              />
              <label
                htmlFor="logo-upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: uploadingLogo ? '#94a3b8' : '#6366f1',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                {uploadingLogo ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {settings.logo ? 'Change Logo' : 'Upload Logo'}
                  </>
                )}
              </label>
            </div>
            <small style={{ display: 'block', marginTop: '8px', color: '#64748b', fontSize: '12px' }}>
              Recommended: 200x200px • Max 2MB • PNG, JPG, or SVG
            </small>
          </div>

          {/* GST Number */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e293b',
              fontSize: '14px'
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
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1e293b',
                backgroundColor: '#ffffff'
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
              color: '#1e293b',
              fontSize: '14px'
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
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1e293b',
                backgroundColor: '#ffffff'
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
              color: '#1e293b',
              fontSize: '14px'
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
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit',
                color: '#1e293b',
                backgroundColor: '#ffffff'
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
              color: '#1e293b',
              fontSize: '14px'
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
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1e293b',
                backgroundColor: '#ffffff'
              }}
            />
            <small style={{ 
              color: '#64748b', 
              fontSize: '12px', 
              marginTop: '4px', 
              display: 'block' 
            }}>
              e.g., 22 for Chhattisgarh
            </small>
          </div>

          {/* Logo URL (kept for backward compatibility) */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#1e293b',
              fontSize: '14px'
            }}>
              <Globe className="w-4 h-4" />
              Or Enter Logo URL (optional)
            </label>
            <input
              type="url"
              value={settings.logo && !settings.logo.startsWith('data:') ? settings.logo : ''}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
              disabled={settings.logo && settings.logo.startsWith('data:')}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1e293b',
                backgroundColor: settings.logo && settings.logo.startsWith('data:') ? '#f1f5f9' : '#ffffff',
                cursor: settings.logo && settings.logo.startsWith('data:') ? 'not-allowed' : 'text'
              }}
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
              {settings.logo && settings.logo.startsWith('data:') ? 'Using uploaded logo. Remove it to use URL instead.' : 'Alternative to uploading a logo file'}
            </small>
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
              color: '#1e293b', 
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              <Calculator className="w-5 h-5" style={{ color: '#3b82f6' }} />
              GST Configuration
            </h3>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '16px' 
            }}>
              <input
                type="checkbox"
                id="gstEnabled"
                checked={settings.gstEnabled}
                onChange={(e) => setSettings({ ...settings, gstEnabled: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label 
                htmlFor="gstEnabled" 
                style={{ 
                  cursor: 'pointer', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  fontSize: '14px' 
                }}
              >
                Enable GST Calculations
              </label>
            </div>

            {settings.gstEnabled && (
              <div>
                <label style={{ 
                  fontWeight: '600', 
                  marginBottom: '8px', 
                  display: 'block',
                  color: '#1e293b',
                  fontSize: '14px'
                }}>
                  Default GST Rate (%)
                </label>
                <select
                  value={settings.defaultGstRate}
                  onChange={(e) => setSettings({ ...settings, defaultGstRate: parseFloat(e.target.value) })}
                  style={{
                    padding: '14px',
                    border: '2px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '16px',
                    width: '200px',
                    color: '#1e293b',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="0">0% (Exempt)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
                <p style={{ 
                  fontSize: '12px', 
                  marginTop: '8px', 
                  color: '#475569',
                  lineHeight: '1.6' 
                }}>
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
              color: '#1e293b',
              fontSize: '14px'
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
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit',
                color: '#1e293b',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            background: saving ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
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

      {/* ✅ Add spinning animation for upload indicator */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
