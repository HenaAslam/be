import { Schema, model } from "mongoose";
const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const boardSchema = new Schema(
  {
    username: { type: String, required: true },
    description: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [memberSchema],
  },
  { timestamps: true }
);

export default model("Board", boardSchema);
