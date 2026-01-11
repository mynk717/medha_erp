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

  const [gstSummary, setGstSummary] = useState({
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalSales: 0,
    totalGST: 0
  });

  const [topCustomers, setTopCustomers] = useState<Array<{
    name: string;
    totalPurchases: number;
    orderCount: number;
  }>>([]);

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

            // Calculate GST Summary
            let totalCGST = 0;
            let totalSGST = 0;
            let totalIGST = 0;
            
            monthSales.forEach(sale => {
              const subtotal = sale.total / 1.18;
              const gst = sale.total - subtotal;
              totalCGST += gst / 2;
              totalSGST += gst / 2;
            });
            
            setGstSummary({
              totalCGST,
              totalSGST,
              totalIGST,
              totalSales: monthTotal,
              totalGST: totalCGST + totalSGST + totalIGST
            });
      
            // Calculate Top Customers
            const customerMap = new Map<string, { total: number; count: number }>();
            
            sales.forEach(sale => {
              const existing = customerMap.get(sale.customer) || { total: 0, count: 0 };
              customerMap.set(sale.customer, {
                total: existing.total + sale.total,
                count: existing.count + 1
              });
            });
            
            const sorted = Array.from(customerMap.entries())
              .map(([name, data]) => ({
                name,
                totalPurchases: data.total,
                orderCount: data.count
              }))
              .sort((a, b) => b.totalPurchases - a.totalPurchases)
              .slice(0, 5);
            
            setTopCustomers(sorted);
      
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

        {/* GST Summary Card - NOW INSIDE THE GRID */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>This Month GST</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(gstSummary.totalGST)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
            CGST: {formatCurrency(gstSummary.totalCGST)} | SGST: {formatCurrency(gstSummary.totalSGST)}
          </div>
        </div>
      </div>
      {/* ↑ GRID CLOSES HERE */}

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
      {/* ↑ LOW STOCK SECTION CLOSES HERE */}

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#1e40af', marginBottom: '16px' }}>👥 Top 5 Customers</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Total Purchases</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Orders</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map(customer => (
                <tr key={customer.name} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{customer.name}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981' }}>
                    {formatCurrency(customer.totalPurchases)}
                  </td>
                  <td style={{ padding: '12px' }}>{customer.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
