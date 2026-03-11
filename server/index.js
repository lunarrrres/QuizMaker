const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const users = [
  { email: "test@example.com", password: "123456", token: "fake-jwt-token" },
];

app.post("/api/auth/signin", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json({
    username: user.username,
    email: user.email,
    token: user.token,
  });
});

app.post("/api/auth/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const token = "fake-jwt-token-" + Date.now();

  users.push({
    username,
    email,
    password,
    token,
  });

  res.json({ username, email, token });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
