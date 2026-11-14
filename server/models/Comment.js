import mongoose from "mongoose";
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: "Comment", default: null }, // threaded reply
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);