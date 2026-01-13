// src/app/components/erp/Purchases.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Purchase, InventoryItem } from '@/types/erp';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { formatCurrency } from '@/lib/calculations';

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    item: '',
    qty: 1,
    cost: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      const [purchasesData, inventoryData] = await Promise.all([
        sheets.loadPurchases(),
        sheets.loadInventory()
      ]);
      setPurchases(purchasesData);
      setInventory(inventoryData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = formData.qty * formData.cost;
    const sheets = GoogleSheetsService.getInstance();
    const newId = 'P' + Date.now().toString().slice(-6);
    
    const newPurchase = [
      newId,
      formData.date,
      formData.supplier,
      formData.item,
      formData.qty.toString(),
      formData.cost.toFixed(2),
      total.toFixed(2),
      'Pending'
    ];

    try {
      await sheets.appendRow('Purchases!A:H', newPurchase);
      
      const purchaseObj: Purchase = {
        id: newId,
        date: formData.date,
        supplier: formData.supplier,
        item: formData.item,
        qty: formData.qty,
        costPerUnit: formData.cost,
        total: total,
        status: 'Pending'
      };
      
      setPurchases([...purchases, purchaseObj]);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        item: '',
        qty: 1,
        cost: 0
      });
      
      alert('✅ Purchase recorded successfully!');
    } catch (error) {
      console.error('Error adding purchase:', error);
      alert('❌ Failed to record purchase');
    }
  };

  const handleItemSelect = (itemName: string) => {
    const item = inventory.find(i => i.name === itemName);
    if (item) {
      setFormData({ ...formData, item: itemName, cost: item.cost });
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading purchases...</div>;
  }

  return (
    <div>
      <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>💰 Purchase Management</h2>
      
      {/* Purchases Table */}
      <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1e293b' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Supplier</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Item</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Qty</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Cost/Unit</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{purchase.id}</td>
                <td style={{ padding: '12px' }}>{purchase.date}</td>
                <td style={{ padding: '12px', fontWeight: '600' }}>{purchase.supplier}</td>
                <td style={{ padding: '12px' }}>{purchase.item}</td>
                <td style={{ padding: '12px' }}>{purchase.qty}</td>
                <td style={{ padding: '12px' }}>{formatCurrency(purchase.costPerUnit)}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{formatCurrency(purchase.total)}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: purchase.status === 'Completed' ? '#d1fae5' : '#fef3c7',
                    color: purchase.status === 'Completed' ? '#065f46' : '#92400e'
                  }}>
                    {purchase.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Purchase Form */}
      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '16px' }}>➕ Record New Purchase</h3>
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
            <select
              value={formData.item}
              onChange={(e) => handleItemSelect(e.target.value)}
              required
              style={{
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Item *</option>
              {inventory.map(item => (
                <option key={item.id} value={item.name}>
                  {item.name} ({item.sku})
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
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="number"
              placeholder="Cost per Unit ₹ *"
              value={formData.cost || ''}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
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
          </div>
          <div style={{ marginBottom: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px' }}>
            <strong>Total Amount: {formatCurrency(formData.qty * formData.cost)}</strong>
          </div>
          <button
            type="submit"
            style={{
              background: '#f59e0b',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            ✅ Record Purchase
          </button>
        </form>
      </div>
    </div>
  );
}
