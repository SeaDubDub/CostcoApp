// ======= Default Sections Template =======
const DEFAULT_SECTIONS = ["Electronics", "Home Appliances", "Garage Stuff", "Bakery", "Produce", "Meat", "Dairy", "Frozen", "Toilet Paper Section", "Food Aisles (Cereal and Sauces)", "Pharmacy", "Snacks and Candy", "Middle Aisles"];

// ======= Data Initialization =======
let stores = JSON.parse(localStorage.getItem("stores")) || [
  { name: "Default Store", sections: DEFAULT_SECTIONS.slice(), items: [] }
];

let currentStoreIndex = JSON.parse(localStorage.getItem("currentStoreIndex")) || 0;
let itemSections = JSON.parse(localStorage.getItem("itemSections")) || {};

// Migrate old items if exist
let oldItems = JSON.parse(localStorage.getItem("items"));
if (oldItems && oldItems.length) {
  stores[0].items = oldItems;
  localStorage.removeItem("items");
}

saveData();

// ======= Save Function =======
function saveData() {
  localStorage.setItem("stores", JSON.stringify(stores));
  localStorage.setItem("currentStoreIndex", JSON.stringify(currentStoreIndex));
  localStorage.setItem("itemSections", JSON.stringify(itemSections));
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
  const select = document.getElementById("storeSelect");
  currentStoreIndex = parseInt(select.value);
  saveData();
  renderList();
  renderSections();
  renderSectionEditor();
}

function addStore() {
  const name = prompt("Enter store name:");
  if (!name) return;
  stores.push({ name: name, sections: DEFAULT_SECTIONS.slice(), items: [] });
  currentStoreIndex = stores.length - 1;
  saveData();
  renderStores();
  renderList();
  renderSections();
  renderSectionEditor();
}

function renderManageStoreSelect() {
  const select = document.getElementById("manageStoreSelect");
  if (!select) return;

  select.innerHTML = "";

  stores.forEach((store, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = store.name;
    if (index === currentStoreIndex) option.selected = true;
    select.appendChild(option);
  });
}

document.addEventListener("change", function (e) {
  if (e.target.id === "manageStoreSelect") {
    currentStoreIndex = parseInt(e.target.value);
    saveData();
    renderSectionEditor();
  }
});

function renameStore() {
  const store = stores[currentStoreIndex];
  const newName = prompt("Rename store:", store.name);
  if (!newName || newName === store.name) return;

  store.name = newName;
  saveData();
  renderStores();              // main page dropdown
  renderManageStoreSelect();   // manage dropdown
}

function deleteStore() {
  if (stores.length === 1) {
    alert("You must have at least one store.");
    return;
  }

  if (!confirm("Delete this store?")) return;

  stores.splice(currentStoreIndex, 1);
  currentStoreIndex = 0;

  saveData();
  renderStores();
  renderManageStoreSelect();
  renderSectionEditor();
  renderList();
}

// ======= Section Functions =======
function renderSections() {
  const sectionList = document.getElementById("sectionSelect");
  if (!sectionList) return;
  sectionList.innerHTML = "";
  stores[currentStoreIndex].sections.forEach(section => {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    sectionList.appendChild(option);
  });
}

function renderSectionEditor() {
  const sectionUl = document.getElementById("sectionList");
  sectionUl.innerHTML = "";
  stores[currentStoreIndex].sections.forEach((section, index) => {
    const li = document.createElement("li");
    li.textContent = section;

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

    li.appendChild(upBtn);
    li.appendChild(downBtn);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    sectionUl.appendChild(li);
  });
}

function moveSection(idx, dir) {
  const sections = stores[currentStoreIndex].sections;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= sections.length) return;
  [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
  saveData();
  renderSections();
  renderSectionEditor();
}

function addSection() {
  const name = prompt("Enter new section name:");
  if (!name) return;
  const sections = stores[currentStoreIndex].sections;
  if (sections.includes(name)) { alert("Section already exists!"); return; }
  sections.push(name);
  saveData();
  renderSections();
  renderSectionEditor();
}

function editSection(idx) {
  const oldName = stores[currentStoreIndex].sections[idx];
  const newName = prompt("Rename section:", oldName);
  if (!newName || newName === oldName) return;
  const sections = stores[currentStoreIndex].sections;
  if (sections.includes(newName)) { alert("Section exists!"); return; }
  sections[idx] = newName;
  stores[currentStoreIndex].items.forEach(item => { if (item.section === oldName) item.section = newName; });
  saveData();
  renderSections();
  renderSectionEditor();
}

function deleteSection(idx) {
  const sections = stores[currentStoreIndex].sections;
  const sectionName = sections[idx];

  if (!confirm(`Delete section "${sectionName}"?`)) return;

  // Remove section
  sections.splice(idx, 1);

  // Optional: remove section from any items using it
  stores[currentStoreIndex].items.forEach(item => {
    if (item.section === sectionName) {
      item.section = sections[0] || "Aisle Items";
    }
  });

  saveData();
  renderSections();
  renderSectionEditor();
  renderList();
}

// ======= Grocery List Functions =======
let hideCompleted = false;
document.getElementById("hideCompletedToggle").addEventListener("change", (e) => {
  hideCompleted = e.target.checked;
  renderList();
});

