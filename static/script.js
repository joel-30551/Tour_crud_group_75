/** ⭐ Local Storage Helpers */
function saveToursToLocal(tours) {
  localStorage.setItem("tours", JSON.stringify(tours));
}
function getToursFromLocal() {
  const stored = localStorage.getItem("tours");
  return stored ? JSON.parse(stored) : [];
}

/** Load Tours (hybrid: local first, then backend) */
async function loadTours() {
  // 1️⃣ Load from localStorage first
  allTours = getToursFromLocal();

  // 2️⃣ Fetch fresh copy from backend
  try {
    const res = await fetch("/api/tours");
    if (res.ok) {
      const backendTours = await res.json();
      allTours = backendTours;
      saveToursToLocal(allTours); // keep local in sync
    }
  } catch (err) {
    console.warn("⚠️ Backend not reachable, using local storage only.");
  }

  currentPage = 1;
  renderTable();
}

/** Submit Form (Add/Edit) */
tourForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    tour_id: tourIdInput.value.trim(),
    name: capitalizeWords(document.getElementById("name").value.trim()),
    destination: capitalizeWords(document.getElementById("destination").value.trim()),
    start_date: document.getElementById("startDate").value,
    end_date: document.getElementById("endDate").value,
    price: parseFloat(document.getElementById("price").value),
    tour_guide: capitalizeWords(document.getElementById("tourGuide").value.trim())
  };

  if (!isValidTourId(data.tour_id)) {
    alert("❌ Invalid Tour ID. Please use the format T001, T002, etc.");
    return;
  }

  if (!editTourId) {
    // ADD
    const exists = allTours.some(t => t.tour_id === data.tour_id);
    if (exists) {
      alert(`⚠️ The Tour ID "${data.tour_id}" already exists.`);
      return;
    }
    allTours.push(data);
    saveToursToLocal(allTours);

    try {
      await fetch("/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch {
      console.warn("⚠️ Could not sync add to backend. Local only.");
    }

    confirmationMessage = "✅ Tour added successfully!";
  } else {
    // EDIT
    const idx = allTours.findIndex(t => t.tour_id === editTourId);
    if (idx > -1) allTours[idx] = data;
    saveToursToLocal(allTours);

    try {
      await fetch(`/api/tours/${editTourId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch {
      console.warn("⚠️ Could not sync edit to backend. Local only.");
    }

    confirmationMessage = "✅ Tour updated successfully!";
  }

  closeForm();
  renderTable();
  showConfirmation(confirmationMessage);
});

/** Delete Tour */
window.deleteTour = async (tourId) => {
  if (confirm("⚠️ Are you sure you want to delete this tour?")) {
    allTours = allTours.filter(t => t.tour_id !== tourId);
    saveToursToLocal(allTours);

    try {
      await fetch(`/api/tours/${tourId}`, { method: "DELETE" });
    } catch {
      console.warn("⚠️ Could not sync delete to backend. Local only.");
    }

    alert("🗑️ Tour deleted successfully!");
    renderTable();
  }
};
