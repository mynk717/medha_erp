// src/lib/calculations.ts
import { GSTType, InvoiceItem } from '@/types/erp';

export const GST_RATE = 0.18; // 18% (9% CGST + 9% SGST or 18% IGST)

export function calculateGST(
  subtotal: number,
  type: GSTType,
  stateCode?: string,
  customerStateCode?: string
): { cgst: number; sgst: number; igst: number; total: number } {
  const gstAmount = subtotal * GST_RATE;
  
  // Determine if intra-state or inter-state
  const isIntraState = stateCode === customerStateCode;
  
  if (isIntraState || type === 'intra') {
    return {
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      igst: 0,
      total: subtotal + gstAmount
    };
  } else {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      total: subtotal + gstAmount
    };
  }
}

export function calculateInvoiceTotal(items: InvoiceItem[], gstType: GSTType): {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gst = calculateGST(subtotal, gstType);
  
  const exactTotal = gst.total;
  const roundedTotal = Math.round(exactTotal);
  const roundOff = roundedTotal - exactTotal;
  
  return {
    subtotal,
    cgst: gst.cgst,
    sgst: gst.sgst,
    igst: gst.igst,
    roundOff,
    total: roundedTotal
  };
}

export function calculateProfit(cost: number, sale: number, qty: number): number {
  return (sale - cost) * qty;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}