function renderList() {
  const listUl = document.getElementById("groceryList");
  listUl.innerHTML = "";

  const items = stores[currentStoreIndex].items;
  const sections = stores[currentStoreIndex].sections;

  // Sort items by section order
  items.sort((a, b) =>
    sections.indexOf(a.section) - sections.indexOf(b.section)
  );

  let lastSection = null;

  items.forEach((item, idx) => {
    if (hideCompleted && item.completed) return;

    // ✅ INSERT SECTION HEADER WHEN SECTION CHANGES
    if (item.section !== lastSection) {
      lastSection = item.section;

      const headerLi = document.createElement("li");
      headerLi.textContent = item.section;
      headerLi.classList.add("section-header");
      listUl.appendChild(headerLi);
    }

    const li = document.createElement("li");
    li.draggable = true;

    li.addEventListener("dragstart", e =>
      e.dataTransfer.setData("text/plain", idx)
    );
    li.addEventListener("dragover", e => e.preventDefault());
    li.addEventListener("drop", e => {
      e.preventDefault();
      const draggedIdx = parseInt(e.dataTransfer.getData("text/plain"));
      if (draggedIdx === idx) return;

      const draggedItem = items[draggedIdx];
      items.splice(draggedIdx, 1);
      items.splice(idx, 0, draggedItem);

      saveData();
      renderList();
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed || false;
    checkbox.onclick = () => {
      item.completed = !item.completed;
      saveData();
      renderList();
    };

    const span = document.createElement("span");
    span.textContent = item.name;
    if (item.completed) {
      span.style.textDecoration = "line-through";
      span.style.color = "#888";
    }

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => editItemSection(idx);

    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.onclick = () => {
      items.splice(idx, 1);
      saveData();
      renderList();
    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    listUl.appendChild(li);
  });
}

function addItem() {
  const input = document.getElementById("itemInput");
  const section = stores[currentStoreIndex].sections[0] || "Aisle Items";
  if (!input.value) return;
  stores[currentStoreIndex].items.push({ name: input.value, section, completed:false });
  input.value = "";
  saveData();
  renderList();
}

function editItemSection(idx) {
  const item = stores[currentStoreIndex].items[idx];
  const sections = stores[currentStoreIndex].sections;
  let newSection = prompt(`Assign new section for "${item.name}":\nAvailable: ${sections.join(", ")}`, item.section);
  if (!newSection || !sections.includes(newSection)) return;
  item.section = newSection;
  saveData();
  renderList();
}

// ======= Paste Items =======
async function pasteItems() {
  const text = document.getElementById("pasteInput").value;
  if (!text) return;
  const lines = text.split("\n").map(line => line.trim())
    .map(line => line.replace(/^-\s*(\[\s*[xX]?\s*\]\s*)?/, ""))
    .map(line => line.charAt(0).toUpperCase() + line.slice(1))
    .filter(line => line);

  for (let name of lines) {
    let section = itemSections[name];
    if (!section) section = await promptSectionDropdown(name);
    if (!section) section = "Aisle Items";
    itemSections[name] = section;
    if (!stores[currentStoreIndex].sections.includes(section)) stores[currentStoreIndex].sections.push(section);

    stores[currentStoreIndex].items.push({ name, section, completed:false });
  }

  document.getElementById("pasteInput").value = "";
  saveData();
  renderSections();
  renderSectionEditor();
  renderList();
}

// ======= Overlay Dropdown for Paste =======
function promptSectionDropdown(name) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    overlay.style.position="fixed"; overlay.style.top=0; overlay.style.left=0;
    overlay.style.width="100%"; overlay.style.height="100%";
    overlay.style.backgroundColor="rgba(0,0,0,0.5)";
    overlay.style.display="flex"; overlay.style.alignItems="center"; overlay.style.justifyContent="center";
    overlay.style.zIndex=9999;

    const dialog = document.createElement("div");
    dialog.style.backgroundColor="white"; dialog.style.padding="20px"; dialog.style.borderRadius="8px"; dialog.style.textAlign="center";

    const label = document.createElement("p");
    label.textContent = `Select section for "${name}"`;
    dialog.appendChild(label);

    const select = document.createElement("select");
    stores[currentStoreIndex].sections.forEach(section => {
      const opt = document.createElement("option");
      opt.value = section; opt.textContent = section;
      select.appendChild(opt);
    });
    dialog.appendChild(select);

    const okBtn = document.createElement("button");
    okBtn.textContent = "OK"; okBtn.style.marginTop="10px";
    okBtn.onclick = () => { document.body.removeChild(overlay); resolve(select.value); };
    dialog.appendChild(okBtn);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  });
}

// ======= View Switching =======
function showSettings() { 
  document.getElementById("listView").classList.remove("active"); 
  document.getElementById("settingsView").classList.add("active"); 
  renderStores(); 
  renderManageStoreSelect();   // NEW
  renderSectionEditor(); 
}

document.addEventListener("DOMContentLoaded", () => {
  const pasteBox = document.getElementById("pasteInput");
  if (pasteBox) pasteBox.focus();
});



function showList() { document.getElementById("settingsView").classList.remove("active"); document.getElementById("listView").classList.add("active"); renderList(); renderStores(); renderSections(); }

// ======= Initial Render =======
renderStores();
renderManageStoreSelect();
renderList();
renderSections();
renderSectionEditor();