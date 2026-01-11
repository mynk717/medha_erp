// src/lib/whatsappHelper.ts - FIXED
import { Invoice, Sale } from '@/types/erp';
import { formatCurrency } from './calculations';

export function generateInvoiceWhatsAppLink(
  phone: string,
  invoice: Invoice,
  businessName: string
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  
  const message = `Hi ${invoice.customer},

Your invoice from *${businessName}* is ready! 📄

*Invoice #${invoice.id}*
Date: ${invoice.date}
Amount: *${formatCurrency(invoice.total)}*

Items:
${invoice.items.map(item => `• ${item.name} (${item.qty} × ₹${item.rate}) = ₹${item.amount}`).join('\n')}

Subtotal: ₹${invoice.subtotal.toFixed(2)}
${invoice.cgst > 0 ? `CGST (9%): ₹${invoice.cgst.toFixed(2)}\nSGST (9%): ₹${invoice.sgst.toFixed(2)}` : ''}
${invoice.igst > 0 ? `IGST (18%): ₹${invoice.igst.toFixed(2)}` : ''}
Round Off: ₹${invoice.roundOff.toFixed(2)}

*Total: ${formatCurrency(invoice.total)}*

Due Date: ${invoice.dueDate}

Thank you for your business! 🙏`;

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

export function generatePaymentReminderLink(
  phone: string,
  customerName: string,
  invoiceId: string,
  amount: number,
  dueDate: string,
  businessName: string
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  
  const message = `Hi ${customerName},

This is a friendly reminder from *${businessName}* 📌

Your invoice *#${invoiceId}* for ${formatCurrency(amount)} is pending.

Due Date: ${dueDate}

Please clear the payment at your earliest convenience.

Thank you! 🙏`;

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

// FIXED - Updated to work with Sale interface (single item)
export function generateSaleConfirmationLink(
  phone: string,
  customerName: string,
  saleId: string,
  total: number,
  businessName: string,
  itemName?: string,
  qty?: number
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  
  const itemText = itemName && qty ? `\n• ${itemName} - Qty: ${qty}\n` : '\n';
  
  const message = `Hi ${customerName},

Thank you for your order! ✅

*Order #${saleId}*
*${businessName}*
${itemText}
Total Amount: *${formatCurrency(total)}*

We'll process your order shortly.

Thank you! 🙏`;

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}
