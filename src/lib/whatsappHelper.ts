// src/lib/whatsappHelper.ts - Enhanced with Reminders
import { Invoice, Bill, Sale } from '@/types/erp';

export interface WhatsAppMessage {
  to: string;
  type: 'template' | 'text';
  template?: {
    name: string;
    language: string;
    components: any[];
  };
  text?: {
    body: string;
  };
}

export class WhatsAppHelper {
  private static instance: WhatsAppHelper;
  private accessToken: string = '';
  private phoneNumberId: string = '';
  private businessPhoneNumber: string = '';

  private constructor() {}

  static getInstance(): WhatsAppHelper {
    if (!WhatsAppHelper.instance) {
      WhatsAppHelper.instance = new WhatsAppHelper();
    }
    return WhatsAppHelper.instance;
  }

  initialize(accessToken: string, phoneNumberId: string, businessPhoneNumber: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.businessPhoneNumber = businessPhoneNumber;
  }

  isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId);
  }

  // Send generic text message
  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('WhatsApp not configured');
      return false;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to.replace(/\D/g, ''), // Remove non-digits
            type: 'text',
            text: {
              preview_url: false,
              body: message
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('WhatsApp API Error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  // Payment Reminder for Invoice
  async sendInvoiceReminder(invoice: Invoice, businessName: string): Promise<boolean> {
    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let message = '';
    
    if (daysOverdue > 0) {
      // Overdue reminder
      message = `🔴 *Payment Reminder - OVERDUE*\n\n` +
        `Dear ${invoice.customer},\n\n` +
        `This is a gentle reminder that your payment is overdue by *${daysOverdue} days*.\n\n` +
        `📄 Invoice: ${invoice.id}\n` +
        `💰 Amount Due: ₹${invoice.total.toFixed(2)}\n` +
        `📅 Due Date: ${invoice.dueDate}\n\n` +
        `Please arrange payment at your earliest convenience.\n\n` +
        `For queries, contact: ${this.businessPhoneNumber}\n\n` +
        `Thank you,\n${businessName}`;
    } else if (daysOverdue === 0) {
      // Due today
      message = `⚠️ *Payment Due Today*\n\n` +
        `Dear ${invoice.customer},\n\n` +
        `This is a reminder that your payment is due today.\n\n` +
        `📄 Invoice: ${invoice.id}\n` +
        `💰 Amount: ₹${invoice.total.toFixed(2)}\n` +
        `📅 Due Date: ${invoice.dueDate}\n\n` +
        `Please make the payment to avoid any late fees.\n\n` +
        `Thank you,\n${businessName}`;
    } else {
      // Upcoming reminder (3 days before)
      message = `📢 *Payment Reminder*\n\n` +
        `Dear ${invoice.customer},\n\n` +
        `This is a friendly reminder about your upcoming payment.\n\n` +
        `📄 Invoice: ${invoice.id}\n` +
        `💰 Amount: ₹${invoice.total.toFixed(2)}\n` +
        `📅 Due Date: ${invoice.dueDate}\n\n` +
        `Thank you for your business!\n\n` +
        `${businessName}`;
    }

    return await this.sendMessage(invoice.customerPhone, message);
  }

  // Payment Reminder for Bill
  async sendBillReminder(bill: Bill, supplierPhone: string, businessName: string): Promise<boolean> {
    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let message = '';
    
    if (daysOverdue > 0) {
      message = `🔴 *Bill Payment Reminder*\n\n` +
        `Dear ${bill.supplier},\n\n` +
        `Our payment for your bill is overdue by ${daysOverdue} days.\n\n` +
        `📄 Bill: ${bill.id}\n` +
        `💰 Amount: ₹${bill.total.toFixed(2)}\n` +
        `📅 Due Date: ${bill.dueDate}\n\n` +
        `We are processing the payment. Thank you for your patience.\n\n` +
        `${businessName}`;
    } else {
      message = `📢 *Bill Payment Notification*\n\n` +
        `Dear ${bill.supplier},\n\n` +
        `Payment for your bill will be processed soon.\n\n` +
        `📄 Bill: ${bill.id}\n` +
        `💰 Amount: ₹${bill.total.toFixed(2)}\n` +
        `📅 Due Date: ${bill.dueDate}\n\n` +
        `${businessName}`;
    }

    return await this.sendMessage(supplierPhone, message);
  }

  // Order Confirmation
  async sendOrderConfirmation(sale: Sale, businessName: string): Promise<boolean> {
    if (!sale.customerPhone) return false;

    const message = `✅ *Order Confirmed*\n\n` +
      `Dear ${sale.customer},\n\n` +
      `Your order has been confirmed!\n\n` +
      `🛒 Order ID: ${sale.id}\n` +
      `📦 Item: ${sale.item}\n` +
      `🔢 Quantity: ${sale.qty}\n` +
      `💰 Total: ₹${sale.total.toFixed(2)}\n` +
      `📅 Date: ${sale.date}\n\n` +
      `Thank you for your order!\n\n` +
      `${businessName}`;

    return await this.sendMessage(sale.customerPhone, message);
  }

  // Dispatch Notification
  async sendDispatchNotification(sale: Sale, businessName: string): Promise<boolean> {
    if (!sale.customerPhone) return false;

    const message = `🚚 *Order Dispatched*\n\n` +
      `Dear ${sale.customer},\n\n` +
      `Good news! Your order has been dispatched.\n\n` +
      `🛒 Order ID: ${sale.id}\n` +
      `📦 Item: ${sale.item}\n` +
      `🔢 Quantity: ${sale.qty}\n\n` +
      `Your order will be delivered soon.\n\n` +
      `Thank you for choosing ${businessName}!`;

    return await this.sendMessage(sale.customerPhone, message);
  }

  // Bulk reminders for overdue invoices
  async sendBulkInvoiceReminders(invoices: Invoice[], businessName: string): Promise<{
    sent: number;
    failed: number;
  }> {
    let sent = 0;
    let failed = 0;

    for (const invoice of invoices) {
      // Check if pending and overdue by date
      const isOverdue = invoice.status === 'Pending' && new Date(invoice.dueDate) < new Date();
      
      if (isOverdue) {
        const success = await this.sendInvoiceReminder(invoice, businessName);
        if (success) {
          sent++;
          // Wait 2 seconds between messages to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          failed++;
        }
      }
    }

    return { sent, failed };
  }

  // Generate WhatsApp link for invoice
  generateInvoiceWhatsAppLink(invoice: Invoice, businessName: string): string {
    const message = `📄 *Invoice Details*\n\n` +
      `Invoice No: ${invoice.id}\n` +
      `Customer: ${invoice.customer}\n` +
      `Amount: ₹${invoice.total.toFixed(2)}\n` +
      `Due Date: ${invoice.dueDate}\n` +
      `Status: ${invoice.status}\n\n` +
      `Thank you for your business!\n${businessName}`;

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = this.formatPhoneNumber(invoice.customerPhone);
    
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  // Format phone number (ensure it has country code)
  formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If doesn't start with country code, add India's +91
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    return cleaned;
  }
}
