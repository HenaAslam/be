import express from "express";
import createHttpError from "http-errors";
import BoardsModel from "./model.js";
import UsersModel from "../users/model.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwt.js";

const BoardRouter = express.Router();

BoardRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user?._id);

    if (user) {
      const { boardname, description } = req.body;
      const creator = req.user._id;

      const board = new BoardsModel({
        boardname,
        description,
        creator,
      });

      await board.save();

      res.status(201).send({ board });
    } else {
      res.send(
        createHttpError(404, "Couldn't find User with id: " + req.user?._id)
      );
    }
  } catch (error) {
    next(error);
  }
});

BoardRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user?._id);

    if (user) {
      const boards = await BoardsModel.find({ creator: req.user._id });

      res.status(200).send({ boards });
    } else {
      res.send(
        createHttpError(404, "Couldn't find User with id: " + req.user?._id)
      );
    }
  } catch (error) {
    next(error);
  }
});

BoardRouter.get("/:boardId", async (req, res, next) => {
  try {
    const board = await BoardsModel.findById(req.params.boardId).populate({
      path: "columns.tasks",
      select: "title assignedTo dueDate description",
    });
    res.send(board);
  } catch (err) {
    next(err);
  }
});

BoardRouter.post("/:boardId/columns", async (req, res, next) => {
  try {
    const board = await BoardsModel.findById(req.params.boardId);
    if (!board) {
      return res.status(404).send("Board not found");
    }
    const newColumn = {
      name: req.body.name,
      tasks: [],
    };
    board.columns.push(newColumn);
    await board.save();
    res.json(newColumn);
  } catch (err) {
    next(err);
  }
});

BoardRouter.patch(
  "/:boardId/columns/:columnId/move",
  async (req, res, next) => {
    try {
      const { boardId, columnId } = req.params;
      const { destinationIndex } = req.body;

      const board = await BoardsModel.findById(boardId);
      if (!board) {
        return res.status(404).send("Board not found");
      }

      const columnToMove = board.columns.find(
        (column) => column._id.toString() === columnId
      );
      if (!columnToMove) {
        return res.status(404).send("Column not found");
      }

      const currentIndex = board.columns.indexOf(columnToMove);
      board.columns.splice(currentIndex, 1);
      board.columns.splice(destinationIndex, 0, columnToMove);

      await board.save();
      res.json(board);
    } catch (err) {
      next(err);
    }
  }
);

export default BoardRouter;

//fetch board again when task is added and render it.
