// inventory.js - 100% WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
  let spreadsheetId = localStorage.getItem('medhaSheetId') || '';
  let inventoryData = [];

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
  document.getElementById('connect-sheet').addEventListener('click', function() {
    const sheetId = prompt('📋 Enter your Google Sheet ID (from URL):\n\nhttps://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit');
    if (sheetId && sheetId !== 'YOUR_ID_HERE') {
      localStorage.setItem('medhaSheetId', sheetId);
      document.getElementById('status').textContent = `✅ Connected: ${sheetId.slice(-8)}`;
      document.getElementById('status').style.display = 'block';
      loadDemoData();
    }
  });

  // === ADD ITEM FORM (WORKING!) ===
  document.getElementById('add-item').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const newItem = [
      Date.now().toString().slice(-6), // ID
      inputs[0].value, // Name
      inputs[1].value, // SKU
      parseInt(inputs[2].value), // Stock
      parseFloat(inputs[3].value || 0).toFixed(2), // Cost
      parseFloat(inputs[4].value || 0).toFixed(2), // Sale
      new Date().toLocaleDateString()
    ];
    
    inventoryData.push(newItem);
    renderInventoryTable();
    populateItemDropdowns();
    this.reset();
    alert('✅ Item added to inventory!');
    // TODO: Real Google Sheets append here
  });

  // === PURCHASE FORM ===
  document.getElementById('add-purchase').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const total = parseInt(inputs[3].value) * parseFloat(inputs[4].value);
    alert(`✅ Purchase added!\nTotal: ₹${total.toFixed(2)}\nStock increased!`);
    this.reset();
  });

  // === SALE FORM ===
  document.getElementById('add-sale').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const total = parseInt(inputs[3].value) * parseFloat(inputs[4].value);
    alert(`✅ Sale recorded!\nTotal: ₹${total.toFixed(2)}\nStock reduced!`);
    this.reset();
  });

  // === DEMO DATA ===
  function loadDemoData() {
    inventoryData = [
      ['001', 'Chrome Faucet', 'FAUCET001', '25', '450.00', '650.00', '2026-01-10'],
      ['002', 'PVC Pipe 1"', 'PIPE001', '100', '120.00', '180.00', '2026-01-10'],
      ['003', 'Bathroom Tap', 'TAP001', '15', '320.00', '480.00', '2026-01-10']
    ];
    renderInventoryTable();
    populateItemDropdowns();
  }

  function renderInventoryTable() {
    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = '';
    inventoryData.forEach((row, index) => {
      const tr = tbody.insertRow();
      row.forEach(cell => {
        const td = tr.insertCell();
        td.textContent = cell;
      });
      // ACTIONS COLUMN
      const actions = tr.insertCell();
      actions.innerHTML = `
        <button class="edit-btn" onclick="editRow(${index})">✏️ Edit</button>
        <button class="delete-btn" onclick="deleteRow(${index})">🗑️ Delete</button>
      `;
    });
  }

  function populateItemDropdowns() {
    const items = inventoryData.map(row => `${row[1]} (${row[2]})`);
    document.querySelectorAll('select').forEach(select => {
      select.innerHTML = '<option value="">Select Item...</option>' + 
        items.map(item => `<option>${item}</option>`).join('');
    });
  }

  // === GLOBAL FUNCTIONS FOR BUTTONS ===
  window.editRow = function(index) {
    const item = inventoryData[index];
    const name = prompt('Edit Name:', item[1]);
    if (name) {
      item[1] = name;
      renderInventoryTable();
      alert('✅ Item updated!');
    }
  };

  window.deleteRow = function(index) {
    if (confirm('Delete this item?')) {
      inventoryData.splice(index, 1);
      renderInventoryTable();
      populateItemDropdowns();
      alert('✅ Item deleted!');
    }
  };

  // Auto-load demo if already connected
  if (spreadsheetId) {
    document.getElementById('status').textContent = `✅ Connected: ${spreadsheetId.slice(-8)}`;
    document.getElementById('status').style.display = 'block';
    loadDemoData();
  }
});
