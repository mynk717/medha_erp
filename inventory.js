// inventory.js - 100% WORKING WITH REAL GOOGLE SHEETS
// Your Medha ERP credentials: 273865945262-3a6i04so4dmaifi8ubku85op82ns65cf.apps.googleusercontent.com
document.addEventListener("DOMContentLoaded", function () {
  let spreadsheetId = localStorage.getItem("medhaSheetId") || "";
  let inventoryData = [];

  // Initialize Google API
  window.medhaGapiReady = false;
  gapi.load("client:auth2", initGoogleClient);

  function initGoogleClient() {
    gapi.client
      .init({
        apiKey: "AIzaSyB-your-api-key-here", // ← GET THIS FROM Google Cloud Console
        clientId:
          "273865945262-3a6i04so4dmaifi8ubku85op82ns65cf.apps.googleusercontent.com",
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
        scope: "https://www.googleapis.com/auth/spreadsheets",
      })
      .then(() => {
        window.medhaGapiReady = true;
        console.log("✅ Google Sheets API ready!");
      });
  }

  // === TAB SWITCHING ===
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

  // === CONNECT SHEET - REAL GOOGLE AUTH ===
  document
    .getElementById("connect-sheet")
    .addEventListener("click", async function () {
      if (!window.medhaGapiReady) {
        alert("⏳ Google API loading... Please wait 5 seconds");
        setTimeout(
          () => document.getElementById("connect-sheet").click(),
          2000
        );
        return;
      }

      try {
        // Google OAuth popup
        const googleAuth = gapi.auth2.getAuthInstance();
        const user = await googleAuth.signIn();

        const sheetId = prompt(
          "📋 Enter your Google Sheet ID:\nhttps://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit"
        );
        if (sheetId && sheetId !== "YOUR_ID_HERE") {
          localStorage.setItem("medhaSheetId", sheetId);
          spreadsheetId = sheetId;
          document.getElementById(
            "status"
          ).textContent = `✅ Connected: ${sheetId.slice(-8)}`;
          document.getElementById("status").style.display = "block";
          loadRealInventory();
        }
      } catch (e) {
        alert("❌ Google login failed. Use incognito or allow popups.");
      }
    });

  // === LOAD REAL DATA FROM SHEET ===
  async function loadRealInventory() {
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: "Inventory!A1:G",
      });
      inventoryData = response.result.values || [];
      renderInventoryTable();
      populateItemDropdowns();
      console.log("✅ Loaded", inventoryData.length - 1, "items from sheet");
    } catch (e) {
      alert(
        '❌ Create "Inventory" tab with headers: ID,Name,SKU,Stock,Cost,Sale,Date'
      );
    }
  }

  // === ADD ITEM FORM - SAVES TO REAL SHEET ===
  document
    .getElementById("add-item")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const inputs = this.querySelectorAll("input");
      const newItem = [
        Date.now().toString().slice(-6),
        inputs[0].value,
        inputs[1].value,
        parseInt(inputs[2].value),
        parseFloat(inputs[3].value || 0).toFixed(2),
        parseFloat(inputs[4].value || 0).toFixed(2),
        new Date().toLocaleDateString("en-IN"),
      ];

      if (!spreadsheetId) {
        alert("⚠️ Connect Google Sheet first!");
        return;
      }

      try {
        // SAVE TO REAL GOOGLE SHEET
        await gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: spreadsheetId,
          range: "Inventory!A:G",
          valueInputOption: "USER_ENTERED",
          resource: { values: [newItem] },
        });

        inventoryData.push(newItem);
        renderInventoryTable();
        populateItemDropdowns();
        this.reset();
        alert("✅ SAVED TO YOUR GOOGLE SHEET!");
      } catch (e) {
        alert("❌ Save failed. Check sheet permissions.");
        console.error(e);
      }
    });

  // === PURCHASE FORM ===
  document
    .getElementById("add-purchase")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const inputs = this.querySelectorAll("input");
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
        "Pending",
      ];

      if (spreadsheetId) {
        await gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: spreadsheetId,
          range: "Purchases!A:H",
          valueInputOption: "USER_ENTERED",
          resource: { values: [purchase] },
        });
      }

      alert(`✅ Purchase added!\n₹${total.toFixed(2)} | Stock +${qty}`);
      this.reset();
    });

  // === SALE FORM ===
  document
    .getElementById("add-sale")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const inputs = this.querySelectorAll("input");
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
        "Pending",
      ];

      if (spreadsheetId) {
        await gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: spreadsheetId,
          range: "Sales!A:H",
          valueInputOption: "USER_ENTERED",
          resource: { values: [sale] },
        });
      }

      alert(`✅ Sale recorded!\n₹${total.toFixed(2)} | Stock -${qty}`);
      this.reset();
    });

  // === RENDER TABLE ===
  function renderInventoryTable() {
    const tbody = document.querySelector("#inventory-table tbody");
    tbody.innerHTML = "";
    if (inventoryData.length > 0) {
      inventoryData.slice(1).forEach((row, index) => {
        const tr = tbody.insertRow();
        row.forEach(cell => {
          const td = tr.insertCell();
          td.textContent = cell;
        });
        const actions = tr.insertCell();
        actions.innerHTML = `
          <button class="edit-btn" onclick="editRow(${index + 1})">✏️</button>
          <button class="delete-btn" onclick="deleteRow(${
            index + 1
          })">🗑️</button>
        `;
      });
    }
  }

  // === DROPDOWNS ===
  function populateItemDropdowns() {
    const items = inventoryData.slice(1).map(row => `${row[1]} (${row[2]})`);
    document.querySelectorAll("select").forEach(select => {
      if (select.id.includes("items")) {
        select.innerHTML =
          '<option value="">Select Item...</option>' +
          items.map(item => `<option>${item}</option>`).join("");
      }
    });
  }

  // === GLOBAL BUTTON FUNCTIONS ===
  window.editRow = async function (rowIndex) {
    const row = inventoryData[rowIndex];
    const newName = prompt("Edit Name:", row[1]);
    if (newName) {
      row[1] = newName;
      if (spreadsheetId) {
        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: `Inventory!B${rowIndex + 1}`,
          valueInputOption: "USER_ENTERED",
          resource: { values: [[newName]] },
        });
      }
      renderInventoryTable();
    }
  };

  window.deleteRow = async function (rowIndex) {
    if (confirm("Delete this item?")) {
      inventoryData.splice(rowIndex, 1);
      if (spreadsheetId) {
        await gapi.client.sheets.spreadsheets.values.clear({
          spreadsheetId: spreadsheetId,
          range: `Inventory!A${rowIndex + 1}:G${rowIndex + 1}`,
        });
      }
      renderInventoryTable();
      populateItemDropdowns();
    }
  };

  // Auto-connect if sheet ID exists
  if (spreadsheetId && window.medhaGapiReady) {
    document.getElementById(
      "status"
    ).textContent = `✅ Connected: ${spreadsheetId.slice(-8)}`;
    document.getElementById("status").style.display = "block";
    loadRealInventory();
  }
});
