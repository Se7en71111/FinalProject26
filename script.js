// We store notes in the browser using localStorage.
// localStorage is like a tiny drawer inside your browser.

const titleInput = document.getElementById("titleInput");
const noteInput = document.getElementById("noteInput");
const addBtn = document.getElementById("addBtn");
const notesList = document.getElementById("notesList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const msg = document.getElementById("msg");

function loadNotes() {
  // Get notes from localStorage
  const raw = localStorage.getItem("study_notes");
  return raw ? JSON.parse(raw) : [];
}

function saveNotes(notes) {
  // Save notes to localStorage
  localStorage.setItem("study_notes", JSON.stringify(notes));
}

function showMessage(text) {
  msg.textContent = text;
  setTimeout(() => (msg.textContent = ""), 2000);
}

function renderNotes(filterText = "") {
  const notes = loadNotes();

  // Clear the list first
  notesList.innerHTML = "";

  // Filter notes by search
  const filtered = notes.filter(n =>
    (n.title + " " + n.text).toLowerCase().includes(filterText.toLowerCase())
  );

  emptyState.style.display = filtered.length === 0 ? "block" : "none";

  // Build each note on screen
  filtered.forEach(note => {
    const li = document.createElement("li");
    li.className = "note";

    li.innerHTML = `
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.text)}</p>
      <div class="row">
        <button class="small" data-action="copy" data-id="${note.id}">Copy</button>
        <button class="small danger" data-action="delete" data-id="${note.id}">Delete</button>
      </div>
    `;

    notesList.appendChild(li);
  });
}

// Prevent weird HTML from breaking the page
function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addNote() {
  const title = titleInput.value.trim();
  const text = noteInput.value.trim();

  if (!title || !text) {
    showMessage("Add both title and note 🥲");
    return;
  }

  const notes = loadNotes();

  notes.unshift({
    id: crypto.randomUUID(),
    title,
    text,
    createdAt: new Date().toISOString()
  });

  saveNotes(notes);

  titleInput.value = "";
  noteInput.value = "";

  renderNotes(searchInput.value);
}

// Handle clicks on Copy/Delete buttons
notesList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "delete") {
    const notes = loadNotes().filter(n => n.id !== id);
    saveNotes(notes);
    renderNotes(searchInput.value);
  }

  if (action === "copy") {
    const note = loadNotes().find(n => n.id === id);
    if (note) {
      navigator.clipboard.writeText(note.text);
      showMessage("Copied ✅");
    }
  }
});

addBtn.addEventListener("click", addNote);

searchInput.addEventListener("input", () => {
  renderNotes(searchInput.value);
});

// Show notes when the page loads
renderNotes();
