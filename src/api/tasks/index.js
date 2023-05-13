import express from "express";
import BoardsModel from "../boards/model.js";
import TaskModel from "./model.js";

const taskRouter = express.Router();

// add JWTAuthMiddleware for fetches.

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
      console.log("grrrr");
      const updatedTask = await TaskModel.findByIdAndUpdate(
        req.params.taskId,
        {
          title: req.body.title,
          description: req.body.description,
          assignedTo: req.body.assignedTo,
          dueDate: req.body.dueDate,
          columnId: req.body.columnId || req.params.columnId,
          position:
            req.body.position || req.body.position === 0
              ? req.body.position
              : undefined,
        },
        { new: true, runValidators: true }
      );
      if (updatedTask) {
        const board = await BoardsModel.findOne({
          "columns.tasks": req.params.taskId,
        });
        if (!board) {
          return res.status(404).send("Board not found");
        }

        const column = board.columns.find((column) =>
          column.tasks.includes(req.params.taskId)
        );
        if (!column) {
          return res.status(404).send("Column not found");
        }
        const taskIndex = column.tasks.findIndex(
          (taskId) => taskId.toString() === req.params.taskId
        );

        if (taskIndex === -1) {
          return res.status(404).send("Task not found");
        }
        // const updatedColumn = { ...column };
        // console.log("updd", updatedColumn);
        // updatedColumn.tasks.splice(taskIndex, 1, updatedTask._id);
        column.tasks.splice(taskIndex, 1, updatedTask._id);
        const updatedBoard = await BoardsModel.findOneAndUpdate(
          { "columns._id": column._id },
          { $set: { "columns.$": column } },
          { new: true }
        );
        res.json(updatedTask);
      } else {
        console.log("hi");
        next(
          createHttpError(404, `Task with id ${req.params.taskId} not found`)
        );
      }
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

taskRouter.put(
  "/:boardId/columns/:columnId/tasks/:taskId/left",
  async (req, res, next) => {
    try {
      const { boardId, columnId, taskId } = req.params;
      const board = await BoardsModel.findById(boardId);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      const currentColumnIndex = board.columns.findIndex(
        (column) => column._id.toString() === columnId
      );
      const taskIndex = board.columns[currentColumnIndex].tasks.findIndex(
        (task) => task._id.toString() === taskId
      );
      const task = board.columns[currentColumnIndex].tasks[taskIndex];

      if (currentColumnIndex === 0) {
        return res
          .status(400)
          .json({ message: "Task is already in the leftmost column" });
      }

      board.columns[currentColumnIndex].tasks.splice(taskIndex, 1);
      board.columns[currentColumnIndex - 1].tasks.push(task);

      await board.save();

      res.json(board);
    } catch (error) {
      next(error);
    }
  }
);

taskRouter.put(
  "/:boardId/columns/:columnId/tasks/:taskId/right",
  async (req, res, next) => {
    try {
      const { boardId, columnId, taskId } = req.params;
      const board = await BoardsModel.findById(boardId);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      const currentColumnIndex = board.columns.findIndex(
        (column) => column._id.toString() === columnId
      );
      const taskIndex = board.columns[currentColumnIndex].tasks.findIndex(
        (task) => task._id.toString() === taskId
      );
      const task = board.columns[currentColumnIndex].tasks[taskIndex];

      if (currentColumnIndex === board.columns.length - 1) {
        return res
          .status(400)
          .json({ message: "Task is already in the rightmost column" });
      }

      board.columns[currentColumnIndex].tasks.splice(taskIndex, 1);
      board.columns[currentColumnIndex + 1].tasks.push(task);

      await board.save();

      res.json(board);
    } catch (error) {
      next(error);
    }
  }
);

taskRouter.put(
  "/:boardId/columns/:columnId/tasks/:taskId/top",
  async (req, res, next) => {
    try {
      const { boardId, columnId, taskId } = req.params;
      const board = await BoardsModel.findById(boardId);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      const currentColumnIndex = board.columns.findIndex(
        (column) => column._id.toString() === columnId
      );
      const taskIndex = board.columns[currentColumnIndex].tasks.findIndex(
        (task) => task._id.toString() === taskId
      );
      const task = board.columns[currentColumnIndex].tasks[taskIndex];

      if (taskIndex === 0) {
        return res
          .status(400)
          .json({ message: "Task is already at the top of the column" });
      }

      board.columns[currentColumnIndex].tasks.splice(taskIndex, 1);
      board.columns[currentColumnIndex].tasks.splice(taskIndex - 1, 0, task);

      await board.save();

      res.json(board);
    } catch (error) {
      next(error);
    }
  }
);

taskRouter.put(
  "/:boardId/columns/:columnId/tasks/:taskId/down",
  async (req, res, next) => {
    try {
      const { boardId, columnId, taskId } = req.params;
      const board = await BoardsModel.findById(boardId);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      const currentColumnIndex = board.columns.findIndex(
        (column) => column._id.toString() === columnId
      );
      const taskIndex = board.columns[currentColumnIndex].tasks.findIndex(
        (task) => task._id.toString() === taskId
      );
      const task = board.columns[currentColumnIndex].tasks[taskIndex];

      if (taskIndex === board.columns[currentColumnIndex].tasks.length - 1) {
        return res
          .status(400)
          .json({ message: "Task is already at the bottom of the column" });
      }

      board.columns[currentColumnIndex].tasks.splice(taskIndex, 1);
      board.columns[currentColumnIndex].tasks.splice(taskIndex + 1, 0, task);

      await board.save();

      res.json(board);
    } catch (error) {
      next(error);
    }
  }
);

export default taskRouter;
