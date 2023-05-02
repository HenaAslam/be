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
      const { boardname, description, members } = req.body;
      const creator = req.user._id;

      // Make sure the current user is a member of the board
      if (!members.includes(creator)) {
        return res
          .status(403)
          .send({ error: "You must be a member of the board to create it" });
      }

      const board = new BoardsModel({
        boardname,
        description,
        creator,
        members,
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

export default BoardRouter;
