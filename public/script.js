const API = "https://task-manager-tpnf.onrender.com";

// ================= LOGIN =================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  try {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);

    if (!res.ok) {
      alert(data.message || "Login failed ❌");
      return;
    }

    if (!data.token) {
      alert("No token received from server!");
      return;
    }
    // Only set name if backend sends it
if (data.name) {
  localStorage.setItem("name", data.name);
}

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("name", data.name);

    alert("Login successful ✅");

    window.location.href = "tasks.html";

  } catch (err) {
    console.error("Login error:", err);
    alert("Server error ❌");
  }
}


// ================= REGISTER =================

async function register() {
  const userNameFromInput = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  if (!userNameFromInput || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(API + "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: userNameFromInput, email, password })
    });

    const data = await res.json();
    console.log("Register response:", data);

    if (!res.ok) {
      alert(data.message || "Registration failed ❌");
      return;
    }

    if (!data.token) {
      alert("No token received from server!");
      return;
    }

    // ✅ Save auth + name
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("name", data.user.name);

    alert("Registered & logged in ✅");
    window.location.href = "tasks.html";

  } catch (err) {
    console.error("Register error:", err);
    alert("Server error ❌");
  }
}

