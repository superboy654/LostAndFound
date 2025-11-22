// ========== DOM ELEMENTS ==========

// Role screen & login
const roleScreen = document.getElementById("roleScreen");
const roleTabs = document.querySelectorAll(".role-tab");
const studentForm = document.getElementById("studentForm");
const volunteerForm = document.getElementById("volunteerForm");

// Main app
const app = document.querySelector(".app");
const roleBadge = document.getElementById("roleBadge");
const itemsGrid = document.getElementById("itemsGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const addBtn = document.getElementById("addBtn");

// Modals & forms
const overlay = document.getElementById("overlay");
const formModal = document.getElementById("formModal");
const itemForm = document.getElementById("itemForm");
const closeForm = document.getElementById("closeForm");

const replyModal = document.getElementById("replyModal");
const replyForm = document.getElementById("replyForm");
const replyItemIdInput = document.getElementById("replyItemId");
const closeReply = document.getElementById("closeReply");

// Image inputs
const itemFileInput = document.getElementById("itemFile");
const itemImageInput = document.getElementById("itemImage");
const itemImageBase64Input = document.getElementById("itemImageBase64");

// State: role & user
let currentRole = null;
let currentUser = null;

// LocalStorage key
const STORAGE_KEY = "campus_lost_found_items_v2";

// Volunteer secret password
const VOLUNTEER_SECRET = "lostfound@campus";

// Default items with your custom images + dates
const defaultItems = [
  {
    id: 1,
    type: "lost",
    name: "Wallet",
    desc: "Black leather wallet with cash and important cards.",
    student: "Aman Kumar Sonkar",
    studID: "23CSE123",
    section: "CSE A",
    date: "2025-11-20",
    image:
      "https://images.pexels.com/photos/164571/pexels-photo-164571.jpeg?auto=compress&cs=tinysrgb&w=800",
    replies: []
  },
  {
    id: 2,
    type: "lost",
    name: "ID Card",
    desc: "College ID card with blue lanyard (student access card).",
    student: "Mohit Kumar Rana",
    studID: "23ECE432",
    section: "ECE B",
    date: "2025-11-19",
    image:
      "https://img.freepik.com/premium-vector/professional-modern-office-id-card-design-template_642592-1935.jpg",
    replies: []
  },
  {
    id: 3,
    type: "lost",
    name: "Book",
    desc: "Physics book (HC Verma), name written on first page.",
    student: "Avinash Kumar",
    studID: "22ME412",
    section: "ME C",
    date: "2025-11-18",
    image:
      "https://booksfy.in/cdn/shop/files/51YNDYL2kqL._SX342_SY445.jpg?v=1744208318",
    replies: []
  },
  {
    id: 4,
    type: "lost",
    name: "Notebooks",
    desc: "Two spiral-bound notebooks with semester notes.",
    student: "Saquid Raza",
    studID: "23CSE245",
    section: "CSE B",
    date: "2025-11-17",
    image:
      "https://tiimg.tistatic.com/fp/1/007/669/yellow-cover-rectangular-single-line-a4-size-white-paper-spiral-notebook-with-224-pages-650.jpg",
    replies: []
  }
];

let items = [];

// ========== LOCALSTORAGE HELPERS ==========

function loadItems() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        items = parsed;
        return;
      }
      throw new Error("Not array");
    } catch {
      items = [...defaultItems];
      saveItems();
    }
  } else {
    items = [...defaultItems];
    saveItems();
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ========== ROLE TABS ==========

roleTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    roleTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const role = tab.dataset.role;
    if (role === "student") {
      studentForm.classList.remove("hidden");
      volunteerForm.classList.add("hidden");
    } else {
      volunteerForm.classList.remove("hidden");
      studentForm.classList.add("hidden");
    }
  });
});

// ========== SET ROLE ==========

function setRole(role, userInfo) {
  currentRole = role;
  currentUser = userInfo;
  roleScreen.classList.add("hidden");
  app.classList.remove("hidden");

  if (role === "student") {
    roleBadge.textContent = `Student: ${userInfo.name} (${userInfo.branch} ${userInfo.section})`;
  } else {
    roleBadge.textContent = `Volunteer: ${userInfo.name}`;
  }

  renderItems();
}

// ========== STUDENT REGISTRATION ==========

studentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("stuName").value.trim();
  const id = document.getElementById("stuID").value.trim();
  const branch = document.getElementById("stuBranch").value.trim();
  const section = document.getElementById("stuSection").value.trim();

  if (!name || !id || !branch || !section) {
    alert("Please fill all fields.");
    return;
  }

  setRole("student", { name, id, branch, section });
});

// ========== VOLUNTEER LOGIN ==========

volunteerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("volName").value.trim();
  const password = document.getElementById("volPassword").value;

  if (!name || !password) {
    alert("Please fill all fields.");
    return;
  }

  if (password !== VOLUNTEER_SECRET) {
    alert("Incorrect secret password.");
    return;
  }

  setRole("volunteer", { name });
});

// ========== DATE FORMATTER ==========

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// ========== IMAGE HANDLING ==========

// File upload → convert to Base64
itemFileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    itemImageBase64Input.value = e.target.result;
    // Clear URL if file chosen
    itemImageInput.value = "";
  };
  reader.readAsDataURL(file);
});

// Paste image into URL field → convert to Base64
itemImageInput.addEventListener("paste", function (event) {
  const itemsClip = event.clipboardData.items;
  for (let it of itemsClip) {
    if (it.type.indexOf("image") !== -1) {
      const blob = it.getAsFile();
      const reader = new FileReader();
      reader.onload = function (e) {
        itemImageBase64Input.value = e.target.result;
      };
      reader.readAsDataURL(blob);
      event.preventDefault();
      return;
    }
  }
});

// ========== RENDER ITEMS ==========

function renderItems() {
  const term = (searchInput?.value || "").trim().toLowerCase();
  const filter = filterType?.value || "all";

  const filtered = items.filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter;
    const text =
      (item.name +
        " " +
        item.desc +
        " " +
        item.student +
        " " +
        item.studID +
        " " +
        item.section)
        .toLowerCase();
    const matchesSearch = !term || text.includes(term);
    return matchesFilter && matchesSearch;
  });

  itemsGrid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";

    // Tag
    const tag = document.createElement("span");
    tag.className = `card-tag ${item.type}`;
    tag.textContent = item.type.toUpperCase();

    // Image
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "card-img";
    const img = document.createElement("img");
    img.src = item.image || "https://via.placeholder.com/400x250?text=No+Image";
    img.alt = item.name;
    img.onerror = () => {
      img.src = "https://via.placeholder.com/400x250?text=Image+Unavailable";
    };
    imgWrapper.appendChild(img);

    // Title & desc
    const title = document.createElement("h3");
    title.textContent = item.name;

    const desc = document.createElement("p");
    desc.className = "card-desc";
    desc.textContent = item.desc;

    const meta = document.createElement("p");
    meta.className = "card-meta";
    meta.innerHTML = `<strong>${item.student}</strong> • ${item.studID} • ${item.section}`;

    const dateLine = document.createElement("p");
    dateLine.className = "card-date";
    const label = item.type === "lost" ? "Lost on" : "Found on";
    dateLine.textContent = item.date ? `${label}: ${formatDate(item.date)}` : "";

    card.appendChild(tag);
    card.appendChild(imgWrapper);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(meta);
    if (item.date) card.appendChild(dateLine);

    // Replies
    if (item.replies && item.replies.length > 0) {
      const repliesBox = document.createElement("div");
      repliesBox.className = "replies";

      item.replies.forEach((rep) => {
        const repEl = document.createElement("div");
        repEl.className = "reply";
        repEl.innerHTML = `
          <strong>${rep.name} (${rep.studentID})</strong>: ${rep.message}
        `;

        if (currentRole === "volunteer") {
          const actions = document.createElement("div");
          actions.style.marginTop = "4px";
          actions.style.display = "flex";
          actions.style.gap = "8px";

          const approveBtn = document.createElement("button");
          approveBtn.textContent = "✔ Approve Claim";
          approveBtn.className = "btn-mark-found";
          approveBtn.style.padding = "4px 8px";
          approveBtn.style.fontSize = "0.75rem";

          approveBtn.addEventListener("click", () => {
            item.type = "found";
            if (!item.date) {
              item.date = new Date().toISOString().slice(0, 10);
            }
            saveItems();
            alert("Claim approved. Item marked as FOUND.");
            renderItems();
          });

          const rejectBtn = document.createElement("button");
          rejectBtn.textContent = "✖ Reject";
          rejectBtn.className = "btn-reply";
          rejectBtn.style.padding = "4px 8px";
          rejectBtn.style.fontSize = "0.75rem";

          rejectBtn.addEventListener("click", () => {
            item.replies = item.replies.filter((r) => r.id !== rep.id);
            saveItems();
            alert("Reply rejected and removed.");
            renderItems();
          });

          actions.appendChild(approveBtn);
          actions.appendChild(rejectBtn);
          repEl.appendChild(actions);
        }

        repliesBox.appendChild(repEl);
      });

      card.appendChild(repliesBox);
    }

    // Footer actions
    const footer = document.createElement("div");
    footer.className = "card-footer";

    if (currentRole === "student") {
      const replyBtn = document.createElement("button");
      replyBtn.className = "btn-reply";
      replyBtn.textContent = "Reply / Claim";
      replyBtn.addEventListener("click", () => openReplyModal(item.id));
      footer.appendChild(replyBtn);
    }

    if (currentRole === "volunteer") {
      const leftBtns = document.createElement("div");
      leftBtns.style.display = "flex";
      leftBtns.style.gap = "6px";

      const markBtn = document.createElement("button");
      markBtn.className = "btn-mark-found";
      markBtn.textContent = item.type === "lost" ? "Mark as Found" : "Mark as Lost";
      markBtn.addEventListener("click", () => toggleStatus(item.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-delete";
      deleteBtn.textContent = "Remove Item";
      deleteBtn.addEventListener("click", () => deleteItem(item.id));

      leftBtns.appendChild(markBtn);
      leftBtns.appendChild(deleteBtn);
      footer.appendChild(leftBtns);
    }

    if (footer.children.length > 0) {
      card.appendChild(footer);
    }

    itemsGrid.appendChild(card);
  });
}

