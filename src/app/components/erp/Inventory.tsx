// src/app/components/erp/Inventory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/erp';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { formatCurrency } from '@/lib/calculations';

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: 0,
    cost: 0,
    sale: 0
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      const data = await sheets.loadInventory();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sheets = GoogleSheetsService.getInstance();
    const newId = Date.now().toString().slice(-6);
    const newDate = new Date().toLocaleDateString('en-IN');
    
    const newItem = [
      newId,
      formData.name,
      formData.sku,
      formData.stock.toString(),
      formData.cost.toFixed(2),
      formData.sale.toFixed(2),
      newDate
    ];

    try {
      await sheets.appendRow('Inventory!A:G', newItem);
      
      const newItemObj: InventoryItem = {
        id: newId,
        name: formData.name,
        sku: formData.sku,
        stock: formData.stock,
        cost: formData.cost,
        sale: formData.sale,
        date: newDate
      };
      
      setItems([...items, newItemObj]);
      setFormData({ name: '', sku: '', stock: 0, cost: 0, sale: 0 });
      alert('✅ Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('❌ Failed to add item');
    }
  };

  const handleDelete = async (id: string, index: number) => {
    if (!confirm('Delete this item?')) return;
    
    try {
      const sheets = GoogleSheetsService.getInstance();
      await sheets.updateRow(`Inventory!A${index + 2}:G${index + 2}`, ['', '', '', '', '', '', '']);
      setItems(items.filter(item => item.id !== id));
      alert('✅ Item deleted!');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('❌ Failed to delete');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading inventory...</div>;
  }

  return (
    <div>
      <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>📦 Inventory Management</h2>
      
      {/* Items Table */}
      <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1e293b' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>SKU</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Stock</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Cost</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Sale Price</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{item.id}</td>
                <td style={{ padding: '12px', fontWeight: '600' }}>{item.name}</td>
                <td style={{ padding: '12px' }}>{item.sku}</td>
                <td style={{ 
                  padding: '12px',
                  color: item.stock < 5 ? '#ef4444' : item.stock < 10 ? '#f59e0b' : '#10b981',
                  fontWeight: 'bold'
                }}>
                  {item.stock}
                </td>
                <td style={{ padding: '12px' }}>{formatCurrency(item.cost)}</td>
                <td style={{ padding: '12px' }}>{formatCurrency(item.sale)}</td>
                <td style={{ padding: '12px' }}>{item.date}</td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => handleDelete(item.id, index)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Form */}
      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '16px' }}>➕ Add New Item</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              placeholder="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              placeholder="SKU *"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
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
              placeholder="Stock Quantity *"
              value={formData.stock || ''}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              required
              min="0"
              style={{
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <input
              type="number"
              placeholder="Cost Price ₹"
              value={formData.cost || ''}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
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
              type="number"
              placeholder="Sale Price ₹"
              value={formData.sale || ''}
              onChange={(e) => setFormData({ ...formData, sale: parseFloat(e.target.value) || 0 })}
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
            ➕ Add Item
          </button>
        </form>
      </div>
    </div>
  );
}
