// src/app/components/erp/Invoices.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Invoice, Sale, BusinessSettings } from '@/types/erp';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { formatCurrency, calculateGST } from '@/lib/calculations';
import { generateInvoiceWhatsAppLink } from '@/lib/whatsappHelper';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadData = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      const salesData = await sheets.loadSales();
      setSales(salesData.filter(s => s.status === 'Pending' || s.status === 'Partial'));
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const stored = localStorage.getItem('businessSettings');
    if (stored) {
      setBusinessSettings(JSON.parse(stored));
    }
  };

  const generateInvoice = (sale: Sale) => {
    if (!businessSettings) {
      alert('⚠️ Please configure business settings first!');
      return;
    }

    const gstCalc = calculateGST(sale.total / 1.18, 'intra'); // Assuming intra-state
    
    const invoice: Invoice = {
      id: 'INV' + Date.now().toString().slice(-6),
      date: new Date().toLocaleDateString('en-IN'),
      customer: sale.customer,
      customerPhone: sale.customerPhone || '',
      items: [{
        name: sale.item,
        sku: '',
        qty: sale.qty,
        rate: sale.salePerUnit,
        amount: sale.total / 1.18
      }],
      subtotal: sale.total / 1.18,
      cgst: gstCalc.cgst,
      sgst: gstCalc.sgst,
      igst: gstCalc.igst,
      roundOff: 0,
      total: sale.total,
      status: 'Pending',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')
    };

    setSelectedSale(sale);
    setShowGenerator(true);
    
    // Show invoice preview
    showInvoicePreview(invoice);
  };

  const showInvoicePreview = (invoice: Invoice) => {
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (!previewWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { color: #1e40af; margin: 0; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .section { background: #f9fafb; padding: 15px; border-radius: 8px; }
          .section h3 { margin: 0 0 10px 0; color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: 600; }
          .totals { text-align: right; }
          .totals table { margin-left: auto; width: 300px; }
          .grand-total { font-size: 18px; font-weight: bold; background: #e0f2fe; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #64748b; }
          .terms { margin-top: 30px; font-size: 12px; color: #64748b; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${businessSettings?.name || 'Business Name'}</h1>
          <p>${businessSettings?.address || 'Address'}</p>
          <p>GST: ${businessSettings?.gstNumber || 'N/A'} | Phone: ${businessSettings?.phone || 'N/A'}</p>
        </div>

        <h2 style="color: #1e40af;">TAX INVOICE</h2>

        <div class="details">
          <div class="section">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customer}</strong></p>
            <p>${invoice.customerPhone}</p>
          </div>
          <div class="section">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice #:</strong> ${invoice.id}</p>
            <p><strong>Date:</strong> ${invoice.date}</p>
            <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${formatCurrency(item.rate)}</td>
                <td>${formatCurrency(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td><strong>${formatCurrency(invoice.subtotal)}</strong></td>
            </tr>
            ${invoice.cgst > 0 ? `
              <tr>
                <td>CGST (9%):</td>
                <td>${formatCurrency(invoice.cgst)}</td>
              </tr>
              <tr>
                <td>SGST (9%):</td>
                <td>${formatCurrency(invoice.sgst)}</td>
              </tr>
            ` : ''}
            ${invoice.igst > 0 ? `
              <tr>
                <td>IGST (18%):</td>
                <td>${formatCurrency(invoice.igst)}</td>
              </tr>
            ` : ''}
            <tr>
              <td>Round Off:</td>
              <td>${formatCurrency(invoice.roundOff)}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total:</td>
              <td><strong>${formatCurrency(invoice.total)}</strong></td>
            </tr>
          </table>
        </div>

        <div class="terms">
          <h4>Terms & Conditions:</h4>
          <p>${businessSettings?.invoiceTerms?.replace(/\n/g, '<br>') || 'Standard terms apply.'}</p>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <button onclick="window.print()" style="background:#3b82f6;color:white;padding:12px 24px;border:none;border-radius:6px;cursor:pointer;margin:10px;">
            🖨️ Print Invoice
          </button>
          <button onclick="window.close()" style="background:#64748b;color:white;padding:12px 24px;border:none;border-radius:6px;cursor:pointer;margin:10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `;

    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  const sendInvoiceViaWhatsApp = (sale: Sale) => {
    if (!sale.customerPhone) {
      alert('⚠️ Customer phone number not available!');
      return;
    }

    if (!businessSettings) {
      alert('⚠️ Please configure business settings first!');
      return;
    }

    const gstCalc = calculateGST(sale.total / 1.18, 'intra');
    
    const invoice: Invoice = {
      id: 'INV' + Date.now().toString().slice(-6),
      date: new Date().toLocaleDateString('en-IN'),
      customer: sale.customer,
      customerPhone: sale.customerPhone,
      items: [{
        name: sale.item,
        sku: '',
        qty: sale.qty,
        rate: sale.salePerUnit,
        amount: sale.total / 1.18
      }],
      subtotal: sale.total / 1.18,
      cgst: gstCalc.cgst,
      sgst: gstCalc.sgst,
      igst: gstCalc.igst,
      roundOff: 0,
      total: sale.total,
      status: 'Pending',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')
    };

    const waLink = generateInvoiceWhatsAppLink(sale.customerPhone, invoice, businessSettings.name);
    window.open(waLink, '_blank');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading invoices...</div>;
  }

  return (
    <div>
      <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>📄 Invoice Management</h2>
      
      {sales.length === 0 ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          background: '#f9fafb', 
          borderRadius: '12px' 
        }}>
          <p style={{ color: '#64748b', fontSize: '18px' }}>No pending sales to invoice.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Sale ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Item</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{sale.id}</td>
                  <td style={{ padding: '12px' }}>{sale.date}</td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{sale.customer}</td>
                  <td style={{ padding: '12px' }}>{sale.item}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{formatCurrency(sale.total)}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => generateInvoice(sale)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginRight: '8px'
                      }}
                    >
                      📄 Generate
                    </button>
                    {sale.customerPhone && (
                      <button
                        onClick={() => sendInvoiceViaWhatsApp(sale)}
                        style={{
                          background: '#25D366',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📱 Send
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
