import { Router } from "express";
import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

async function ticketAccess(ticketId, userId) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return {};
  const project = await Project.findById(ticket.project);
  return { ticket, role: project?.roleOf(userId) };
}

// replies samet saare descendants ke ids
async function collect(id) {
  const kids = await Comment.find({ parent: id }).distinct("_id");
  let all = [id];
  for (const k of kids) all = all.concat(await collect(k));
  return all;
}

router.get("/", async (req, res) => {
  const { ticket, role } = await ticketAccess(req.query.ticket, req.user._id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  if (!role) return res.status(403).json({ message: "Not a project member" });
  const comments = await Comment.find({ ticket: ticket._id }).populate("author", "name").sort({ createdAt: 1 });
  res.json(comments);
});

router.post("/", async (req, res) => {
  const { ticket: ticketId, text, parent } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: "Comment cannot be empty" });
  const { ticket, role } = await ticketAccess(ticketId, req.user._id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  if (!role) return res.status(403).json({ message: "Not a project member" });
  if (parent) {
    const p = await Comment.findById(parent);
    if (!p || String(p.ticket) !== String(ticket._id))
      return res.status(400).json({ message: "Invalid parent comment" });
  }
  const c = await Comment.create({ ticket: ticket._id, author: req.user._id, text, parent: parent || null });
  res.status(201).json(await c.populate("author", "name"));
});

router.delete("/:id", async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Comment not found" });
  const { role } = await ticketAccess(c.ticket, req.user._id);
  if (!(role === "admin" || String(c.author) === String(req.user._id)))
    return res.status(403).json({ message: "Not allowed" });
  await Comment.deleteMany({ _id: { $in: await collect(c._id) } });
  res.json({ message: "Deleted" });
});

export default router;