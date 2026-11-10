import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email });

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password)
    return res.status(400).json({ message: "Name, email and password are required" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

  const cleanEmail = email.toLowerCase().trim();
  if (await User.findOne({ email: cleanEmail }))
    return res.status(400).json({ message: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: cleanEmail, password: hash });
  res.status(201).json({ token: sign(user._id), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase().trim() }).select("+password");
  if (!user || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ message: "Invalid email or password" });
  res.json({ token: sign(user._id), user: publicUser(user) });
});

router.get("/me", auth, (req, res) => res.json(publicUser(req.user)));

export default router;