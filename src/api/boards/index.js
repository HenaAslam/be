import express from "express";
import createHttpError from "http-errors";
import BoardsModel from "./model.js";
import UsersModel from "../users/model.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwt.js";

const BoardRouter = express();

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

export default BoardRouter;
