require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ================= MONGODB =================
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
.catch(err => console.log("MongoDB error:", err));

// ================= MODELS =================

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const User = mongoose.model("User", userSchema);

// Task schema
const taskSchema = new mongoose.Schema({
    text: String,
    completed: { type: Boolean, default: false },
    userId: String
});
const Task = mongoose.model("Task", taskSchema);

// ================= ROUTES =================

// Register OR auto-login if exists
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.json({ message: "Email and password required" });
    }

    const existing = await User.findOne({ email });

    // User already exists
    if (existing) {
        if (!existing.password) {
            return res.json({ message: "User exists but password missing" });
        }

        const match = await bcrypt.compare(password, existing.password);
        if (match) {
            return res.json({
                message: "Login successful",
                userId: existing._id
            });
        } else {
            return res.json({
                message: "User already exists. Wrong password."
            });
        }
    }

    // New user
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    res.json({
        message: "Registered successfully",
        userId: user._id
    });
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "User not found" });

    if (!user.password) {
        return res.json({ message: "Password missing. Re-register." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: "Wrong password" });

    res.json({
        message: "Login successful",
        userId: user._id
    });
});

// Add task
app.post("/tasks", async (req, res) => {
    const { text, userId } = req.body;
    const task = new Task({ text, userId });
    await task.save();
    res.json(task);
});

// Get tasks
app.get("/tasks/:userId", async (req, res) => {
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
});

// Delete task
app.delete("/tasks/:id", async (req, res) => {
  const { userId } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.userId !== userId) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// Update task (toggle completed or edit text)
app.put("/tasks/:id", async (req, res) => {
  const { text, completed, userId } = req.body;

  // 🔐 Ownership check (Feature 3 also starts here)
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (task.userId !== userId) {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (text !== undefined) task.text = text;
  if (completed !== undefined) task.completed = completed;

  await task.save();
  res.json(task);
});

app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("name"); // ✅ correct field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ name: user.name }); // ✅ send name
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

