'use client';

import React, { useState, useEffect } from 'react';
import { Bill } from '@/types/erp';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { formatCurrency } from '@/lib/calculations';
import { generateBillPDF } from '@/lib/pdfGenerator';
import { 
  Eye, 
  Download, 
  Printer, 
  CheckCircle, 
  X,
  AlertCircle 
} from 'lucide-react';

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewBill, setPreviewBill] = useState<Bill | null>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    total: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadBills();
    loadBusinessSettings();
  }, []);

  const loadBusinessSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      const data = await response.json();
      setBusinessSettings(data.settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  const loadBills = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      const billsData = await sheets.loadBills();
      setBills(billsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading bills:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sheets = GoogleSheetsService.getInstance();
    const newId = 'BILL' + Date.now().toString().slice(-6);
    
    const newBill = [
      newId,
      formData.date,
      formData.supplier,
      formData.total.toFixed(2),
      formData.dueDate,
      'Pending',
      formData.notes
    ];

    try {
      await sheets.appendRow('Bills!A:G', newBill);
      
      const billObj: Bill = {
        id: newId,
        date: formData.date,
        supplier: formData.supplier,
        total: formData.total,
        dueDate: formData.dueDate,
        status: 'Pending',
        notes: formData.notes
      };
      
      setBills([...bills, billObj]);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        total: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      });
      
      alert('✅ Bill recorded successfully!');
    } catch (error) {
      console.error('Error adding bill:', error);
      alert('❌ Failed to record bill');
    }
  };

  const markAsPaid = async (billId: string, index: number) => {
    if (!confirm('Mark this bill as paid?')) return;
    
    try {
      const sheets = GoogleSheetsService.getInstance();
      const updatedBills = [...bills];
      updatedBills[index].status = 'Paid';
      
      await sheets.updateRow(`Bills!F${index + 2}`, ['Paid']);
      setBills(updatedBills);
      alert('✅ Bill marked as paid!');
    } catch (error) {
      console.error('Error updating bill:', error);
      alert('❌ Failed to update bill');
    }
  };

  const handleDownloadPDF = async (bill: Bill) => {
    try {
      await generateBillPDF(bill);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Failed to generate PDF');
    }
  };

  const handlePrint = (bill: Bill) => {
    setPreviewBill(bill);
    // Wait for modal to render, then trigger print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading bills...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1e293b', margin: 0 }}>Bills & Payables</h2>
      </div>
      
      {/* Bills Table */}
      <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1e293b' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Supplier</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Due Date</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Notes</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, index) => {
              const isOverdue = bill.status === 'Pending' && new Date(bill.dueDate) < new Date();
              return (
                <tr key={bill.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', color: '#1e293b' }}>{bill.id}</td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>{bill.date}</td>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{bill.supplier}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{formatCurrency(bill.total)}</td>
                  <td style={{ 
                    padding: '12px',
                    color: isOverdue ? '#ef4444' : '#64748b'
                  }}>
                    {bill.dueDate}
                  </td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: bill.status === 'Paid' ? '#d1fae5' : isOverdue ? '#fee2e2' : '#fef3c7',
                      color: bill.status === 'Paid' ? '#065f46' : isOverdue ? '#991b1b' : '#92400e',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {bill.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : isOverdue ? <AlertCircle className="w-3 h-3" /> : null}
                      {isOverdue && bill.status === 'Pending' ? 'Overdue' : bill.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#1e293b',fontSize: '12px' }}>{bill.notes}</td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {bill.status === 'Pending' && (
                        <button
                          onClick={() => markAsPaid(bill.id, index)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewBill(bill)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(bill)}
                        style={{
                          background: '#8b5cf6',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </button>
                      <button
                        onClick={() => handlePrint(bill)}
                        style={{
                          background: '#64748b',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Printer className="w-3 h-3" />
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Bill Form */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '16px' }}>➕ Record New Bill</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              style={{
                padding: '14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
              color: '#1e293b'
              }}
            />
            <input
              type="text"
              placeholder="Supplier Name *"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              required
              style={{
                padding: '14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
              color: '#1e293b'
              }}
            />
            <input
              type="number"
              placeholder="Total Amount ₹ *"
              value={formData.total || ''}
              onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
              required
              step="0.01"
              min="0"
              style={{
                padding: '14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
              color: '#1e293b'
              }}
            />
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              style={{
                padding: '14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
              color: '#1e293b'
              }}
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                padding: '14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
                gridColumn: 'span 2'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            ✅ Record Bill
          </button>
        </form>
      </div>

      {/* Preview Modal */}
      {previewBill && (
        <div 
          onClick={() => setPreviewBill(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewBill(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Bill Preview Content */}
            <div style={{ padding: '40px' }} className="print-content">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                {businessSettings?.logo && (
                  <img 
                    src={businessSettings.logo} 
                    alt="Business Logo" 
                    style={{ 
                      maxHeight: '80px', 
                      marginBottom: '16px',
                      objectFit: 'contain'
                    }} 
                  />
                )}
                <h1 style={{ color: '#1e293b', margin: '0 0 12px 0', fontSize: '28px', fontWeight: '700' }}>
                  BILL
                </h1>
                <p style={{ 
                  color: '#1e293b', 
                  margin: '0 0 4px 0', 
                  fontSize: '18px', 
                  fontWeight: '600' 
                }}>
                  {businessSettings?.businessName || 'Business Name'}
                </p>
                <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '14px' }}>
                  {businessSettings?.address || ''}
                </p>
                {businessSettings?.gstNumber && (
                  <p style={{ color: '#64748b', margin: '0 0 4px 0', fontSize: '13px' }}>
                    GST: {businessSettings.gstNumber}
                  </p>
                )}
                {businessSettings?.phone && (
                  <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>
                    Phone: {businessSettings.phone}
                  </p>
                )}
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '24px',
                marginBottom: '32px',
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '2px solid #e2e8f0'
              }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Bill ID
                  </p>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>
                    {previewBill.id}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Date
                  </p>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>
                    {previewBill.date}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Supplier
                  </p>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>
                    {previewBill.supplier}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Due Date
                  </p>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>
                    {previewBill.dueDate}
                  </p>
                </div>
              </div>

              <div style={{ 
                padding: '24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: '500' }}>
                    Total Amount
                  </p>
                  <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#1e293b' }}>
                    {formatCurrency(previewBill.total)}
                  </p>
                </div>
              </div>

              {previewBill.notes && (
                <div style={{ 
                  padding: '16px', 
                  background: '#fef3c7', 
                  borderRadius: '8px', 
                  borderLeft: '4px solid #f59e0b',
                  marginBottom: '24px'
                }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: '600', color: '#92400e', fontSize: '14px' }}>
                    Notes:
                  </p>
                  <p style={{ margin: 0, color: '#78350f', fontSize: '14px', lineHeight: '1.6' }}>
                    {previewBill.notes}
                  </p>
                </div>
              )}

              {businessSettings?.invoiceTerms && (
                <div style={{ 
                  padding: '16px', 
                  background: '#f1f5f9', 
                  borderRadius: '8px',
                  marginBottom: '24px',
                  border: '1px solid #cbd5e1'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    Terms & Conditions:
                  </p>
                  <p style={{ 
                    margin: 0, 
                    color: '#475569', 
                    fontSize: '12px', 
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line'
                  }}>
                    {businessSettings.invoiceTerms}
                  </p>
                </div>
              )}

              <div style={{ 
                marginTop: '40px', 
                paddingTop: '16px', 
                borderTop: '2px solid #e5e7eb',
                fontSize: '12px',
                color: '#64748b',
                textAlign: 'center'
              }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>
                  Thank you for your business!
                </p>
                <p style={{ margin: 0 }}>
                  Generated by Medha ERP System
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              padding: '20px', 
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }} className="no-print">
              <button
                onClick={() => handleDownloadPDF(previewBill)}
                style={{
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
