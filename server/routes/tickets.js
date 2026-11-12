import { Router } from "express";
import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

const POP = [
  { path: "assignee", select: "name email" },
  { path: "reporter", select: "name email" },
];
const STATUSES = ["todo", "in-progress", "done"];

async function access(projectId, userId) {
  const project = await Project.findById(projectId);
  return { project, role: project ? project.roleOf(userId) : null };
}
const canWrite = (role) => role && role !== "viewer";

// LIST (by project)
router.get("/", async (req, res) => {
  const { project } = req.query;
  const { role } = await access(project, req.user._id);
  if (!role) return res.status(403).json({ message: "Not a project member" });
  const tickets = await Ticket.find({ project }).populate(POP).sort({ order: 1, createdAt: 1 });
  res.json(tickets);
});

// CREATE
router.post("/", async (req, res) => {
  const { title, description, type, priority, assignee, project } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
  const { project: p, role } = await access(project, req.user._id);
  if (!canWrite(role)) return res.status(403).json({ message: "You cannot create tickets here" });
  if (assignee && p.roleOf(assignee) === null)
    return res.status(400).json({ message: "Assignee must be a project member" });

  const t = await Ticket.create({
    title, description, type, priority,
    assignee: assignee || null,
    project,
    reporter: req.user._id,
  });
  res.status(201).json(await t.populate(POP));
});

// REORDER / MOVE (kanban drag-drop). /:id se pehle rakha hai
router.patch("/reorder", async (req, res) => {
  const { projectId, items } = req.body;
  const { role } = await access(projectId, req.user._id);
  if (!canWrite(role)) return res.status(403).json({ message: "Not allowed" });
  if (!Array.isArray(items) || items.some((i) => !STATUSES.includes(i.status)))
    return res.status(400).json({ message: "Invalid items" });

  await Ticket.bulkWrite(
    items.map((i) => ({
      updateOne: { filter: { _id: i._id, project: projectId }, update: { status: i.status, order: i.order } },
    }))
  );
  res.json({ ok: true });
});

// GET ONE
router.get("/:id", async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate(POP);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  const { role } = await access(ticket.project, req.user._id);
  if (!role) return res.status(403).json({ message: "Not a project member" });
  res.json(ticket);
});

// UPDATE (edit / assign / status)
router.put("/:id", async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  const { project, role } = await access(ticket.project, req.user._id);
  if (!canWrite(role)) return res.status(403).json({ message: "You cannot edit tickets" });

  for (const k of ["title", "description", "type", "priority", "status"]) {
    if (req.body[k] !== undefined) ticket[k] = req.body[k];
  }
  if (req.body.assignee !== undefined) {
    if (req.body.assignee && project.roleOf(req.body.assignee) === null)
      return res.status(400).json({ message: "Assignee must be a project member" });
    ticket.assignee = req.body.assignee || null;
  }
  await ticket.save();
  res.json(await ticket.populate(POP));
});

// DELETE (reporter ya project admin)
router.delete("/:id", async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  const { role } = await access(ticket.project, req.user._id);
  const allowed = role === "admin" || String(ticket.reporter) === String(req.user._id);
  if (!allowed) return res.status(403).json({ message: "Only the reporter or an admin can delete" });
  await ticket.deleteOne();
  res.json({ message: "Ticket deleted" });
});

export default router;