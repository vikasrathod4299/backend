import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import jwt from "jsonwebtoken";
import { refreshAccessToken } from "../controllers/auth.controller";
import { findUserByData } from "../services/users.service";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new ApiError(403, "Access token is missing!");
    }
    const accessSecrete: string | undefined = process.env.JWT_SECRET;
    if (!accessSecrete) {
      throw new ApiError(403, "Unauthorized!");
    }

    jwt.verify(token, accessSecrete, async (err: any, user: any) => {
      try {
        if (err) {
          console.error("Access token is expired or invalid");
          const newToken = await refreshAccessToken(req, res, next);

          if (!newToken) {
            throw new ApiError(403, "Unauthorized!");
          }

          res.cookie("accessToken", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });

          console.warn("Access token refreshed successfully");
          req.cookies.accessToken = newToken;
          return verifyToken(req, res, next);
        }

        let userData = await findUserByData({email:user.email,isDeleted:false})

        if (!userData) {
          throw new ApiError(403, "Unauthorized!");
        }
        //@ts-ignore
        req.user = userData;
        next();
        return;
      } catch (e) {
        next(e);
        return;
      }
    });
  } catch (error) {
    next(error);
    return;
  }
};
