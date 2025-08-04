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
      <td>
        <button class="edit" onclick="editProduct(${i})">Edit</button>
        <button class="delete" onclick="deleteProduct(${i})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editProduct(index) {
  const p = products[index];
  document.getElementById("productName").value = p.name;
  document.getElementById("productQty").value = p.qty;
  document.getElementById("productPrice").value = p.price;
  document.getElementById("editIndex").value = index;
}

function deleteProduct(index) {
  if (confirm("Are you sure you want to delete this product?")) {
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
  const editIndex = document.getElementById("editIndex").value;

  if (editIndex === "") {
    products.push({ name, qty, price });
  } else {
    products[editIndex] = { name, qty, price };
    document.getElementById("editIndex").value = "";
  }

  saveToStorage();
  renderTable(document.getElementById("searchBox").value);
  document.getElementById("productForm").reset();
});

document.getElementById("searchBox").addEventListener("input", function(e) {
  renderTable(e.target.value);
});

// Initial render
renderTable();
