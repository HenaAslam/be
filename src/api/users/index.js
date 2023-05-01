import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import passport from "passport";
import { JWTAuthMiddleware } from "../../lib/auth/jwt.js";
import { createAccessToken } from "../../lib/auth/tools.js";

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// import { JwtPayload } from "jsonwebtoken";

const userRouter = express.Router();

userRouter.get(
  "/googleLogin",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
  })
);

userRouter.get(
  "/googleRedirect",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    try {
      res.redirect(
        `${process.env.FE_DEV_URL}/main?accessToken=${req.user?.accessToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);

userRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    const payload = { _id: _id };
    const accessToken = await createAccessToken(payload);
    res.status(201).send({ user: newUser, accessToken: accessToken });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id };
      const accessToken = await createAccessToken(payload);
      res.send({ user: user, accessToken: accessToken });
    } else {
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

userRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userList = await UsersModel.find();
    res.send(userList);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user?._id);

    if (user) {
      res.send(user);
    } else {
      res.send(
        createHttpError(404, "Couldn't find User with id: " + req.user?._id)
      );
    }
  } catch (error) {
    next(error);
  }
});

userRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.user?._id,
      req.body,
      { new: true, runValidators: true }
    );
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);

    if (user) {
      res.send(user);
    } else {
      res.send(
        createHttpError(404, "Couldn't find User with id: " + req.params.userId)
      );
    }
  } catch (error) {
    next(error);
  }
});

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "sprintify/userImg",
    },
  }),
}).single("avatar");

userRouter.put("/image/:userId", cloudinaryUploader, async (req, res, next) => {
  try {
    if (req.file) {
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        { avatar: req.file.path },
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        res.status(404).send("User with that id doesn't exist");
      }
    } else {
      res.status(400).send("No file uploaded");
    }
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await UsersModel.findOneAndDelete(req.user._id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default userRouter;
