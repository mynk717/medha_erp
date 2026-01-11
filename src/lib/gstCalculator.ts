// src/lib/gstCalculator.ts
import { TaxCalculation } from '@/types/erp';

export const calculateGST = (
  subtotal: number,
  gstRate: number,
  customerStateCode?: string,
  businessStateCode?: string
): TaxCalculation => {
  const isInterState = customerStateCode && businessStateCode && 
                       customerStateCode !== businessStateCode;
  
  const gstAmount = (subtotal * gstRate) / 100;
  
  if (isInterState) {
    // Inter-state: IGST only
    return {
      subtotal,
      gstRate,
      isInterState: true,
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      total: subtotal + gstAmount
    };
  } else {
    // Intra-state: CGST + SGST (split equally)
    const halfGst = gstAmount / 2;
    return {
      subtotal,
      gstRate,
      isInterState: false,
      cgst: halfGst,
      sgst: halfGst,
      igst: 0,
      total: subtotal + gstAmount
    };
  }
};

export const reverseCalculateGST = (
  totalWithGst: number,
  gstRate: number
): { subtotal: number; gstAmount: number } => {
  const subtotal = totalWithGst / (1 + gstRate / 100);
  const gstAmount = totalWithGst - subtotal;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2))
  };
};
