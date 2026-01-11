// inventory.js - ALL TABS WORKING VERSION
let spreadsheetId = localStorage.getItem('medhaSheetId') || '';
let inventoryData = [];
let purchasesData = [];
let salesData = [];
let gapiReady = false;
let accessToken = null;

// Initialize Google API Client
window.addEventListener('load', function() {
  console.log('Initializing Google APIs...');
  
  const waitForGapi = setInterval(() => {
    if (typeof gapi !== 'undefined') {
      clearInterval(waitForGapi);
      initGapi();
    }
  }, 100);
});

function initGapi() {
  gapi.load('client', async () => {
    await gapi.client.init({
      apiKey: 'AIzaSyDiiKczgqa9NBPVwKkkSaOsIKyCOvZsoCI',
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
    });
    gapiReady = true;
    console.log('✅ Google Sheets API ready!');
  });
}

// Setup UI
document.addEventListener('DOMContentLoaded', function() {
  
  // === TAB SWITCHING ===
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const tabId = this.dataset.tab + '-tab';
      document.getElementById(tabId).classList.add('active');
      
      // Load data when switching tabs
      if (this.dataset.tab === 'purchases' && purchasesData.length === 0) {
        loadPurchases();
      } else if (this.dataset.tab === 'sales' && salesData.length === 0) {
        loadSales();
      }
    });
  });

  // === CONNECT SHEET ===
  document.getElementById('connect-sheet').addEventListener('click', function() {
    if (!gapiReady) {
      alert('⏳ Google API still initializing... Wait 3 seconds and try again.');
      return;
    }

    // Use Google Identity Services
    const client = google.accounts.oauth2.initTokenClient({
      client_id: '273865945262-3a6i04so4dmaifi8ubku85op82ns65cf.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      callback: async (response) => {
        if (response.error) {
          console.error('Auth error:', response);
          alert('❌ Login failed: ' + response.error);
          return;
        }
        
        accessToken = response.access_token;
        gapi.client.setToken({access_token: accessToken});
        console.log('✅ Authenticated!');
        
        const sheetId = prompt('📋 Enter Google Sheet ID:\n\nhttps://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit\n\nPaste the ID part only:');
        
        if (sheetId && sheetId.length > 20) {
          localStorage.setItem('medhaSheetId', sheetId);
          spreadsheetId = sheetId;
          document.getElementById('status').textContent = `✅ Connected: ${sheetId.slice(-8)}`;
          document.getElementById('status').style.display = 'block';
          await loadRealInventory();
        }
      }
    });
    
    client.requestAccessToken();
  });

  // === LOAD INVENTORY ===
  async function loadRealInventory() {
    try {
      console.log('Loading inventory...');
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Inventory!A1:G'
      });
      inventoryData = response.result.values || [];
      renderInventoryTable();
      populateItemDropdowns();
      console.log(`✅ Loaded ${inventoryData.length - 1} items`);
    } catch(e) {
      console.error('Load error:', e);
      alert('❌ Error loading Inventory sheet. Make sure you have an "Inventory" tab with headers:\nID | Name | SKU | Stock | Cost | Sale | Date');
    }
  }

  // === LOAD PURCHASES ===
  async function loadPurchases() {
    if (!spreadsheetId) return;
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Purchases!A1:H'
      });
      purchasesData = response.result.values || [];
      renderPurchasesTable();
      console.log(`✅ Loaded ${purchasesData.length - 1} purchases`);
    } catch(e) {
      console.log('Purchases sheet not found or empty');
    }
  }

  // === LOAD SALES ===
  async function loadSales() {
    if (!spreadsheetId) return;
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Sales!A1:H'
      });
      salesData = response.result.values || [];
      renderSalesTable();
      console.log(`✅ Loaded ${salesData.length - 1} sales`);
    } catch(e) {
      console.log('Sales sheet not found or empty');
    }
  }

  // === ADD ITEM ===
  document.getElementById('add-item').addEventListener('submit', async function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const newItem = [
      Date.now().toString().slice(-6),
      inputs[0].value,
      inputs[1].value,
      parseInt(inputs[2].value),
      parseFloat(inputs[3].value || 0).toFixed(2),
      parseFloat(inputs[4].value || 0).toFixed(2),
      new Date().toLocaleDateString('en-IN')
    ];

    if (!spreadsheetId) {
      alert('⚠️ Connect Google Sheet first!');
      return;
    }

    try {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Inventory!A:G',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [newItem] }
      });

      inventoryData.push(newItem);
      renderInventoryTable();
      populateItemDropdowns();
      this.reset();
      alert('✅ Item saved to Inventory sheet!');
    } catch(e) {
      console.error('Save error:', e);
      alert('❌ Save failed. Check console.');
    }
  });

  // === ADD PURCHASE - NOW WORKING ===
  document.getElementById('add-purchase').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!spreadsheetId) {
      alert('⚠️ Connect Google Sheet first!');
      return;
    }

    const inputs = this.querySelectorAll('input, select');
    const dateValue = inputs[0].value;
    const supplier = inputs[1].value;
    const item = inputs[2].value;
    const qty = parseInt(inputs[3].value);
    const cost = parseFloat(inputs[4].value);
    const total = qty * cost;

    const purchase = [
      'P' + Date.now().toString().slice(-6),
      dateValue,
      supplier,
      item,
      qty,
      cost.toFixed(2),
      total.toFixed(2),
      'Pending'
    ];

    try {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Purchases!A:H',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [purchase] }
      });

      purchasesData.push(purchase);
      renderPurchasesTable();
      this.reset();
      alert(`✅ Purchase saved!\n₹${total.toFixed(2)} | Qty: ${qty}\n\nSaved to Purchases sheet.`);
    } catch(e) {
      console.error('Purchase save error:', e);
      alert('❌ Failed to save purchase. Make sure you have a "Purchases" tab with headers:\nID | Date | Supplier | Item | Qty | Cost/Unit | Total | Status');
    }
  });

  // === ADD SALE - NOW WORKING ===
  document.getElementById('add-sale').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!spreadsheetId) {
      alert('⚠️ Connect Google Sheet first!');
      return;
    }

    const inputs = this.querySelectorAll('input, select');
    const dateValue = inputs[0].value;
    const customer = inputs[1].value;
    const item = inputs[2].value;
    const qty = parseInt(inputs[3].value);
    const price = parseFloat(inputs[4].value);
    const total = qty * price;

    const sale = [
      'S' + Date.now().toString().slice(-6),
      dateValue,
      customer,
      item,
      qty,
      price.toFixed(2),
      total.toFixed(2),
      'Pending'
    ];

    try {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Sales!A:H',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [sale] }
      });

      salesData.push(sale);
      renderSalesTable();
      this.reset();
      alert(`✅ Sale saved!\n₹${total.toFixed(2)} | Qty: ${qty}\n\nSaved to Sales sheet.`);
    } catch(e) {
      console.error('Sale save error:', e);
      alert('❌ Failed to save sale. Make sure you have a "Sales" tab with headers:\nID | Date | Customer | Item | Qty | Sale/Unit | Total | Status');
    }
  });

  // === RENDER INVENTORY TABLE ===
  function renderInventoryTable() {
    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = '';
    if (inventoryData.length > 1) {
      inventoryData.slice(1).forEach((row, index) => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
          const td = tr.insertCell();
          td.textContent = cell;
        });
        const actions = tr.insertCell();
        actions.innerHTML = `
          <button class="edit-btn" onclick="editRow(${index + 1})">✏️</button>
          <button class="delete-btn" onclick="deleteRow(${index + 1})">🗑️</button>
        `;
      });
    }
  }

  // === RENDER PURCHASES TABLE ===
  function renderPurchasesTable() {
    const tbody = document.querySelector('#purchases-table tbody');
    tbody.innerHTML = '';
    if (purchasesData.length > 1) {
      purchasesData.slice(1).forEach((row) => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
          const td = tr.insertCell();
          td.textContent = cell;
        });
      });
    }
  }

  // === RENDER SALES TABLE ===
  function renderSalesTable() {
    const tbody = document.querySelector('#sales-table tbody');
    tbody.innerHTML = '';
    if (salesData.length > 1) {
      salesData.slice(1).forEach((row) => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
          const td = tr.insertCell();
          td.textContent = cell;
        });
      });
    }
  }

  // === DROPDOWNS ===
  function populateItemDropdowns() {
    if (inventoryData.length <= 1) return;
    
    const items = inventoryData.slice(1).map(row => `${row[1]} (${row[2]})`);
    document.querySelectorAll('select').forEach(select => {
      if (select.id.includes('items')) {
        select.innerHTML = '<option value="">Select Item...</option>' +
          items.map(item => `<option>${item}</option>`).join('');
      }
    });
  }

  // === GLOBAL FUNCTIONS ===
  window.editRow = function(rowIndex) {
    const row = inventoryData[rowIndex];
    const newName = prompt('Edit Name:', row[1]);
    if (newName) {
      row[1] = newName;
      renderInventoryTable();
      alert('✅ Updated locally! (Full sheet sync coming soon)');
    }
  };

  window.deleteRow = function(rowIndex) {
    if (confirm('Delete this item?')) {
      inventoryData.splice(rowIndex, 1);
      renderInventoryTable();
      populateItemDropdowns();
      alert('✅ Deleted locally!');
    }
  };

  // Auto-load if already connected
  if (spreadsheetId) {
    document.getElementById('status').textContent = `✅ Previously connected: ${spreadsheetId.slice(-8)}`;
    document.getElementById('status').style.display = 'block';
  }
});
