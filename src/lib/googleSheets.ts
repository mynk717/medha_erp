// src/lib/googleSheets.ts - FIXED with auto-retry on 403
import { InventoryItem, Purchase, Sale, Invoice, Bill } from '@/types/erp';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '273865945262-3a6i04so4dmaifi8ubku85op82ns65cf.apps.googleusercontent.com';

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private spreadsheetId: string = '';
  private accessToken: string = '';
  private gapiReady: boolean = false;

  static getInstance(): GoogleSheetsService {
    if (!this.instance) {
      this.instance = new GoogleSheetsService();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {  
    return new Promise((resolve) => {
      const checkGapi = setInterval(() => {
        if (typeof window !== 'undefined' && window.gapi) {
          clearInterval(checkGapi);
          window.gapi.load('client', async () => {
            await window.gapi.client.init({
              discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
            });
            this.gapiReady = true;
            console.log('✅ Google Sheets API ready');
            resolve();
          });
        }
      }, 100);
    });
  }

  async authenticate(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.google) {
        reject('Google Identity Services not loaded');
        return;
      }
  
      // ✅ Check if we have a valid cached token first
      const storedToken = localStorage.getItem('gapi_access_token');
      const tokenExpiry = localStorage.getItem('gapi_token_expiry');
      
      if (storedToken && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();
        
        // If token is still valid (with 5-minute buffer)
        if (now < expiryTime - (5 * 60 * 1000)) {
          console.log('✅ Using cached access token');
          this.accessToken = storedToken;
          window.gapi.client.setToken({ access_token: storedToken });
          resolve(storedToken);
          return;
        } else {
          console.log('⏰ Token expired, requesting new one...');
          // Clear expired token
          localStorage.removeItem('gapi_access_token');
          localStorage.removeItem('gapi_token_expiry');
        }
      }
  
      // Request new token
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: (response: any) => {
          if (response.error) {
            console.error('❌ Auth error:', response.error);
            reject(response.error);
            return;
          }
          
          // Store token with expiry time
          this.accessToken = response.access_token;
          
          // ✅ Calculate expiry (default is 3600 seconds = 1 hour)
          const expiresIn = response.expires_in || 3600;
          const expiryTime = Date.now() + (expiresIn * 1000);
          
          // ✅ Save to localStorage for reuse
          localStorage.setItem('gapi_access_token', this.accessToken);
          localStorage.setItem('gapi_token_expiry', expiryTime.toString());
          
          window.gapi.client.setToken({ access_token: this.accessToken });
          
          console.log('✅ New access token obtained, expires in', expiresIn, 'seconds');
          resolve(this.accessToken);
        }
      });
  
      client.requestAccessToken();
    });
  }

  // ✅ Helper method to auto-retry on 403 errors
  private async retryWithReauth<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      // If 403 error, try to re-authenticate once
      if (error?.status === 403 || error?.result?.error?.code === 403) {
        console.log('⚠️ 403 Forbidden - Re-authenticating...');
        
        // Clear old token
        localStorage.removeItem('gapi_access_token');
        localStorage.removeItem('gapi_token_expiry');
        
        // Get new token
        await this.authenticate();
        
        // Retry operation once
        console.log('🔄 Retrying operation with new token...');
        return await operation();
      }
      
      throw error;
    }
  }

  setSpreadsheetId(id: string): void {
    this.spreadsheetId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('medhaSheetId', id);
    }
  }

  getSpreadsheetId(): string {
    if (!this.spreadsheetId && typeof window !== 'undefined') {
      this.spreadsheetId = localStorage.getItem('medhaSheetId') || '';
    }
    return this.spreadsheetId;
  }

  isReady(): boolean {
    return this.gapiReady && !!this.spreadsheetId;
  }

  // ✅ UPDATED: Wrapped with retry logic
  async getRange(range: string): Promise<any[][]> {
    if (!this.gapiReady || !this.spreadsheetId) {
      throw new Error('API not ready or spreadsheet not set');
    }

    return this.retryWithReauth(async () => {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range
      });

      return response.result.values || [];
    });
  }

  // ✅ UPDATED: Wrapped with retry logic
  async appendRow(range: string, values: any[]): Promise<void> {
    if (!this.gapiReady || !this.spreadsheetId) {
      throw new Error('API not ready or spreadsheet not set');
    }

    return this.retryWithReauth(async () => {
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [values] }
      });
    });
  }

  // ✅ UPDATED: Wrapped with retry logic
  async updateRow(range: string, values: any[]): Promise<void> {
    if (!this.gapiReady || !this.spreadsheetId) {
      throw new Error('API not ready or spreadsheet not set');
    }

    return this.retryWithReauth(async () => {
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [values] }
      });
    });
  }

  async loadInventory(): Promise<InventoryItem[]> {
    const data = await this.getRange('Inventory!A2:G');
    return data.map(row => ({
      id: row[0] || '',
      name: row[1] || '',
      sku: row[2] || '',
      stock: parseInt(row[3]) || 0,
      cost: parseFloat(row[4]) || 0,
      sale: parseFloat(row[5]) || 0,
      date: row[6] || ''
    }));
  }

  async loadSales(): Promise<Sale[]> {
    const data = await this.getRange('Sales!A2:H');
    return data.map(row => ({
      id: row[0] || '',
      date: row[1] || '',
      customer: row[2] || '',
      item: row[3] || '',
      qty: parseInt(row[4]) || 0,
      salePerUnit: parseFloat(row[5]) || 0,
      total: parseFloat(row[6]) || 0,
      status: (row[7] || 'Pending') as any
    }));
  }

  async loadPurchases(): Promise<Purchase[]> {
    const data = await this.getRange('Purchases!A2:H');
    return data.map(row => ({
      id: row[0] || '',
      date: row[1] || '',
      supplier: row[2] || '',
      item: row[3] || '',
      qty: parseInt(row[4]) || 0,
      costPerUnit: parseFloat(row[5]) || 0,
      total: parseFloat(row[6]) || 0,
      status: (row[7] || 'Pending') as any
    }));
  }

  async loadInvoices(): Promise<Invoice[]> {
    try {
      const data = await this.getRange('Invoices!A2:M');
      
      return data.map((row): Invoice => ({
        id: row[0] || '',
        date: row[1] || '',
        customer: row[2] || '',
        customerPhone: row[3] || '',
        customerAddress: row[4] || '',
        items: JSON.parse(row[5] || '[]'),
        subtotal: parseFloat(row[6]) || 0,
        cgst: parseFloat(row[7]) || 0,
        sgst: parseFloat(row[8]) || 0,
        igst: parseFloat(row[9]) || 0,
        roundOff: parseFloat(row[10]) || 0,
        total: parseFloat(row[11]) || 0,
        status: (row[12] || 'Pending') as 'Pending' | 'Paid',
        dueDate: row[13] || '',
        gstRate: parseFloat(row[14]) || 0
      }));
    } catch (error) {
      console.error('Error loading invoices:', error);
      return [];
    }
  }

  async loadBills(): Promise<Bill[]> {
    try {
      const data = await this.getRange('Bills!A2:K');
      
      return data.map((row): Bill => ({
        id: row[0] || '',
        date: row[1] || '',
        supplier: row[2] || '',
        total: parseFloat(row[3]) || 0,
        dueDate: row[4] || '',
        status: (row[5] || 'Pending') as 'Pending' | 'Paid' | 'Partial' | 'Overdue',
        notes: row[6] || '',
        subtotal: parseFloat(row[7]) || undefined,
        gstRate: parseFloat(row[8]) || undefined,
        cgst: parseFloat(row[9]) || undefined,
        sgst: parseFloat(row[10]) || undefined,
        igst: parseFloat(row[11]) || undefined
      }));
    } catch (error) {
      console.error('Error loading bills:', error);
      return [];
    }
  }
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
