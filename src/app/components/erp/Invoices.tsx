'use client';

import React, { useState, useEffect } from 'react';
import { Invoice, Sale, BusinessSettings } from '@/types/erp';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { formatCurrency, calculateGST } from '@/lib/calculations';
import { WhatsAppHelper } from '@/lib/whatsappHelper';
import { downloadInvoicePDF } from '@/lib/pdfGenerator';
import { 
  FileText, 
  Download, 
  Send, 
  Eye, 
  Printer,
  AlertCircle,
  Loader2
} from 'lucide-react';

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

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      const data = await response.json();
      
      // Map API response to BusinessSettings format
      const settings: BusinessSettings = {
        name: data.settings.businessName || 'Business Name',
        gstNumber: data.settings.gstNumber || '',
        phone: data.settings.phone || '',
        address: data.settings.address || '',
        stateCode: data.settings.stateCode || '',
        logo: data.settings.logo || '',
        invoiceTerms: data.settings.invoiceTerms || '',
        gstEnabled: data.settings.gstEnabled ?? true,
        defaultGstRate: data.settings.defaultGstRate || 18
      };
      
      setBusinessSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
      alert('Please configure business settings first!');
    }
  };
  

  const generateInvoice = (sale: Sale) => {
    if (!businessSettings) {
      alert('Please configure business settings first!');
      return;
    }

    const gstCalc = calculateGST(sale.total / 1.18, 'intra');
    
    const invoice: Invoice = {
      id: 'INV' + Date.now().toString().slice(-6),
      date: new Date().toISOString().split('T')[0],
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
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      gstRate: businessSettings.defaultGstRate
    };

    setSelectedSale(sale);
    setShowGenerator(true);
    
    showInvoicePreview(invoice);
  };

  const showInvoicePreview = (invoice: Invoice) => {
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (!previewWindow) return;
  
    // Generate WhatsApp link using wa.me
    const generateWhatsAppLink = () => {
      if (!invoice.customerPhone) return '';
      
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = invoice.customerPhone.replace(/\D/g, '');
      
      // Add country code if not present (assuming India +91)
      const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
      
      // Create message
      const message = `Hello ${invoice.customer}! 👋
  
  Here's your invoice from *${businessSettings?.name || 'Our Business'}*
  
  📄 *Invoice #${invoice.id}*
  📅 Date: ${invoice.date}
  💰 Total Amount: ${formatCurrency(invoice.total)}
  
  *Items:*
  ${invoice.items.map(item => `• ${item.name} - Qty: ${item.qty} @ ${formatCurrency(item.rate)}`).join('\n')}
  
  *Payment Details:*
  Subtotal: ${formatCurrency(invoice.subtotal)}
  ${invoice.cgst > 0 ? `CGST (9%): ${formatCurrency(invoice.cgst)}\nSGST (9%): ${formatCurrency(invoice.sgst)}` : ''}
  ${invoice.igst > 0 ? `IGST (18%): ${formatCurrency(invoice.igst)}` : ''}
  *Grand Total: ${formatCurrency(invoice.total)}*
  
  📅 Due Date: ${invoice.dueDate}
  
  ${businessSettings?.invoiceTerms ? '\n*Terms & Conditions:*\n' + businessSettings.invoiceTerms : ''}
  
  Thank you for your business! 🙏`;
  
      return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    };
  
    const whatsappLink = generateWhatsAppLink();
  
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
            background: #f8fafc;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #6366f1; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .header h1 { color: #1e293b; margin: 0 0 8px 0; }
          .header p { color: #64748b; margin: 4px 0; }
          .invoice-title {
            color: #6366f1;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
          }
          .details { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 30px; 
          }
          .section { 
            background: #f8fafc; 
            color: #1e293b; 
            padding: 20px; 
            border-radius: 8px;
            border: 2px solid #e2e8f0;
          }
          .section h3 { 
            margin: 0 0 12px 0; 
            color: #6366f1;
            font-size: 16px;
            font-weight: 600;
          }
          .section p {
            margin: 6px 0;
            color: #475569;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e5e7eb; 
          }
          th { 
            background: #1e293b; 
            color: #ffffff; 
            font-weight: 600; 
          }
          tbody td {
            color: #1e293b;
          }
          .totals { text-align: right; }
          .totals table { 
            margin-left: auto; 
            width: 350px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }
          .totals td {
            padding: 10px 16px;
            color: #475569;
          }
          .grand-total { 
            font-size: 18px; 
            font-weight: bold; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
          }
          .grand-total td {
            color: white !important;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #e5e7eb; 
            text-align: center; 
            color: #64748b; 
          }
          .terms { 
            margin-top: 30px; 
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #6366f1;
          }
          .terms h4 {
            color: #1e293b;
            margin: 0 0 12px 0;
          }
          .terms p {
            font-size: 13px;
            color: #475569;
            line-height: 1.6;
          }
          .btn { 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            margin: 10px 5px; 
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .btn-whatsapp { background: #25D366; color: white; }
          .btn-print { background: #3b82f6; color: white; }
          .btn-close { background: #64748b; color: white; }
          @media print { 
            button { display: none; }
            body { background: white; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${businessSettings?.logo ? `<img src="${businessSettings.logo}" alt="Logo" style="max-height: 80px; margin-bottom: 12px;">` : ''}
            <h1>${businessSettings?.name || 'Business Name'}</h1>
            <p>${businessSettings?.address || 'Address'}</p>
            <p>GST: ${businessSettings?.gstNumber || 'N/A'} | Phone: ${businessSettings?.phone || 'N/A'}</p>
          </div>
  
          <div class="invoice-title">TAX INVOICE</div>
  
          <div class="details">
            <div class="section">
              <h3>Bill To:</h3>
              <p><strong>${invoice.customer}</strong></p>
              <p>Phone: ${invoice.customerPhone || 'N/A'}</p>
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
  
          ${businessSettings?.invoiceTerms ? `
            <div class="terms">
              <h4>Terms & Conditions:</h4>
              <p>${businessSettings.invoiceTerms.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}
  
          <div class="footer">
            <p style="font-size: 16px; font-weight: 600; color: #1e293b;">Thank you for your business!</p>
            <p style="font-size: 12px; margin-top: 8px;">Generated by Medha ERP System</p>
            
            <div style="margin-top: 20px;">
              ${whatsappLink ? `
                <button onclick="window.open('${whatsappLink}', '_blank')" class="btn btn-whatsapp">
                  📱 Send via WhatsApp
                </button>
              ` : ''}
              <button onclick="window.print()" class="btn btn-print">
                🖨️ Print Invoice
              </button>
              <button onclick="window.close()" class="btn btn-close">
                ✖️ Close
              </button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  
    previewWindow.document.write(html);
    previewWindow.document.close();
  };
  

  const sendInvoiceViaWhatsApp = (sale: Sale) => {
    if (!sale.customerPhone) {
      alert('Customer phone number not available!');
      return;
    }
  
    if (!businessSettings) {
      alert('Please configure business settings first!');
      return;
    }
  
    const gstCalc = calculateGST(sale.total / 1.18, 'intra');
    
    const invoice: Invoice = {
      id: 'INV' + Date.now().toString().slice(-6),
      date: new Date().toISOString().split('T')[0],
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
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      gstRate: businessSettings.defaultGstRate
    };
  
    // Clean phone number
    const cleanPhone = sale.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
    
    // Create message
    const message = `Hello ${invoice.customer}! 👋
  
  Here's your invoice from *${businessSettings.name}*
  
  📄 *Invoice #${invoice.id}*
  📅 Date: ${invoice.date}
  💰 Total Amount: ${formatCurrency(invoice.total)}
  
  *Items:*
  ${invoice.items.map(item => `• ${item.name} - Qty: ${item.qty} @ ${formatCurrency(item.rate)}`).join('\n')}
  
  *Payment Details:*
  Subtotal: ${formatCurrency(invoice.subtotal)}
  ${invoice.cgst > 0 ? `CGST (9%): ${formatCurrency(invoice.cgst)}\nSGST (9%): ${formatCurrency(invoice.sgst)}` : ''}
  ${invoice.igst > 0 ? `IGST (18%): ${formatCurrency(invoice.igst)}` : ''}
  *Grand Total: ${formatCurrency(invoice.total)}*
  
  📅 Due Date: ${invoice.dueDate}
  
  ${businessSettings.invoiceTerms ? '\n*Terms & Conditions:*\n' + businessSettings.invoiceTerms : ''}
  
  Thank you for your business! 🙏`;
  
    // Open WhatsApp with wa.me link
    const waLink = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };
  

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span style={{ marginLeft: '12px', fontSize: '16px', color: '#64748b' }}>Loading invoices...</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FileText className="w-8 h-8 text-indigo-600" />
        <h2 style={{ color: '#1e293b', margin: 0 }}>Invoice Management</h2>
      </div>
      
      {sales.length === 0 ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          background: '#1e293b', 
          borderRadius: '12px',
          border: '2px solid #e5e7eb'
        }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '18px', margin: 0 }}>No pending sales to invoice.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
            <thead>
              <tr style={{ background: '#1e293b' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Sale ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Item</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', color: '#1e293b' }}>{sale.id}</td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>{sale.date}</td>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>{sale.customer}</td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>{sale.item}</td>
                  <td style={{ padding: '12px', color: '#1e293b',fontWeight: 'bold' }}>{formatCurrency(sale.total)}</td>
                  <td style={{ padding: '12px', color: '#1e293b' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          if (!businessSettings) {
                            alert('Please configure business settings first!');
                            return;
                          }
                          const gstCalc = calculateGST(sale.total / 1.18, 'intra');
                          const invoice: Invoice = {
                            id: 'INV' + Date.now().toString().slice(-6),
                            date: new Date().toISOString().split('T')[0],
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
                            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            gstRate: businessSettings.defaultGstRate
                          };
                          downloadInvoicePDF(invoice, businessSettings);
                        }}
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
                        <Download className="w-3 h-3" />
                        PDF
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
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Send className="w-3 h-3" />
                          Send
                        </button>
                      )}
                    </div>
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
