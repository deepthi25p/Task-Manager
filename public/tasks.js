const API = "https://task-manager-tpnf.onrender.com";

if (!localStorage.getItem("token")) {
  window.location.href = "index.html";
}

const userName = localStorage.getItem("name");

if (userName && userName !== "undefined") {
  document.getElementById("greeting").innerText = `Hello, ${userName} 👋`;
} else {
  document.getElementById("greeting").innerText = "Hello 👋";
}


function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  };
}


window.onload = () => {
  loadTasks();
};

// ================= LOAD TASKS =================
async function loadTasks() {
  const res = await fetch(API + "/tasks", {
  headers: authHeaders()
});


  if (res.status === 401) {
    logout();
    return;
  }

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

  if (!taskText) return;

  const res = await fetch(API + "/tasks", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ text: taskText })
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
      <button onclick="deleteTask('${task._id}', this)">🗑️</button>
    </div>
  `;

  document.getElementById("taskList").appendChild(li);
}

// ================= DELETE TASK =================
async function deleteTask(taskId, btn) {
  const res = await fetch(API + "/tasks/" + taskId, {
    method: "DELETE",
    headers: authHeaders()
  });

  const data = await res.json();

  if (data.message === "Deleted") {
    const li = btn.closest("li");
    li.remove(); 
  } else {
    alert("Failed to delete task");
  }
}

async function toggleComplete(taskId, currentStatus) {
  await fetch(API + "/tasks/" + taskId, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ completed: !currentStatus })
  });

  loadTasks(); // refresh list
}

// ================= EDIT =================
function startEdit(btn) {
  const li = btn.closest("li");
  li.querySelector(".task-text").style.display = "none";
  li.querySelector(".edit-input").style.display = "inline-block";
}

async function saveEdit(btn, taskId) {
  const li = btn.closest("li");
  const input = li.querySelector(".edit-input");
  const newText = input.value.trim();

  if (!newText) return;

  await fetch(API + "/tasks/" + taskId, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ text: newText })
  });

  li.querySelector(".task-text").innerText = newText;
  li.querySelector(".task-text").style.display = "inline";
  input.style.display = "none";
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  window.location.href = "index.html";
}
