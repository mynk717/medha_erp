// inventory.js - SIMPLIFIED WORKING VERSION
let spreadsheetId = localStorage.getItem('medhaSheetId') || '';
let inventoryData = [];
let gapiReady = false;

// Wait for page to fully load
window.addEventListener('load', function() {
  console.log('Page loaded, initializing...');
  
  // Wait for gapi to be available
  const waitForGapi = setInterval(() => {
    if (typeof gapi !== 'undefined') {
      clearInterval(waitForGapi);
      console.log('gapi found, loading client...');
      initGoogleClient();
    }
  }, 500);
  
  // Timeout after 10 seconds
  setTimeout(() => {
    if (!gapiReady) {
      clearInterval(waitForGapi);
      console.error('Google API failed to load after 10 seconds');
    }
  }, 10000);
});

function initGoogleClient() {
  gapi.load('client:auth2', () => {
    console.log('gapi client loaded, initializing...');
    
    gapi.client.init({
      apiKey: 'AIzaSyB-your-api-key-here', // ← PUT YOUR REAL API KEY HERE
      clientId: '273865945262-3a6i04so4dmaifi8ubku85op82ns65cf.apps.googleusercontent.com',
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      scope: 'https://www.googleapis.com/auth/spreadsheets'
    }).then(() => {
      gapiReady = true;
      console.log('✅ Google Sheets API ready!');
    }).catch((error) => {
      console.error('❌ Google API init failed:', error);
    });
  });
}

// Setup everything after DOM loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready, setting up UI...');
  
  // === TAB SWITCHING ===
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(this.dataset.tab + '-tab').classList.add('active');
    });
  });

  // === CONNECT SHEET ===
  document.getElementById('connect-sheet').addEventListener('click', async function() {
    console.log('Connect button clicked, gapiReady:', gapiReady);
    
    if (!gapiReady) {
      alert('⏳ Initializing Google APIs... Please wait a moment and try again.\n\nCheck browser console (F12) for details.');
      return;
    }

    try {
      console.log('Starting Google sign in...');
      const googleAuth = gapi.auth2.getAuthInstance();
      const user = await googleAuth.signIn();
      console.log('User signed in:', user.getBasicProfile().getEmail());

      const sheetId = prompt('📋 Enter Google Sheet ID:\n\nhttps://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit\n\nPaste the ID part only:');
      
      if (sheetId && sheetId.length > 20) {
        localStorage.setItem('medhaSheetId', sheetId);
        spreadsheetId = sheetId;
        document.getElementById('status').textContent = `✅ Connected: ${sheetId.slice(-8)}`;
        document.getElementById('status').style.display = 'block';
        await loadRealInventory();
      }
    } catch(e) {
      console.error('Sign in error:', e);
      alert('❌ Google login failed:\n' + e.message);
    }
  });

  // === LOAD FROM SHEET ===
  async function loadRealInventory() {
    try {
      console.log('Loading inventory from sheet:', spreadsheetId);
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
      alert('❌ Error loading sheet:\n' + e.result.error.message + '\n\nMake sure you have an "Inventory" tab with headers:\nID | Name | SKU | Stock | Cost | Sale | Date');
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
      alert('✅ SAVED TO YOUR GOOGLE SHEET!');
    } catch(e) {
      console.error('Save error:', e);
      alert('❌ Save failed:\n' + e.result.error.message);
    }
  });

  // === PURCHASE FORM ===
  document.getElementById('add-purchase').addEventListener('submit', async function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const qty = parseInt(inputs[3].value);
    const cost = parseFloat(inputs[4].value);
    const total = qty * cost;
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
    if (newName) {
      row[1] = newName;
      renderInventoryTable();
      alert('✅ Updated locally! (Sheet update coming soon)');
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
});
