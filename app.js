// ======= Default Sections Template =======
const DEFAULT_SECTIONS = ["Electronics", "Home Appliances", "Garage Stuff", "Bakery", "Produce", "Meat", "Dairy", "Frozen", "Toilet Paper Section", "Food Aisles (Cereal and Sauces)", "Pharmacy", "Snacks and Candy", "Middle Aisles"];

// ======= Data Initialization =======
let stores = JSON.parse(localStorage.getItem("stores")) || [
  {
    name: "Default Store",
    sections: DEFAULT_SECTIONS.slice() // copy template for first store
  }
];

let currentStoreIndex = JSON.parse(localStorage.getItem("currentStoreIndex")) || 0;
let items = JSON.parse(localStorage.getItem("items")) || [];
let itemSections = JSON.parse(localStorage.getItem("itemSections")) || {
  "Milk": "Dairy",
  "Cream": "Dairy",
  "Cheese": "Frozen",
  "Apples": "Produce",
  "Bananas": "Produce",
  "Bread": "Bakery",
  "Bagels": "Bakery",
  "Chicken": "Meat",
  "Beef": "Meat",
  "Ice Cream": "Frozen",
  "Frozen Pizza": "Frozen",
  "Cereal": "Food Aisles (Cereal and Sauces)",
  "Pasta": "Food Aisles (Cereal and Sauces)"
};

// Ensure all stores have "Aisle Items"
stores.forEach(store => {
  if (!store.sections.includes("Aisle Items")) store.sections.push("Aisle Items");
});

saveData();

// ======= Save/Sort Functions =======
function saveData() {
  localStorage.setItem("items", JSON.stringify(items));
  localStorage.setItem("stores", JSON.stringify(stores));
  localStorage.setItem("currentStoreIndex", JSON.stringify(currentStoreIndex));
  localStorage.setItem("itemSections", JSON.stringify(itemSections));
}

function sortItems() {
  const sections = stores[currentStoreIndex].sections;
  items.sort((a, b) => sections.indexOf(a.section) - sections.indexOf(b.section));
}

// ======= Store Functions =======
function renderStores() {
  const storeSelect = document.getElementById("storeSelect");
  storeSelect.innerHTML = "";

  stores.forEach((store, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = store.name;
    if (index === currentStoreIndex) option.selected = true;
    storeSelect.appendChild(option);
  });
}

function changeStore() {
  currentStoreIndex = parseInt(document.getElementById("storeSelect").value);
  saveData();
  renderSections();
  renderSectionEditor();
  renderList();
}

function addStore() {
  const name = prompt("Enter store name:");
  if (!name) return;

  stores.push({
    name: name,
    sections: DEFAULT_SECTIONS.slice() // always use template
  });

  currentStoreIndex = stores.length - 1;
  saveData();
  renderStores();
  renderSections();
  renderSectionEditor();
  renderList();
}

// ======= Section Functions =======
function renderSections() {
  const sectionSelect = document.getElementById("sectionSelect");
  sectionSelect.innerHTML = "";

  const sections = stores[currentStoreIndex].sections;

  sections.forEach(section => {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    sectionSelect.appendChild(option);
  });
}

