document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('productName').value;
  const qty = document.getElementById('productQty').value;
  const price = document.getElementById('productPrice').value;

  if (name && qty && price) {
    const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const nameCell = newRow.insertCell(0);
    const qtyCell = newRow.insertCell(1);
    const priceCell = newRow.insertCell(2);

    nameCell.textContent = name;
    qtyCell.textContent = qty;
    priceCell.textContent = '₹' + price;

    // Clear form
    document.getElementById('productForm').reset();
  }
});
