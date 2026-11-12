import mongoose from "mongoose";
const { Schema } = mongoose;

const ticketSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    type: { type: String, enum: ["bug", "feature", "task"], default: "bug" },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    assignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    order: { type: Number, default: () => Date.now() }, // kanban column mein position
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);