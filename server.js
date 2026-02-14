require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const auth = require("./middleware/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ================= MONGODB =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log("MongoDB error:", err));

// ================= MODELS =================

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

// Task schema
const taskSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false },
  userId: String,
});
const Task = mongoose.model("Task", taskSchema);

// ================= ROUTES =================

// Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.json({ message: "Email and password required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();

  res.json({ message: "Registered successfully" });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({
    message: "Login successful",
    token,
    userId: user._id,
    name: user.name,
  });
});


// Get tasks
app.get("/tasks", auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.userId });
  res.json(tasks);
});

// Add task
app.post("/tasks", auth, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Task text required" });
  }

  const task = new Task({
    text,
    userId: req.user.userId,
  });

  await task.save();
  res.json(task);
});

// Update task
app.put("/tasks/:id", auth, async (req, res) => {
  const { text, completed } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.userId !== req.user.userId) {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (text !== undefined) task.text = text;
  if (completed !== undefined) task.completed = completed;

  await task.save();
  res.json(task);
});

// Delete task
app.delete("/tasks/:id", auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.userId !== req.user.userId) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
