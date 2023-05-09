import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date },
    columnId: { type: String, required: true },
    position: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model("Task", taskSchema);
