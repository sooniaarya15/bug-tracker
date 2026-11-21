import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email });

const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const name = String(req.body.name || "").trim().replace(/\s+/g, " ");

  if (!name || !email?.trim() || !password)
    return res.status(400).json({ message: "Name, email and password are required" });

  if (name.length < 2 || name.length > 50)
    return res.status(400).json({ message: "Name must be 2 to 50 characters" });

  if (!NAME_REGEX.test(name))
    return res.status(400).json({ message: "Name can only contain letters and spaces (no numbers or symbols)" });

  const cleanEmail = email.toLowerCase().trim();
  if (!EMAIL_REGEX.test(cleanEmail))
    return res.status(400).json({ message: "Enter a valid email address" });

  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

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