// ========== TOGGLE STATUS (VOLUNTEER) ==========

function toggleStatus(id) {
  if (currentRole !== "volunteer") return;
  items = items.map((it) =>
    it.id === id ? { ...it, type: it.type === "lost" ? "found" : "lost" } : it
  );
  saveItems();
  renderItems();
}

// ========== DELETE ITEM (VOLUNTEER) ==========

function deleteItem(id) {
  if (currentRole !== "volunteer") return;
  const sure = confirm("Are you sure you want to permanently remove this item?");
  if (!sure) return;
  items = items.filter((it) => it.id !== id);
  saveItems();
  renderItems();
}

// ========== MODAL HELPERS ==========

function openItemModal() {
  overlay.classList.remove("hidden");
  formModal.classList.remove("hidden");
}

function closeItemModal() {
  overlay.classList.add("hidden");
  formModal.classList.add("hidden");
}

function openReplyModal(itemId) {
  replyItemIdInput.value = itemId;
  overlay.classList.remove("hidden");
  replyModal.classList.remove("hidden");
}

function closeReplyModal() {
  overlay.classList.add("hidden");
  replyModal.classList.add("hidden");
}

// ========== ADD ITEM ==========

itemForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = document.getElementById("itemType").value;
  const name = document.getElementById("itemName").value.trim();
  const desc = document.getElementById("itemDesc").value.trim();
  const date = document.getElementById("itemDate").value;
  const student = document.getElementById("studentName").value.trim();
  const studID = document.getElementById("studentID").value.trim();
  const section = document.getElementById("section").value.trim();

  let imageURL = itemImageInput.value.trim();
  let imageBase64 = itemImageBase64Input.value.trim();

  if (!name || !desc || !student || !studID || !section || !date) {
    alert("Please fill all required fields.");
    return;
  }

  let finalImage;
  if (imageBase64) {
    finalImage = imageBase64; // from file upload or paste
  } else if (imageURL) {
    finalImage = imageURL;
  } else {
    finalImage = "https://via.placeholder.com/400x250?text=No+Image";
  }

  const newItem = {
    id: Date.now(),
    type,
    name,
    desc,
    date,
    student,
    studID,
    section,
    image: finalImage,
    replies: []
  };

  items.push(newItem);
  saveItems();

  // Reset fields
  itemForm.reset();
  itemImageBase64Input.value = "";
  closeItemModal();
  renderItems();
});

// ========== ADD REPLY (STUDENT) ==========

replyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (currentRole !== "student") {
    alert("Only students can reply/claim items.");
    return;
  }

  const itemId = Number(replyItemIdInput.value);
  const name = document.getElementById("replyName").value.trim();
  const studentID = document.getElementById("replyStudentID").value.trim();
  const message = document.getElementById("replyMessage").value.trim();

  if (!name || !studentID || !message) {
    alert("Please fill all fields.");
    return;
  }

  const item = items.find((it) => it.id === itemId);
  if (!item) {
    alert("Item not found.");
    return;
  }

  if (!Array.isArray(item.replies)) {
    item.replies = [];
  }

  item.replies.push({
    id: Date.now(),
    name,
    studentID,
    message
  });

  saveItems();
  replyForm.reset();
  closeReplyModal();
  renderItems();
});

// ========== GLOBAL LISTENERS ==========

addBtn.addEventListener("click", openItemModal);
closeForm.addEventListener("click", closeItemModal);
closeReply.addEventListener("click", closeReplyModal);

overlay.addEventListener("click", () => {
  if (!formModal.classList.contains("hidden")) closeItemModal();
  if (!replyModal.classList.contains("hidden")) closeReplyModal();
});

searchInput.addEventListener("input", renderItems);
filterType.addEventListener("change", renderItems);

// ========== INIT ==========

loadItems();
// Render happens after login (setRole), so items are ready in memory.