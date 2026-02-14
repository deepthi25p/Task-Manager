const API = "https://task-manager-tpnf.onrender.com";

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  message.className="success";
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
    console.log("Login response:", data); 

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("name", data.name);


    window.location.href = "tasks.html";

  } catch (err) {
    console.error("Login error:", err);
    alert("Server error");
  }
}
async function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(API + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registered successfully ✅");

      // 👉 Redirect to login or tasks page
      window.location.href = "tasks.html";  
      // or: window.location.href = "login.html";
    } else {
      alert(data.message || "Registration failed ❌");
    }
  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
}

