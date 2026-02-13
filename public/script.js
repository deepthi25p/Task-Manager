const API = "http://localhost:5000";

// ================= REGISTER =================
async function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const res = await fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.userId) {
        localStorage.setItem("userId", data.userId);
        window.location.href = "tasks.html";
    } else {
        document.getElementById("message").innerText = data.message;
    }
}

// ================= LOGIN =================
async function login() {
    const email = document.getElementById("logEmail").value;
    const password = document.getElementById("logPassword").value;

    const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.userId) {
        localStorage.setItem("userId", data.userId);
        window.location.href = "tasks.html";
    } else {
        document.getElementById("message").innerText = data.message;
    }
}

// ================= TASK PAGE =================
if (window.location.pathname.includes("tasks.html")) {
    const userId = localStorage.getItem("userId");
    if (!userId) window.location.href = "index.html";
    loadTasks();
}


