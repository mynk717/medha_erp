// src/lib/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Bill, BusinessSettings } from '@/types/erp';
import { formatCurrency } from './calculations';

export function generateInvoicePDF(invoice: Invoice, settings: BusinessSettings) {
  const doc = new jsPDF();
  
  // Header with company name
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175);
  doc.text(settings.name, 15, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(settings.address, 15, 28);
  doc.text(`GST: ${settings.gstNumber} | Phone: ${settings.phone}`, 15, 34);
  
  // Invoice title
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175);
  doc.text('TAX INVOICE', 150, 20);
  
  // Invoice details box
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.id}`, 150, 28);
  doc.text(`Date: ${invoice.date}`, 150, 34);
  doc.text(`Due Date: ${invoice.dueDate}`, 150, 40);
  
  // Bill to section
  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.text('Bill To:', 15, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(invoice.customer, 15, 56);
  doc.text(invoice.customerPhone || '', 15, 62);
  
  // Items table
  autoTable(doc, {
    startY: 70,
    head: [['Item', 'Qty', 'Rate', 'Amount']],
    body: invoice.items.map(item => [
      item.name,
      item.qty.toString(),
      formatCurrency(item.rate),
      formatCurrency(item.amount)
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
  });
  
  // Totals section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalsX = 130;
  
  doc.text(`Subtotal:`, totalsX, finalY);
  doc.text(formatCurrency(invoice.subtotal), 180, finalY, { align: 'right' });
  
  if (invoice.cgst > 0) {
    doc.text(`CGST (9%):`, totalsX, finalY + 6);
    doc.text(formatCurrency(invoice.cgst), 180, finalY + 6, { align: 'right' });
    
    doc.text(`SGST (9%):`, totalsX, finalY + 12);
    doc.text(formatCurrency(invoice.sgst), 180, finalY + 12, { align: 'right' });
  }
  
  if (invoice.igst > 0) {
    doc.text(`IGST (18%):`, totalsX, finalY + 6);
    doc.text(formatCurrency(invoice.igst), 180, finalY + 6, { align: 'right' });
  }
  
  doc.text(`Round Off:`, totalsX, finalY + 18);
  doc.text(formatCurrency(invoice.roundOff), 180, finalY + 18, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total:`, totalsX, finalY + 26);
  doc.text(formatCurrency(invoice.total), 180, finalY + 26, { align: 'right' });
  
  // Terms & conditions
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Terms & Conditions:', 15, finalY + 40);
  const terms = settings.invoiceTerms.split('\n');
  terms.forEach((term, i) => {
    doc.text(term, 15, finalY + 46 + (i * 5));
  });
  
  // Footer
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  
  return doc;
}

export function downloadInvoicePDF(invoice: Invoice, settings: BusinessSettings) {
  const doc = generateInvoicePDF(invoice, settings);
  doc.save(`Invoice-${invoice.id}.pdf`);
}

export function generateBillPDF(bill: Bill, settings: BusinessSettings) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175);
  doc.text('PURCHASE BILL', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Bill #: ${bill.id}`, 15, 35);
  doc.text(`Date: ${bill.date}`, 15, 41);
  doc.text(`Supplier: ${bill.supplier}`, 15, 47);
  doc.text(`Amount: ${formatCurrency(bill.total)}`, 15, 53);
  doc.text(`Due Date: ${bill.dueDate}`, 15, 59);
  doc.text(`Status: ${bill.status}`, 15, 65);
  
  if (bill.notes) {
    doc.text(`Notes: ${bill.notes}`, 15, 71);
  }
  
  return doc;
}

export function downloadBillPDF(bill: Bill, settings: BusinessSettings) {
  const doc = generateBillPDF(bill, settings);
  doc.save(`Bill-${bill.id}.pdf`);
}
