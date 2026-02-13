const API = "http://localhost:5000";

async function loadUser() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    // Not logged in → go back to login
    window.location.href = "index.html";
    return;
  }

  const res = await fetch(API + "/users/" + userId);
  const data = await res.json();

  if (data.name) {
    document.getElementById("greeting").innerText = `Hello, ${data.name} 👋`;
  } else {
    document.getElementById("greeting").innerText = "Hello 👋";
  }

}
window.onload = () => {
  loadUser();
  loadTasks();
};


// ================= LOAD TASKS =================
async function loadTasks() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch(API + "/tasks/" + userId);
  const tasks = await res.json();

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    renderTask(task);
  });
}

// ================= ADD TASK =================
async function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();
  const userId = localStorage.getItem("userId");

  if (!taskText) return;

  const res = await fetch(API + "/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: taskText, userId })
  });

  const task = await res.json();

  renderTask(task);
  input.value = "";
}

// ================= RENDER TASK =================
function renderTask(task) {
  const li = document.createElement("li");
  li.dataset.id = task._id;

  li.innerHTML = `
    <span class="task-text" style="text-decoration:${task.completed ? "line-through" : "none"}">
      ${task.text}
    </span>
    <input class="edit-input" style="display:none" value="${task.text}" />
    <div>
      <button onclick="toggleComplete('${task._id}', ${task.completed})">
        ${task.completed ? "Undo" : "Done"}
      </button>
      <button onclick="startEdit(this)">✏️</button>
      <button onclick="saveEdit(this, '${task._id}')">💾</button>
      <button onclick="deleteTask('${task._id}', this)">✖</button>
    </div>
  `;

  document.getElementById("taskList").appendChild(li);
}

// ================= DELETE TASK =================
async function deleteTask(taskId, btn) {
  const userId = localStorage.getItem("userId");

  const res = await fetch(API + "/tasks/" + taskId, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();

  if (data.message === "Deleted") {
    // Remove from UI immediately
    const li = btn.closest("li");
    li.remove();
  } else {
    alert("Failed to delete task");
  }
}


// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("userId");
  window.location.href = "index.html";
}

async function toggleComplete(taskId, currentStatus) {
  const userId = localStorage.getItem("userId");

  await fetch(API + "/tasks/" + taskId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: !currentStatus, userId })
  });

  loadTasks(); // reload list from DB
}

async function editTask(taskId, oldText) {
  const newText = prompt("Edit task:", oldText);
  if (!newText) return;

  const userId = localStorage.getItem("userId");

  await fetch(API + "/tasks/" + taskId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: newText, userId })
  });

  loadTasks(); // refresh list
}


function startEdit(btn) {
  const li = btn.closest("li");
  li.querySelector(".task-text").style.display = "none";
  li.querySelector(".edit-input").style.display = "inline-block";
}

async function saveEdit(btn, taskId) {
  const li = btn.closest("li");
  const input = li.querySelector(".edit-input");
  const newText = input.value.trim();
  const userId = localStorage.getItem("userId");

  if (!newText) return;

  await fetch(API + "/tasks/" + taskId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: newText, userId })
  });

  // Update UI immediately
  li.querySelector(".task-text").innerText = newText;
  li.querySelector(".task-text").style.display = "inline";
  input.style.display = "none";
}
