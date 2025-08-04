let products = JSON.parse(localStorage.getItem("products")) || [];

function saveToStorage() {
  localStorage.setItem("products", JSON.stringify(products));
}

function renderTable(filter = "") {
  const tbody = document.querySelector("#inventoryTable tbody");
  tbody.innerHTML = "";
  products.forEach((p, i) => {
    if (!p.name.toLowerCase().includes(filter.toLowerCase())) return;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.name}</td>
      <td>${p.qty}</td>
      <td>₹${p.price}</td>
      <td>${p.category}</td>
      <td>
        <button class="edit" onclick="editProduct(${i})">Edit</button>
        <button class="delete" onclick="deleteProduct(${i})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  renderChart();
}

function editProduct(index) {
  const p = products[index];
  document.getElementById("productName").value = p.name;
  document.getElementById("productQty").value = p.qty;
  document.getElementById("productPrice").value = p.price;
  document.getElementById("productCategory").value = p.category;
  document.getElementById("editIndex").value = index;
}

function deleteProduct(index) {
  if (confirm("Are you sure?")) {
    products.splice(index, 1);
    saveToStorage();
    renderTable(document.getElementById("searchBox").value);
  }
}

document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("productName").value;
  const qty = parseInt(document.getElementById("productQty").value);
  const price = parseFloat(document.getElementById("productPrice").value);
  const category = document.getElementById("productCategory").value;
  const editIndex = document.getElementById("editIndex").value;

  if (editIndex === "") {
    products.push({ name, qty, price, category });
  } else {
    products[editIndex] = { name, qty, price, category };
    document.getElementById("editIndex").value = "";
  }

  saveToStorage();
  renderTable(document.getElementById("searchBox").value);
  document.getElementById("productForm").reset();
});

document.getElementById("searchBox").addEventListener("input", function(e) {
  renderTable(e.target.value);
});

function renderChart() {
  const ctx = document.getElementById("inventoryChart").getContext("2d");
  const categories = {};
  products.forEach(p => {
    if (!categories[p.category]) categories[p.category] = 0;
    categories[p.category] += p.qty;
  });

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        label: 'Quantity by Category',
        data: Object.values(categories),
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Admin login
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const pass = document.getElementById("adminPassword").value;
  if (pass === "admin123") {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("appScreen").style.display = "block";
    renderTable();
  } else {
    alert("Wrong password!");
  }
});
