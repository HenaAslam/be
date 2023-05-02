import { Schema, model } from "mongoose";
const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
const columnSchema = new Schema({
  name: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
});

const boardSchema = new Schema(
  {
    boardname: { type: String, required: true },
    description: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [memberSchema],
    columns: [columnSchema],
  },
  { timestamps: true }
);

export default model("Board", boardSchema);
