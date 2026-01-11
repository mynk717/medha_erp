// src/app/components/erp/Dashboard.tsx - COMPLETE FIXED VERSION
'use client';

import React, { useEffect, useState } from 'react';
import { DashboardStats, InventoryItem } from '@/types/erp';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { formatCurrency } from '@/lib/calculations';

interface DashboardProps {
  onTabSwitch?: (tab: string) => void;  // ← Changed to OPTIONAL with ?
}

export default function Dashboard({ onTabSwitch }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayCount: 0,
    monthSales: 0,
    monthCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    lowStockCount: 0,
    lowStockItems: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const sheets = GoogleSheetsService.getInstance();
      const sales = await sheets.loadSales();
      const inventory = await sheets.loadInventory();

      const today = new Date().toLocaleDateString('en-IN');
      const todaySales = sales.filter(s => s.date === today);
      const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthSales = sales.filter(s => {
        const saleDate = new Date(s.date.split('/').reverse().join('-'));
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      });
      const monthTotal = monthSales.reduce((sum, s) => sum + s.total, 0);

      const pending = sales.filter(s => s.status === 'Pending' || s.status === 'Partial');
      const pendingTotal = pending.reduce((sum, s) => sum + s.total, 0);

      const lowStock = inventory.filter(item => item.stock < 5);

      setStats({
        todaySales: todayTotal,
        todayCount: todaySales.length,
        monthSales: monthTotal,
        monthCount: monthSales.length,
        pendingAmount: pendingTotal,
        pendingCount: pending.length,
        lowStockCount: lowStock.length,
        lowStockItems: lowStock
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>📊 Business Dashboard</h2>
      
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {/* Today's Sales */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Today&apos;s Sales</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(stats.todaySales)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{stats.todayCount} orders</div>
        </div>

        {/* This Month */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>This Month</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(stats.monthSales)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{stats.monthCount} orders</div>
        </div>

        {/* Pending Payments */}
        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Payments</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(stats.pendingAmount)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{stats.pendingCount} invoices</div>
        </div>

        {/* Low Stock */}
        <div style={{
          background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Low Stock Alerts</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.lowStockCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Items below 5 units</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={{ color: '#1e40af', marginBottom: '16px' }}>⚡ Quick Actions</h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <button 
          onClick={() => onTabSwitch?.('sales')}
          style={{
            background: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + New Sale
        </button>
        <button 
          onClick={() => onTabSwitch?.('purchases')}
          style={{
            background: '#f59e0b',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + New Purchase
        </button>
        <button 
          onClick={() => onTabSwitch?.('inventory')}
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + Add Item
        </button>
        <button 
          onClick={() => onTabSwitch?.('invoices')}
          style={{
            background: '#ef4444',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          💰 View Pending
        </button>
      </div>

      {/* Low Stock Items */}
      {stats.lowStockCount > 0 && (
        <div>
          <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>⚠️ Low Stock Items</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>SKU</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Current Stock</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.lowStockItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{item.name}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{item.sku}</td>
                  <td style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #e5e7eb',
                    color: item.stock < 3 ? '#ef4444' : '#f59e0b',
                    fontWeight: 'bold'
                  }}>
                    {item.stock}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => onTabSwitch?.('purchases')}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Order Now
                    </button>
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
