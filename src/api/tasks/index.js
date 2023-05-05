import express from "express";
import BoardsModel from "../boards/model.js";
import TaskModel from "./model.js";

const taskRouter = express.Router();

taskRouter.post("/:boardId/columns/:columnId/tasks", async (req, res, next) => {
  try {
    const board = await BoardsModel.findById(req.params.boardId);
    if (!board) {
      return res.status(404).send("Board not found");
    }
    const column = board.columns.find(
      (column) => column._id.toString() === req.params.columnId
    );
    if (!column) {
      return res.status(404).send("Column not found");
    }
    const newTask = {
      title: req.body.title,
      description: req.body.description,
      assignedTo: req.body.assignedTo,
      dueDate: req.body.dueDate,
    };
    const task = await TaskModel.create(newTask);
    column.tasks.push(task);
    await board.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
});

export default taskRouter;
