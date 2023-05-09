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
      columnId: req.params.columnId,
      position: column.tasks.length,
    };
    const task = await TaskModel.create(newTask);
    column.tasks.push(task);
    await board.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
});

taskRouter.put(
  "/:boardId/columns/:columnId/tasks/:taskId",
  async (req, res, next) => {
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
      const task = await TaskModel.findById(req.params.taskId);
      if (!task) {
        return res.status(404).send("Task not found");
      }
      task.title = req.body.title;
      task.description = req.body.description;
      task.assignedTo = req.body.assignedTo;
      task.dueDate = req.body.dueDate;
      (task.position = column.tasks.length), await task.save();
      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);

taskRouter.delete(
  "/:boardId/columns/:columnId/tasks/:taskId",
  async (req, res, next) => {
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
      const task = await TaskModel.findByIdAndDelete(req.params.taskId);
      if (!task) {
        return res.status(404).send("Task not found");
      }
      column.tasks.pull(task._id);
      await board.save();
      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);
taskRouter.get("/:boardId/columns/:columnId/tasks", async (req, res, next) => {
  try {
    const board = await BoardsModel.findById(req.params.boardId).populate({
      path: "columns.tasks",
      model: "Task",
    });
    if (!board) {
      return res.status(404).send("Board not found");
    }
    const column = board.columns.find(
      (column) => column._id.toString() === req.params.columnId
    );
    if (!column) {
      return res.status(404).send("Column not found");
    }
    res.json(column.tasks);
  } catch (err) {
    next(err);
  }
});

//moving tasks
taskRouter.put(
  "/:boardId/columns/:currentColumnId/tasks/:taskId",
  async (req, res, next) => {
    try {
      const board = await BoardsModel.findById(req.params.boardId);
      if (!board) {
        return res.status(404).send("Board not found");
      }

      const currentColumn = board.columns.find(
        (column) => column._id.toString() === req.params.currentColumnId
      );
      if (!currentColumn) {
        return res.status(404).send("Column not found");
      }

      const taskIndex = currentColumn.tasks.findIndex(
        (task) => task._id.toString() === req.params.taskId
      );
      if (taskIndex === -1) {
        return res.status(404).send("Task not found");
      }

      const { newColumnId, newPosition } = req.body;

      let newColumn = currentColumn;
      if (newColumnId !== req.params.currentColumnId) {
        newColumn = board.columns.find(
          (column) => column._id.toString() === newColumnId
        );
        if (!newColumn) {
          return res.status(404).send("New column not found");
        }
      }

      if (newPosition >= newColumn.tasks.length) {
        newColumn.tasks.push(currentColumn.tasks.splice(taskIndex, 1)[0]);
      } else {
        newColumn.tasks.splice(
          newPosition,
          0,
          currentColumn.tasks.splice(taskIndex, 1)[0]
        );
      }

      await board.save();
      res.send("Task moved successfully");
    } catch (err) {
      next(err);
    }
  }
);

export default taskRouter;
