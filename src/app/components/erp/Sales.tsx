// src/app/components/erp/Sales.tsx - FIXED
'use client';

import React, { useState, useEffect } from 'react';
import { Sale, InventoryItem } from '@/types/erp';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { formatCurrency } from '@/lib/calculations';
import WhatsAppButton from './WhatsAppButton';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    customerPhone: '',
    item: '',
    qty: 1,
    price: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      const [salesData, inventoryData] = await Promise.all([
        sheets.loadSales(),
        sheets.loadInventory()
      ]);
      setSales(salesData);
      setInventory(inventoryData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = formData.qty * formData.price;
    const sheets = GoogleSheetsService.getInstance();
    const newId = 'S' + Date.now().toString().slice(-6);
    
    const newSale = [
      newId,
      formData.date,
      formData.customer,
      formData.item,
      formData.qty.toString(),
      formData.price.toFixed(2),
      total.toFixed(2),
      'Pending'
    ];

    try {
      await sheets.appendRow('Sales!A:H', newSale);
      
      const saleObj: Sale = {
        id: newId,
        date: formData.date,
        customer: formData.customer,
        customerPhone: formData.customerPhone,
        item: formData.item,
        qty: formData.qty,
        salePerUnit: formData.price,
        total: total,
        status: 'Pending'
      };
      
      setSales([...sales, saleObj]);
      
      // Ask to send WhatsApp
      if (formData.customerPhone && confirm('✅ Sale recorded! Send confirmation via WhatsApp?')) {
        const businessName = localStorage.getItem('businessName') || 'Medha ERP';
        const message = `Hi ${formData.customer},\n\nThank you for your order! ✅\n\n*Order #${newId}*\n*${businessName}*\n\n• ${formData.item} - Qty: ${formData.qty}\n\nTotal Amount: *${formatCurrency(total)}*\n\nWe'll process your order shortly.\n\nThank you! 🙏`;
        
        const cleanPhone = formData.customerPhone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customer: '',
        customerPhone: '',
        item: '',
        qty: 1,
        price: 0
      });
      
      alert('✅ Sale recorded successfully!');
    } catch (error) {
      console.error('Error adding sale:', error);
      alert('❌ Failed to record sale');
    }
  };

  const handleItemSelect = (itemName: string) => {
    const item = inventory.find(i => i.name === itemName);
    if (item) {
      setFormData({ ...formData, item: itemName, price: item.sale });
    }
  };

  const sendReminder = (sale: Sale) => {
    if (!sale.customerPhone) {
      const phone = prompt('Enter customer phone number:');
      if (!phone) return;
      sale.customerPhone = phone;
    }
    
    const businessName = localStorage.getItem('businessName') || 'Medha ERP';
    const message = `Hi ${sale.customer},\n\nThis is a friendly reminder from *${businessName}* 📌\n\nYour invoice *#${sale.id}* for ${formatCurrency(sale.total)} is pending.\n\nPlease clear the payment at your earliest convenience.\n\nThank you! 🙏`;
    
    const cleanPhone = sale.customerPhone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading sales...</div>;
  }

  return (
    <div>
      <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>💵 Sales Management</h2>
      
      {/* Sales Table */}
      <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1e293b' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Item</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Qty</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Price/Unit</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Status</th>
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
                <td style={{ padding: '12px', color: '#1e293b' }}>{sale.qty}</td>
                <td style={{ padding: '12px', color: '#1e293b' }}>{formatCurrency(sale.salePerUnit)}</td>
                <td style={{ padding: '12px', color: '#1e293b',fontWeight: 'bold' }}>{formatCurrency(sale.total)}</td>
                <td style={{ padding: '12px', color: '#1e293b' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: sale.status === 'Paid' ? '#d1fae5' : '#fee2e2',
                    color: sale.status === 'Paid' ? '#065f46' : '#991b1b'
                  }}>
                    {sale.status}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#1e293b' }}>
                  <button
                    onClick={() => sendReminder(sale)}
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
                    📱 Remind
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Sale Form */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '16px' }}>➕ Record New Sale</h3>
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
              placeholder="Customer Name *"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
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
              type="tel"
              placeholder="Customer Phone (optional)"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              style={{
                padding: '14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
              color: '#1e293b'
              }}
            />
            <select
              value={formData.item}
              onChange={(e) => handleItemSelect(e.target.value)}
              required
              style={{
                padding: '14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
              color: '#1e293b'
              }}
            >
              <option value="">Select Item *</option>
              {inventory.map(item => (
                <option key={item.id} value={item.name}>
                  {item.name} ({item.sku}) - Stock: {item.stock}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity *"
              value={formData.qty || ''}
              onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 1 })}
              required
              min="1"
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
              placeholder="Price per Unit ₹ *"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
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
          </div>
          <div style={{ marginBottom: '16px', padding: '12px', background: '#e0f2fe', borderRadius: '8px' }}>
            <strong>Total Amount: {formatCurrency(formData.qty * formData.price)}</strong>
          </div>
          <button
            type="submit"
            style={{
              background: '#10b981',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            ✅ Record Sale
          </button>
        </form>
      </div>
    </div>
  );
}
