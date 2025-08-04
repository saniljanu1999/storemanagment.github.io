let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let currentUserRole = null;

const loginForm = document.getElementById("loginForm");
const productForm = document.getElementById("productForm");
const saleForm = document.getElementById("saleForm");
const searchBox = document.getElementById("searchBox");
const reportDate = document.getElementById("reportDate");
const logoutBtn = document.getElementById("logoutBtn");

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
  const filteredProducts = products.filter(p => p.qty > 0 && p.name.toLowerCase().includes(filter.toLowerCase()));
  
  filteredProducts.forEach((p, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.name} (${p.uom || ""})</td>
      <td>${p.qty}</td>
      <td>₹${p.price.toFixed(2)}</td>
      <td>
        ${currentUserRole === 'admin' ? `
        <button class="button-secondary edit-btn" data-index="${products.indexOf(p)}">Edit</button>
        <button class="button-danger delete-btn" data-index="${products.indexOf(p)}">Delete</button>` : ''}
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

function renderSalesReport() {
  const tbody = document.getElementById("reportTable");
  const selectedDate = reportDate.value;
  tbody.innerHTML = "";
  
  const filteredSales = sales.filter(s => !selectedDate || s.date === selectedDate);
  
  filteredSales.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${s.name}</td><td>${s.qty}</td><td>₹${s.total.toFixed(2)}</td><td>${s.date}</td>`;
    tbody.appendChild(row);
  });
}

// Event Listeners

loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const role = document.getElementById("userRole").value;
  const pass = document.getElementById("userPassword").value;
  if ((role === "admin" && pass === "admin123") || (role === "cashier" && pass === "cash123")) {
    currentUserRole = role;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("appScreen").style.display = "block";
    const nav = document.getElementById("navButtons");
    nav.innerHTML = "";
    if (role === "admin") {
      nav.innerHTML += `<button class="button-secondary" onclick="showSection('inventory')">Inventory</button>
                        <button class="button-secondary" onclick="showSection('addProduct')">Add Product</button>`;
    }
    nav.innerHTML += `<button class="button-secondary" onclick="showSection('saleProduct')">Sell Product</button>
                      <button class="button-secondary" onclick="showSection('salesReport')">Sales Report</button>`;
    showSection("inventory");
  } else {
    alert("Wrong credentials!");
  }
});

productForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("productName").value.trim();
  const qty = parseInt(document.getElementById("productQty").value);
  const uom = document.getElementById("productUOM").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const editIndex = document.getElementById("editIndex").value;

  if (editIndex === "") {
    products.push({ name, qty, price, uom });
  } else {
    products[editIndex] = { name, qty, price, uom };
    document.getElementById("editIndex").value = "";
  }
  saveData();
  renderTable();
  productForm.reset();
});

searchBox.addEventListener("input", function(e) {
  renderTable(e.target.value);
});

saleForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const saleMessage = document.getElementById("saleMessage");
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
    saleMessage.innerText = `Sold ${qtyToSell} of ${product.name} successfully.`;
    saleMessage.className = "feedback-message success";
  } else {
    saleMessage.innerText = "Invalid quantity or insufficient stock!";
    saleMessage.className = "feedback-message error";
  }
  saleForm.reset();
});

reportDate.addEventListener("input", renderSalesReport);

logoutBtn.addEventListener("click", function () {
  location.reload();
});

// Event delegation for Edit and Delete buttons on the inventory table
document.querySelector("#inventoryTable tbody").addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const index = e.target.dataset.index;
    const p = products[index];
    document.getElementById("productName").value = p.name;
    document.getElementById("productQty").value = p.qty;
    document.getElementById("productUOM").value = p.uom || "";
    document.getElementById("productPrice").value = p.price;
    document.getElementById("editIndex").value = index;
    showSection("addProduct");
  }
  
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    if (confirm(`Are you sure you want to delete ${products[index].name}?`)) {
      products.splice(index, 1);
      saveData();
      renderTable(searchBox.value);
    }
  }
});
