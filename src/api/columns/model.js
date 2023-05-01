const columnSchema = new Schema(
  {
    name: { type: String, required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);
export default model("Column", columnSchema);
