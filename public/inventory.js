// inventory.js - FIXED - No more infinite loop
document.addEventListener('DOMContentLoaded', function() {
  let spreadsheetId = localStorage.getItem('medhaSheetId') || '';
  let inventoryData = [];
  let gapiReady = false;
  let gsiReady = false;

  // Wait for BOTH Google APIs to load
  function checkGoogleAPIsReady() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  // Initialize Google APIs
  async function initGoogleAPIs() {
    await checkGoogleAPIsReady();
    
    await new Promise((resolve) => {
      gapi.load('client:auth2', resolve);
    });

    await gapi.client.init({
      apiKey: 'AIzaSyDiiKczgqa9NBPVwKkkSaOsIKyCOvZsoCI', // ← REPLACE WITH YOUR REAL KEY
      clientId: '273865945262-3a6i04so4dmaifi8ubku85op82ns65cf.apps.googleusercontent.com',
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      scope: 'https://www.googleapis.com/auth/spreadsheets'
    });

    gapiReady = true;
    console.log('✅ Google Sheets API ready!');
  }

  // Start initialization
  initGoogleAPIs();

  // === TAB SWITCHING ===
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(this.dataset.tab + '-tab').classList.add('active');
    });
  });

  // === CONNECT SHEET - FIXED ===
  document.getElementById('connect-sheet').addEventListener('click', async function() {
    if (!gapiReady) {
      alert('⏳ Initializing Google APIs... Please wait a moment and try again.');
      return;
    }

    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      await googleAuth.signIn();

      const sheetId = prompt('📋 Enter Google Sheet ID:\nhttps://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit\n\nPaste the ID part only:');
      if (sheetId && sheetId.length > 20) {
        localStorage.setItem('medhaSheetId', sheetId);
        spreadsheetId = sheetId;
        document.getElementById('status').textContent = `✅ Connected: ${sheetId.slice(-8)}`;
        document.getElementById('status').style.display = 'block';
        await loadRealInventory();
      }
    } catch(e) {
      console.error(e);
      alert('❌ Google login failed. Check console for details.');
    }
  });

  // === LOAD FROM SHEET ===
  async function loadRealInventory() {
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Inventory!A1:G'
      });
      inventoryData = response.result.values || [];
      renderInventoryTable();
      populateItemDropdowns();
      console.log(`✅ Loaded ${inventoryData.length - 1} items from sheet`);
    } catch(e) {
      console.error(e);
      alert('❌ Create "Inventory" tab with headers:\nID | Name | SKU | Stock | Cost | Sale | Date');
    }
  }

  // === ADD ITEM FORM ===
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
      alert('✅ SAVED TO YOUR GOOGLE SHEET!');
    } catch(e) {
      console.error(e);
      alert('❌ Save failed. Check sheet permissions.');
    }
  });

  // === PURCHASE FORM ===
  document.getElementById('add-purchase').addEventListener('submit', async function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const qty = parseInt(inputs[3].value);
    const cost = parseFloat(inputs[4].value);
    const total = qty * cost;

    const purchase = [
      Date.now().toString().slice(-6),
      inputs[0].value,
      inputs[1].value,
      inputs[2].value,
      qty,
      cost.toFixed(2),
      total.toFixed(2),
      'Pending'
    ];

    if (spreadsheetId && gapiReady) {
      try {
        await gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: spreadsheetId,
          range: 'Purchases!A:H',
          valueInputOption: 'USER_ENTERED',
          resource: { values: [purchase] }
        });
      } catch(e) {
        console.log('Purchase tab not found, add "Purchases" tab to sheet');
      }
    }

    alert(`✅ Purchase added!\n₹${total.toFixed(2)} | Stock +${qty}`);
    this.reset();
  });

  // === SALE FORM ===
  document.getElementById('add-sale').addEventListener('submit', async function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const qty = parseInt(inputs[3].value);
    const price = parseFloat(inputs[4].value);
    const total = qty * price;

    const sale = [
      Date.now().toString().slice(-6),
      inputs[0].value,
      inputs[1].value,
      inputs[2].value,
      qty,
      price.toFixed(2),
      total.toFixed(2),
      'Pending'
    ];

    if (spreadsheetId && gapiReady) {
      try {
        await gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: spreadsheetId,
          range: 'Sales!A:H',
          valueInputOption: 'USER_ENTERED',
          resource: { values: [sale] }
        });
      } catch(e) {
        console.log('Sales tab not found, add "Sales" tab to sheet');
      }
    }

    alert(`✅ Sale recorded!\n₹${total.toFixed(2)} | Stock -${qty}`);
    this.reset();
  });

  // === RENDER TABLE ===
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

  // === DROPDOWNS ===
  function populateItemDropdowns() {
    const items = inventoryData.slice(1).map(row => `${row[1]} (${row[2]})`);
    document.querySelectorAll('select').forEach(select => {
      if (select.id.includes('items')) {
        select.innerHTML = '<option value="">Select Item...</option>' +
          items.map(item => `<option>${item}</option>`).join('');
      }
    });
  }

  // === GLOBAL FUNCTIONS ===
  window.editRow = async function(rowIndex) {
    const row = inventoryData[rowIndex];
    const newName = prompt('Edit Name:', row[1]);
    if (newName && gapiReady && spreadsheetId) {
      row[1] = newName;
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `Inventory!B${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[newName]] }
      });
      renderInventoryTable();
    }
  };

  window.deleteRow = async function(rowIndex) {
    if (confirm('Delete this item?')) {
      inventoryData.splice(rowIndex, 1);
      if (gapiReady && spreadsheetId) {
        await gapi.client.sheets.spreadsheets.values.clear({
          spreadsheetId: spreadsheetId,
          range: `Inventory!A${rowIndex + 1}:G${rowIndex + 1}`
        });
      }
      renderInventoryTable();
      populateItemDropdowns();
    }
  };
});
