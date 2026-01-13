'use client';

import React, { useState, useEffect } from 'react';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { WhatsAppHelper } from '@/lib/whatsappHelper';
import { Invoice, Bill, BusinessSettings } from '@/types/erp';
import { 
  Bell, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react';

export default function Reminders() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessPhone: ''
  });
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    loadData();
    loadWhatsAppConfig();
  }, []);

  const loadWhatsAppConfig = () => {
    const token = localStorage.getItem('whatsapp_access_token');
    const phoneId = localStorage.getItem('whatsapp_phone_number_id');
    const businessPhone = localStorage.getItem('business_phone_number');

    if (token && phoneId && businessPhone) {
      setWhatsappConfig({
        accessToken: token,
        phoneNumberId: phoneId,
        businessPhone: businessPhone
      });
      setConfigured(true);

      const whatsapp = WhatsAppHelper.getInstance();
      whatsapp.initialize(token, phoneId, businessPhone);
    }
  };

  const loadData = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      
      const invoicesData = await sheets.loadInvoices();
      setInvoices(invoicesData);

      const billsData = await sheets.loadBills();
      setBills(billsData);

      const settingsData = await sheets.getRange('Settings!A2:I2');
      if (settingsData.length > 0) {
        const row = settingsData[0];
        setSettings({
          name: row[0] || 'Medha Sanitary & Hardware',
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
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleConfigureWhatsApp = () => {
    const token = prompt('Enter WhatsApp Access Token:');
    if (!token) return;

    const phoneId = prompt('Enter Phone Number ID:');
    if (!phoneId) return;

    const businessPhone = prompt('Enter Business Phone Number (with country code, e.g., 919876543210):');
    if (!businessPhone) return;

    localStorage.setItem('whatsapp_access_token', token);
    localStorage.setItem('whatsapp_phone_number_id', phoneId);
    localStorage.setItem('business_phone_number', businessPhone);

    setWhatsappConfig({
      accessToken: token,
      phoneNumberId: phoneId,
      businessPhone: businessPhone
    });
    setConfigured(true);

    const whatsapp = WhatsAppHelper.getInstance();
    whatsapp.initialize(token, phoneId, businessPhone);

    alert('WhatsApp configured successfully!');
  };

  const sendSingleInvoiceReminder = async (invoice: Invoice) => {
    if (!configured) {
      alert('Please configure WhatsApp first!');
      return;
    }

    setSending(true);
    const whatsapp = WhatsAppHelper.getInstance();
    
    try {
      const success = await whatsapp.sendInvoiceReminder(
        invoice,
        settings?.name || 'Medha Sanitary & Hardware'
      );

      if (success) {
        alert(`Reminder sent to ${invoice.customer}`);
      } else {
        alert(`Failed to send reminder to ${invoice.customer}`);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Error sending reminder');
    } finally {
      setSending(false);
    }
  };

  const sendBulkReminders = async () => {
    if (!configured) {
      alert('Please configure WhatsApp first!');
      return;
    }

    const overdueInvoices = invoices.filter(inv => 
      inv.status === 'Pending' && new Date(inv.dueDate) < new Date()
    );

    if (overdueInvoices.length === 0) {
      alert('No overdue invoices to send reminders for.');
      return;
    }

    if (!confirm(`Send reminders to ${overdueInvoices.length} customers?`)) {
      return;
    }

    setSending(true);
    const whatsapp = WhatsAppHelper.getInstance();

    try {
      const result = await whatsapp.sendBulkInvoiceReminders(
        overdueInvoices,
        settings?.name || 'Medha Sanitary & Hardware'
      );

      alert(`Sent: ${result.sent}\nFailed: ${result.failed}`);
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
      alert('Error sending bulk reminders');
    } finally {
      setSending(false);
    }
  };

  const getOverdueInvoices = () => {
    return invoices.filter(inv => 
      inv.status === 'Pending' && new Date(inv.dueDate) < new Date()
    );
  };

  const getDueTodayInvoices = () => {
    const today = new Date().toISOString().split('T')[0];
    return invoices.filter(inv => 
      inv.status === 'Pending' && inv.dueDate === today
    );
  };

  const getUpcomingInvoices = () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    return invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return inv.status === 'Pending' && 
             dueDate > today && 
             dueDate <= threeDaysFromNow;
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span style={{ marginLeft: '12px', fontSize: '16px', color: '#64748b' }}>Loading reminders...</span>
      </div>
    );
  }

  const overdueInvoices = getOverdueInvoices();
  const dueTodayInvoices = getDueTodayInvoices();
  const upcomingInvoices = getUpcomingInvoices();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell className="w-8 h-8 text-indigo-600" />
          <h2 style={{ color: '#1e293b', margin: 0 }}>Payment Reminders</h2>
        </div>
        {!configured ? (
          <button
            onClick={handleConfigureWhatsApp}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MessageSquare className="w-4 h-4" />
            Configure WhatsApp
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={sendBulkReminders}
              disabled={sending || overdueInvoices.length === 0}
              style={{
                background: sending || overdueInvoices.length === 0 ? '#94a3b8' : '#ef4444',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: sending || overdueInvoices.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : `Send Bulk Reminders (${overdueInvoices.length})`}
            </button>
            <button
              onClick={handleConfigureWhatsApp}
              style={{
                background: '#64748b',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Reconfigure
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: '2px solid #ef4444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 style={{ margin: 0, color: '#991b1b' }}>Overdue</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#991b1b', margin: 0 }}>
            {overdueInvoices.length}
          </p>
          <p style={{ fontSize: '14px', color: '#7f1d1d', margin: '4px 0 0 0' }}>
            ₹{overdueInvoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: '2px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Calendar className="w-6 h-6 text-yellow-600" />
            <h3 style={{ margin: 0, color: '#92400e' }}>Due Today</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
            {dueTodayInvoices.length}
          </p>
          <p style={{ fontSize: '14px', color: '#78350f', margin: '4px 0 0 0' }}>
            ₹{dueTodayInvoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: '2px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <DollarSign className="w-6 h-6 text-blue-600" />
            <h3 style={{ margin: 0 }}>Upcoming (3 days)</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
            {upcomingInvoices.length}
          </p>
          <p style={{ fontSize: '14px', color: '#1e3a8a', margin: '4px 0 0 0' }}>
            ₹{upcomingInvoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Overdue Invoices */}
      {overdueInvoices.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle className="w-5 h-5" />
            Overdue Invoices
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
              <thead>
                <tr style={{ background: '#fee2e2' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ef4444' }}>Invoice ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ef4444' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ef4444' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ef4444' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ef4444' }}>Due Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ef4444' }}>Days Overdue</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ef4444' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {overdueInvoices.map(invoice => {
                  const daysOverdue = Math.floor(
                    (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={invoice.id} style={{ borderBottom: '1px solid #fecaca' }}>
                      <td style={{ padding: '12px' }}>{invoice.id}</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{invoice.customer}</td>
                      <td style={{ padding: '12px' }}>{invoice.customerPhone}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>₹{invoice.total.toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#ef4444' }}>{invoice.dueDate}</td>
                      <td style={{ padding: '12px', color: '#ef4444', fontWeight: 'bold' }}>{daysOverdue} days</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => sendSingleInvoiceReminder(invoice)}
                          disabled={sending || !configured}
                          style={{
                            background: sending || !configured ? '#94a3b8' : '#ef4444',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: sending || !configured ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Send className="w-3 h-3" />
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Due Today */}
      {dueTodayInvoices.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#f59e0b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar className="w-5 h-5" />
            Due Today
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
              <thead>
                <tr style={{ background: '#fef3c7' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #f59e0b' }}>Invoice ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #f59e0b' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #f59e0b' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #f59e0b' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #f59e0b' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dueTodayInvoices.map(invoice => (
                  <tr key={invoice.id} style={{ borderBottom: '1px solid #fde68a' }}>
                    <td style={{ padding: '12px' }}>{invoice.id}</td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{invoice.customer}</td>
                    <td style={{ padding: '12px' }}>{invoice.customerPhone}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>₹{invoice.total.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => sendSingleInvoiceReminder(invoice)}
                        disabled={sending || !configured}
                        style={{
                          background: sending || !configured ? '#94a3b8' : '#f59e0b',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: sending || !configured ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Send className="w-3 h-3" />
                        Send Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {overdueInvoices.length === 0 && dueTodayInvoices.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#d1fae5',
          borderRadius: '12px',
          border: '2px solid #10b981'
        }}>
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#065f46', margin: '0 0 8px 0' }}>All Clear!</h3>
          <p style={{ color: '#047857', margin: 0 }}>No overdue or due today invoices.</p>
        </div>
      )}
    </div>
  );
}
