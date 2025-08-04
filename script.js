let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let currentUserRole = null;

function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("sales", JSON.stringify(sales));
}

function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
  if (id === "inventory") renderTable();
  if (id === "salesReport") renderSalesReport();
}

function renderTable(filter = "") {
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";
  products.forEach((p, i) => {
    if (p.qty <= 0 || !p.name.toLowerCase().includes(filter.toLowerCase())) return;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.name} (${p.uom || ""})</td>
      <td>${p.qty}</td>
      <td>₹${p.price}</td>
      <td>
        ${currentUserRole === 'admin' ? `
        <button class="edit" onclick="editProduct(${i})">Edit</button>
        <button class="delete" onclick="deleteProduct(${i})">Delete</button>` : ''}
      </td>
    `;
    tbody.appendChild(row);
  });
  renderSaleOptions();
}

function renderSaleOptions() {
  const select = document.getElementById("saleProductSelect");
  select.innerHTML = "";
  products.forEach((p, i) => {
    if (p.qty > 0) {
      const option = document.createElement("option");
      option.value = i;
      option.text = `${p.name} (Available: ${p.qty})`;
      select.appendChild(option);
    }
  });
}

function editProduct(index) {
  const p = products[index];
  document.getElementById("productName").value = p.name;
  document.getElementById("productQty").value = p.qty;
  document.getElementById("productPrice").value = p.price;
  document.getElementById("editIndex").value = index;
  showSection("addProduct");
}

function deleteProduct(index) {
  if (confirm("Are you sure?")) {
    products.splice(index, 1);
    saveData();
    renderTable(document.getElementById("searchBox").value);
  }
}

document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("productName").value.trim();
  const qty = parseInt(document.getElementById("productQty").value);
  const price = parseFloat(document.getElementById("productPrice").value);
  const editIndex = document.getElementById("editIndex").value;

  if (editIndex === "") {
    const uom = document.getElementById("productUOM").value.trim();
    products.push({ name, qty, price, uom });
  } else {
    const uom = document.getElementById("productUOM").value.trim();
    products[editIndex] = { name, qty, price, uom };
    document.getElementById("editIndex").value = "";
  }

  saveData();
  renderTable();
  document.getElementById("productForm").reset();
  
});

document.getElementById("searchBox").addEventListener("input", function(e) {
  renderTable(e.target.value);
});

document.getElementById("saleForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const index = parseInt(document.getElementById("saleProductSelect").value);
  const qtyToSell = parseInt(document.getElementById("saleQty").value);
  const product = products[index];

  if (qtyToSell > 0 && product.qty >= qtyToSell) {
    product.qty -= qtyToSell;
    const total = qtyToSell * product.price;
    const date = new Date().toISOString().split("T")[0];
    sales.push({ name: product.name, qty: qtyToSell, total, date });
    saveData();
    renderTable();
    document.getElementById("saleMessage").innerText = `Sold ${qtyToSell} of ${product.name}`;
  } else {
    document.getElementById("saleMessage").innerText = "Invalid quantity!";
  }
  document.getElementById("saleForm").reset();
});

document.getElementById("reportDate").addEventListener("input", renderSalesReport);

function renderSalesReport() {
  const tbody = document.getElementById("reportTable");
  const selectedDate = document.getElementById("reportDate").value;
  tbody.innerHTML = "";
  sales.filter(s => !selectedDate || s.date === selectedDate).forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${s.name}</td><td>${s.qty}</td><td>₹${s.total}</td><td>${s.date}</td>`;
    tbody.appendChild(row);
  });
}

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const role = document.getElementById("userRole").value;
  const pass = document.getElementById("userPassword").value;
  if ((role === "admin" && pass === "admin123") || (role === "cashier" && pass === "cash123")) {
    currentUserRole = role;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline";
    document.getElementById("appScreen").style.display = "block";
    const nav = document.getElementById("navButtons");
    nav.innerHTML = "";
    if (role === "admin") {
      nav.innerHTML += `<button onclick="showSection('inventory')">Inventory</button>
                        <button onclick="showSection('addProduct')">Add Product</button>`;
    }
    nav.innerHTML += `<button onclick="showSection('saleProduct')">Sell Product</button>
                      <button onclick="showSection('salesReport')">Sales Report</button>`;
    
  } else {
    alert("Wrong credentials!");
  }
});

document.getElementById("logoutBtn").addEventListener("click", function () {
  location.reload();
});
