import { Router } from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import Ticket from "../models/Ticket.js";

const router = Router();
router.use(auth);

const POP = { path: "members.user", select: "name email" };
const ROLES = ["admin", "manager", "developer", "viewer"];

// project load + permission check. Fail hone par response bhej deta hai aur null return karta hai
async function loadProject(req, res, adminOnly = false) {
  const project = await Project.findById(req.params.id).populate(POP);
  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return null;
  }
  const role = project.roleOf(req.user._id);
  if (!role || (adminOnly && role !== "admin")) {
    res.status(403).json({ message: adminOnly ? "Admin only" : "Not a project member" });
    return null;
  }
  return project;
}

const fresh = (id) => Project.findById(id).populate(POP);

// list (jin projects ka user member hai)
router.get("/", async (req, res) => {
  const projects = await Project.find({ "members.user": req.user._id }).populate(POP).sort({ createdAt: -1 });
  res.json(projects);
});

// create
router.post("/", async (req, res) => {
  const { title, description } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
  const p = await Project.create({
    title,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: "admin" }],
  });
  res.status(201).json(await fresh(p._id));
});

// single
router.get("/:id", async (req, res) => {
  const project = await loadProject(req, res);
  if (project) res.json(project);
});

// update (admin)
router.put("/:id", async (req, res) => {
  const project = await loadProject(req, res, true);
  if (!project) return;
  if (req.body.title !== undefined) project.title = req.body.title;
  if (req.body.description !== undefined) project.description = req.body.description;
  await project.save();
  res.json(await fresh(project._id));
});

// delete (admin)
router.delete("/:id", async (req, res) => {
  const project = await loadProject(req, res, true);
  if (!project) return;
  await Ticket.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: "Project deleted" });
});

// add member by email (admin)
router.post("/:id/members", async (req, res) => {
  const project = await loadProject(req, res, true);
  if (!project) return;
  const { email, role = "developer" } = req.body;
  if (!ROLES.includes(role)) return res.status(400).json({ message: "Invalid role" });
  const user = await User.findOne({ email: String(email || "").toLowerCase().trim() });
  if (!user) return res.status(404).json({ message: "No user with this email. Ask them to register first." });
  if (project.roleOf(user._id)) return res.status(400).json({ message: "Already a member" });
  await Project.updateOne({ _id: project._id }, { $push: { members: { user: user._id, role } } });
  res.json(await fresh(project._id));
});

// remove member (admin)
router.delete("/:id/members/:userId", async (req, res) => {
  const project = await loadProject(req, res, true);
  if (!project) return;
  if (String(project.owner) === req.params.userId)
    return res.status(400).json({ message: "Cannot remove the project owner" });
  await Project.updateOne({ _id: project._id }, { $pull: { members: { user: req.params.userId } } });
  res.json(await fresh(project._id));
});

export default router;