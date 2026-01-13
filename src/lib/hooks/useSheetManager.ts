'use client';

import { useState } from 'react';
import { GoogleSheetsService } from '@/lib/googleSheets';

interface Sheet {
  id: string;
  tag: string;
  addedAt: number;
  lastUsed: number;
}

export function useSheetManager(session: any) {
  const [userSheets, setUserSheets] = useState<Sheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [sheetId, setSheetId] = useState('');

  // Load user's sheets from Redis
  const loadUserSheets = async () => {
    if (!session?.user) {
      console.log('⏭️ No session, skipping sheet load');
      return;
    }
    
    console.log('👤 Loading user sheets for:', session.user.email);
    
    try {
      const response = await fetch('/api/sheets');
      
      if (!response.ok) {
        console.error('❌ Failed to fetch sheets:', response.status);
        throw new Error(`Failed to fetch sheets: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Sheets loaded:', data);
      
      setUserSheets(data.sheets || []);
      setActiveSheetId(data.activeSheetId);
      
      // If user has an active sheet, set it up
      if (data.activeSheetId) {
        console.log('📊 Setting active sheet:', data.activeSheetId);
        setSheetId(data.activeSheetId);
        const gsService = GoogleSheetsService.getInstance();
        gsService.setSpreadsheetId(data.activeSheetId);
        setConnected(true);
        
        // Also save to localStorage as backup
        localStorage.setItem('medhaSheetId', data.activeSheetId);
      } else {
        // No active sheet - clear connection
        setConnected(false);
        setSheetId('');
        localStorage.removeItem('medhaSheetId');
      }
      
    } catch (error) {
      console.error('❌ Error loading user sheets:', error);
      setUserSheets([]);
      setActiveSheetId(null);
      setConnected(false);
    }
  };

  // Switch to different sheet
  const handleSwitchSheet = async (spreadsheetId: string) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/sheets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          spreadsheetId, 
          setActive: true 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to switch sheet');
      }
      
      setActiveSheetId(spreadsheetId);
      setSheetId(spreadsheetId);
      
      const sheets = GoogleSheetsService.getInstance();
      sheets.setSpreadsheetId(spreadsheetId);
      setConnected(true);
      
      // Update localStorage
      localStorage.setItem('medhaSheetId', spreadsheetId);
      
      await loadUserSheets();
      
      alert(`✅ Switched to sheet!`);
    } catch (error) {
      console.error('Error switching sheet:', error);
      alert('❌ Failed to switch sheet');
    }
  };

  // Add new sheet (UNIFIED with handleConnect)
  const handleAddSheet = async (spreadsheetId: string, tag: string, authenticate: boolean = false) => {
    if (!session?.user) return;
    
    try {
      // Authenticate if needed (when called from Connect button)
      if (authenticate) {
        console.log('🔐 Starting authentication...');
        const sheets = GoogleSheetsService.getInstance();
        await sheets.authenticate();
        console.log('✅ Authentication successful');
      }
      
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId, tag })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add sheet');
      }
      
      setSheetId(spreadsheetId);
      setActiveSheetId(spreadsheetId);
      
      const sheets = GoogleSheetsService.getInstance();
      sheets.setSpreadsheetId(spreadsheetId);
      setConnected(true);
      
      // Save to localStorage
      localStorage.setItem('medhaSheetId', spreadsheetId);
      
      await loadUserSheets();
      
      alert(`✅ Sheet "${tag}" connected successfully!`);
    } catch (error) {
      console.error('Error adding sheet:', error);
      alert('❌ Failed to add sheet. Please ensure you granted Google Sheets permissions.');
    }
  };

  // Remove sheet
  const handleRemoveSheet = async (spreadsheetId: string) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch(`/api/sheets?id=${spreadsheetId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove sheet');
      }
      
      await loadUserSheets();
      
      // If removed sheet was active, clear everything
      if (spreadsheetId === activeSheetId) {
        setConnected(false);
        setSheetId('');
        setActiveSheetId(null);
        
        // Clear localStorage
        localStorage.removeItem('medhaSheetId');
        
        // Clear Google Sheets service
        const sheets = GoogleSheetsService.getInstance();
        sheets.setSpreadsheetId('');
      }
      
      alert('✅ Sheet removed');
    } catch (error) {
      console.error('Error removing sheet:', error);
      alert('❌ Failed to remove sheet');
    }
  };

  // Update sheet tag
  const handleUpdateSheetTag = async (spreadsheetId: string, newTag: string) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/sheets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          spreadsheetId, 
          tag: newTag 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update tag');
      }
      
      await loadUserSheets();
      
      alert(`✅ Tag updated to "${newTag}"`);
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('❌ Failed to update tag');
    }
  };

  // Unified connect function (replaces old handleConnect)
  const handleConnect = async () => {
    try {
      console.log('🔐 Starting connection process...');
      
      // Get Sheet ID
      const id = prompt(
        '📋 Enter your Google Sheet ID:\n\n' +
        'Find it in the URL:\n' +
        'https://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit\n\n' +
        'Paste the ID part only:'
      );
      
      if (!id || id.length < 20) {
        return;
      }

      // Get sheet tag/name
      const tag = prompt('Give this sheet a name (e.g., Jan2026, Q1-2026, Main):') || 'My Sheet';
      
      // Call unified handleAddSheet with authenticate=true
      await handleAddSheet(id, tag, true);
      
    } catch (error) {
      console.error('Connection error:', error);
      alert('❌ Connection failed. Please try again and make sure you grant permissions.');
    }
  };

  return {
    userSheets,
    activeSheetId,
    connected,
    sheetId,
    loadUserSheets,
    handleConnect,
    handleSwitchSheet,
    handleAddSheet,
    handleRemoveSheet,
    handleUpdateSheetTag,
  };
}
