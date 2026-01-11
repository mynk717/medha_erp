// src/app/components/erp/Bills.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Bill } from '@/types/erp';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { formatCurrency } from '@/lib/calculations';

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    total: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      const data = await sheets.getRange('Bills!A2:G');
      const billsData: Bill[] = data.map(row => ({
        id: row[0] || '',
        date: row[1] || '',
        supplier: row[2] || '',
        total: parseFloat(row[3]) || 0,
        dueDate: row[4] || '',
        status: (row[5] || 'Pending') as any,
        notes: row[6] || ''
      }));
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

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading bills...</div>;
  }

  return (
    <div>
      <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>📋 Bills & Payables</h2>
      
      {/* Bills Table */}
      <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Supplier</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Due Date</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Notes</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, index) => {
              const isOverdue = bill.status === 'Pending' && new Date(bill.dueDate) < new Date();
              return (
                <tr key={bill.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{bill.id}</td>
                  <td style={{ padding: '12px' }}>{bill.date}</td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{bill.supplier}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{formatCurrency(bill.total)}</td>
                  <td style={{ 
                    padding: '12px',
                    color: isOverdue ? '#ef4444' : '#64748b'
                  }}>
                    {bill.dueDate}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: bill.status === 'Paid' ? '#d1fae5' : isOverdue ? '#fee2e2' : '#fef3c7',
                      color: bill.status === 'Paid' ? '#065f46' : isOverdue ? '#991b1b' : '#92400e'
                    }}>
                      {isOverdue && bill.status === 'Pending' ? 'Overdue' : bill.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>{bill.notes}</td>
                  <td style={{ padding: '12px' }}>
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
                          fontSize: '12px'
                        }}
                      >
                        ✅ Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Bill Form */}
      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ color: '#1e40af', marginBottom: '16px' }}>➕ Record New Bill</h3>
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
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
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
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
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
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              style={{
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                padding: '14px',
                border: '2px solid #e2e8f0',
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
    </div>
  );
}
