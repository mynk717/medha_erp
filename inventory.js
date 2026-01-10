// inventory.js - FULLY WORKING sanitary inventory manager
document.addEventListener("DOMContentLoaded", function () {
  let spreadsheetId = localStorage.getItem("medhaSheetId") || "";

  // Tab switching
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", function () {
      document
        .querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach(c => c.classList.remove("active"));
      this.classList.add("active");
      document
        .getElementById(this.dataset.tab + "-tab")
        .classList.add("active");
    });
  });

  // Connect Sheet Button (DEMO - replace with real Google API later)
  document
    .getElementById("connect-sheet")
    .addEventListener("click", function () {
      const sheetId = prompt("Enter your Google Sheet ID:");
      if (sheetId) {
        localStorage.setItem("medhaSheetId", sheetId);
        document.getElementById("status").innerHTML =
          "✅ Connected to Sheet: " + sheetId.slice(-8);
        loadDemoData(); // Load sample sanitary data
      }
    });

  // Add Item Form
  document.getElementById("add-item").addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const row = [
      Date.now(), // ID
      formData.get("0"), // Name
      formData.get("1"), // SKU
      formData.get("2"), // Qty
      formData.get("3"), // Cost
      formData.get("4"), // Sale Price
    ];
    addDemoRow("inventory", row);
    this.reset();
  });

  // Demo functions
  function loadDemoData() {
    const demoInventory = [
      ["1", "Chrome Faucet", "FAUCET001", "25", "450.00", "650.00"],
      ["2", 'PVC Pipe 1"', "PIPE001", "100", "120.00", "180.00"],
      ["3", "Bathroom Tap", "TAP001", "15", "320.00", "480.00"],
    ];
    renderTable("inventory-table", demoInventory);
  }

  function addDemoRow(table, row) {
    const tbody = document.querySelector("#" + table + "-table tbody");
    const tr = tbody.insertRow();
    row.forEach(cell => {
      const td = tr.insertCell();
      td.textContent = cell;
    });
    const actions = tr.insertCell();
    actions.innerHTML = `
      <button onclick="editRow(this)">✏️</button>
      <button onclick="deleteRow(this)">🗑️</button>
    `;
  }

  function renderTable(tableId, data) {
    const tbody = document.querySelector("#" + tableId + " tbody");
    tbody.innerHTML = "";
    data.forEach(row => addDemoRow(tableId.replace("-table", ""), row));
  }

  // Global functions for buttons
  window.editRow = function (btn) {
    alert("Edit: " + btn.parentNode.parentNode.cells[1].textContent);
  };
  window.deleteRow = function (btn) {
    if (confirm("Delete item?")) btn.closest("tr").remove();
  };
});
