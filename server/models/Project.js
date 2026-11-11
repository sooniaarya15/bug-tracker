import mongoose from "mongoose";
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["admin", "manager", "developer", "viewer"], default: "developer" },
      },
    ],
  },
  { timestamps: true }
);

// user ka role return karta hai (member nahi hai to null)
projectSchema.methods.roleOf = function (userId) {
  const m = this.members.find((m) => String(m.user?._id ?? m.user) === String(userId));
  return m ? m.role : null;
};

export default mongoose.model("Project", projectSchema);