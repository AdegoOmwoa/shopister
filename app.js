document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form");
  const tbody = document.querySelector("tbody");
  const editModal = document.getElementById("editModal");
  const editAmountInput = document.getElementById("editAmount");
  const editDescInput = document.getElementById("editDesc");
  const saveChangesButton = document.getElementById("saveChanges");
  const cancelEditButton = document.getElementById("cancelEdit");
  const searchInput = document.getElementById('searchInput');
  const downloadCSVButton = document.getElementById("uploadCSV");

  let currentDebtIndex;

  // Load saved debts from local storage
  loadDebts();

  // Form submission event
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const debt = document.getElementById("debt").value;
    const amount = document.getElementById("amount").value;
    const desc = document.getElementById("desc").value;

    const newDebt = {
      debt,
      amount: parseFloat(amount),
      desc,
      datePlaced: new Date().toLocaleDateString(),
      updatedDate: new Date().toLocaleDateString(),
    };

    saveDebt(newDebt);
    form.reset();
  });

  // Save changes to the debt
  saveChangesButton.addEventListener("click", () => {
    if (currentDebtIndex !== undefined) {
      const debts = JSON.parse(localStorage.getItem("debts")) || [];
      debts[currentDebtIndex].amount = parseFloat(editAmountInput.value);
      debts[currentDebtIndex].desc = editDescInput.value;
      debts[currentDebtIndex].updatedDate = new Date().toLocaleDateString();

      localStorage.setItem("debts", JSON.stringify(debts));
      tbody.innerHTML = "";
      loadDebts();
      closeModal();
    }
  });

  // Cancel edit button
  cancelEditButton.addEventListener("click", closeModal);

  function saveDebt(debt) {
    const debts = JSON.parse(localStorage.getItem("debts")) || [];
    debts.push(debt);
    localStorage.setItem("debts", JSON.stringify(debts));
    addDebtToTable(debt, debts.length - 1); // Pass the new index to addDebtToTable
  }

  function loadDebts() {
    const debts = JSON.parse(localStorage.getItem("debts")) || [];
    debts.forEach((debt, index) => {
      addDebtToTable(debt, index);
    });
  }

  function addDebtToTable(debt, index) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        ${debt.datePlaced}<br />
        <span style="color: #6c757d; font-size: 0.8em">Updated: ${debt.updatedDate}</span>
      </td>
      <td>${debt.debt}</td>
      <td>
        <div class="amount-container" style="display: flex; justify-content: space-between">
          ${debt.amount}
          <i class="fas fa-info-circle"></i>
          <div class="tooltip">${debt.desc}</div>
        </div>
      </td>
      <td class="action-buttons">
        <button class="edit-button">Edit</button>
        <button class="delete-button">Delete</button>
      </td>
    `;
    tbody.appendChild(row);

    row.querySelector(".edit-button").addEventListener("click", () => {
      openModal(debt, index);
    });

    row.querySelector(".delete-button").addEventListener("click", () => {
      deleteDebt(index);
      row.remove();
    });

    // Toggle the display of the tooltip on click
    row.querySelector(".fa-info-circle").addEventListener("click", () => {
      const tooltip = row.querySelector(".tooltip");
      tooltip.style.display = tooltip.style.display === "block" ? "none" : "block";
    });
  }

  function openModal(debt, index) {
    currentDebtIndex = index;
    editAmountInput.value = debt.amount;
    editDescInput.value = debt.desc;
    editModal.classList.add('show');
  }

  function closeModal() {
    editModal.classList.remove('show');
  }

  function deleteDebt(index) {
    const debts = JSON.parse(localStorage.getItem("debts")) || [];
    debts.splice(index, 1);
    localStorage.setItem("debts", JSON.stringify(debts));
  }

  function performSearch(query) {
    query = query.toLowerCase(); // Convert query to lowercase for case-insensitive search

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
      const debtorCell = row.querySelector('td:nth-child(2)');
      const debtorText = debtorCell.textContent.toLowerCase();

      row.style.display = debtorText.includes(query) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', () => {
    performSearch(searchInput.value);
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission if inside a form
      performSearch(searchInput.value);
    }
  });

  downloadCSVButton.addEventListener("click", () => {
    const table = document.querySelector("table");
    const rows = Array.from(table.querySelectorAll("tr"));
    const csvContent = rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("th, td"));
        return cells.map((cell) => `"${cell.innerText}"`).join(",");
      })
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "debts.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    });
  }

  // Optionally, hide tooltips when clicking outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".amount-container")) {
      document.querySelectorAll(".tooltip").forEach((tooltip) => {
        tooltip.style.display = "none";
      });
    }
  });
});
