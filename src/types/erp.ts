// src/types/erp.ts - UNIFIED VERSION
export interface BusinessSettings {
  name: string;
  gstNumber: string;
  phone: string;
  address: string;
  stateCode: string;
  logo?: string;
  invoiceTerms: string;
  gstEnabled: boolean;
  defaultGstRate: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  cost: number;
  sale: number;
  date: string;
}

export interface Purchase {
  id: string;
  date: string;
  supplier: string;
  item: string;
  qty: number;
  costPerUnit: number;
  total: number;
  status: 'Pending' | 'Completed';
}

export interface Sale {
  id: string;
  date: string;
  customer: string;
  customerPhone?: string;
  item: string;
  qty: number;
  salePerUnit: number;
  total: number;
  status: 'Pending' | 'Paid' | 'Partial' | 'Overdue';
  dueDate?: string;
}

export interface InvoiceItem {
  name: string;
  sku: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Bill {
  id: string;
  date: string;
  supplier: string;
  total: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Partial' | 'Overdue';
  notes?: string;
  subtotal?: number;
  gstRate?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
}

export interface Invoice {
  id: string;
  date: string;
  customer: string;
  customerPhone: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
  status: 'Pending' | 'Paid';
  dueDate: string;
  gstRate?: number;
}

export interface DashboardStats {
  todaySales: number;
  todayCount: number;
  monthSales: number;
  monthCount: number;
  pendingAmount: number;
  pendingCount: number;
  lowStockCount: number;
  lowStockItems: InventoryItem[];
}

export interface TaxCalculation {
  subtotal: number;
  gstRate: number;
  isInterState: boolean;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export type GSTType = 'intra' | 'inter';