function renderSectionEditor() {
  const sectionList = document.getElementById("sectionList");
  sectionList.innerHTML = "";

  const sections = stores[currentStoreIndex].sections;

  sections.forEach((section, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = section;

    const controls = document.createElement("div");
    controls.className = "section-controls";

    const upBtn = document.createElement("button");
    upBtn.textContent = "↑";
    upBtn.onclick = () => moveSection(index, -1);

    const downBtn = document.createElement("button");
    downBtn.textContent = "↓";
    downBtn.onclick = () => moveSection(index, 1);

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => editSection(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = () => deleteSection(index);

    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    controls.appendChild(editBtn);
    controls.appendChild(deleteBtn);

    li.appendChild(nameSpan);
    li.appendChild(controls);
    sectionList.appendChild(li);
  });
}

function moveSection(index, direction) {
  const sections = stores[currentStoreIndex].sections;
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= sections.length) return;

  [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
  saveData();
  renderSections();
  renderSectionEditor();
  renderList();
}

function addSection() {
  const name = prompt("Enter new section name:");
  if (!name) return;

  const sections = stores[currentStoreIndex].sections;

  if (sections.includes(name)) {
    alert("This section already exists!");
    return;
  }

  sections.push(name);
  saveData();
  renderSections();
  renderSectionEditor();
}

function editSection(index) {
  const oldName = stores[currentStoreIndex].sections[index];
  const newName = prompt("Rename section:", oldName);
  if (!newName || newName === oldName) return;

  const sections = stores[currentStoreIndex].sections;
  if (sections.includes(newName)) {
    alert("A section with that name already exists!");
    return;
  }

  sections[index] = newName;
  items.forEach(item => {
    if (item.section === oldName) item.section = newName;
  });

  saveData();
  renderSections();
  renderSectionEditor();
  renderList();
}

function deleteSection(index) {
  const sections = stores[currentStoreIndex].sections;
  const sectionToDelete = sections[index];

  const confirmDelete = confirm(`Delete section "${sectionToDelete}"? Items in this section will move to "Aisle Items".`);
  if (!confirmDelete) return;

  items.forEach(item => {
    if (item.section === sectionToDelete) item.section = "Aisle Items";
  });

  sections.splice(index, 1);
  saveData();
  renderSections();
  renderSectionEditor();
  renderList();
}

// ======= Hide Completed Toggle =======
let hideCompleted = false;
document.getElementById("toggleCompleted").addEventListener("change", (e) => {
  hideCompleted = e.target.checked;
  renderList();
});

// ======= Item Functions with Drag & Drop =======
function renderList() {
  sortItems();
  const list = document.getElementById("groceryList");
  list.innerHTML = "";

  items.forEach((item, index) => {
    if (hideCompleted && item.completed) return;

    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.draggable = true;

    // Drag & Drop
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index);
    });

    li.addEventListener("dragover", (e) => e.preventDefault());

    li.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
      if (draggedIndex === index) return;

      const draggedItem = items[draggedIndex];
      items.splice(draggedIndex, 1);
      items.splice(index, 0, draggedItem);
      saveData();
      renderList();
    });

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed || false;
    checkbox.onclick = () => toggleComplete(index);

    // Item Text
    const span = document.createElement("span");
    span.textContent = `${item.name} (${item.section})`;
    if (item.completed) {
      span.style.textDecoration = "line-through";
      span.style.color = "#888";
    }

    // Edit Item Section Button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => editItemSection(index);

    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.onclick = () => {
      items.splice(index, 1);
      saveData();
      renderList();
    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

function toggleComplete(index) {
  items[index].completed = !items[index].completed;
  saveData();
  renderList();
}

function addItem() {
  const input = document.getElementById("itemInput");
  const section = document.getElementById("sectionSelect").value;
  if (!input.value) return;

  items.push({ name: input.value, section: section, completed: false });
  input.value = "";
  saveData();
  renderList();
}

function editItemSection(index) {
  const currentSections = stores[currentStoreIndex].sections;
  const item = items[index];
  let newSection = prompt(`Assign a new section for "${item.name}":\nAvailable sections: ${currentSections.join(", ")}`, item.section);
  if (!newSection || newSection === item.section) return;
  if (!currentSections.includes(newSection)) {
    alert("Section not found. Please choose from the existing sections.");
    return;
  }
  item.section = newSection;
  saveData();
  renderList();
}

// ======= Helper: Dropdown Prompt for Paste =======
function promptSectionDropdown(itemName) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = 9999;

    const dialog = document.createElement("div");
    dialog.style.backgroundColor = "white";
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "8px";
    dialog.style.textAlign = "center";
    dialog.style.minWidth = "250px";

    const label = document.createElement("p");
    label.textContent = `Select a section for "${itemName}":`;
    dialog.appendChild(label);

    const select = document.createElement("select");
    stores[currentStoreIndex].sections.forEach(section => {
      const option = document.createElement("option");
      option.value = section;
      option.textContent = section;
      select.appendChild(option);
    });
    dialog.appendChild(select);

    const okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.style.marginTop = "10px";
    okBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(select.value);
    };
    dialog.appendChild(okBtn);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  });
}

// ======= Paste Items Feature =======
async function pasteItems() {
  const text = document.getElementById("pasteInput").value;
  if (!text) return;

  const lines = text.split("\n").map(line => line.trim()).filter(line => line);

  for (let itemName of lines) {
    let section = itemSections[itemName];

    if (!section) {
      section = await promptSectionDropdown(itemName);
      if (!section) section = "Aisle Items";
      itemSections[itemName] = section;

      const currentSections = stores[currentStoreIndex].sections;
      if (!currentSections.includes(section)) {
        currentSections.push(section);
        renderSections();
        renderSectionEditor();
      }
    }

    items.push({ name: itemName, section: section, completed: false });
  }

  document.getElementById("pasteInput").value = "";
  saveData();
  renderList();
}

// ======= Initial Render =======
renderStores();
renderSections();
renderSectionEditor();
renderList();
