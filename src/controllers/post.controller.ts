import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import {
  createPost,
  findAllPosts,
  findPostByData,
  updatePostData,
  findPostById,
} from "../services/posts.service";
import { userRoles } from "../utils/constant";

//Get all posts
export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.query;

    const whereClause: any = {};
    if (userId) {
      whereClause.createdBy = userId;
    }
    whereClause.isDeleted = false;
    const posts = await findAllPosts(whereClause);
    res.status(200).json({
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

//Get single post by given post Id
export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    let findRecord = await findPostByData({ id: id });
    res.status(200).json({ data: findRecord, message: "Data fetched successfully" });
  } catch (error) {
    next(error);
  }
};

//Create new post
export const createNewPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req?.user?.role !== userRoles.ADMIN)
      throw new ApiError(403, "Only admin can create post");

    let newPost = req.body;
    newPost.createdBy = req?.user?.id;

    let createNew = await createPost(newPost);
    res.status(201).json({ data: createNew, message: "Post created successfully" });
  } catch (error) {
    next(error);
  }
};

//Delete post by Id
export const deletePostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    let findPost = await findPostByData({ id: Number(id), isDeleted: false });

    if (!findPost) {
      throw new ApiError(404, "Post not found");
    }
    await updatePostData({ isDeleted: true }, { id: findPost.id });
    res.status(200).json({ message: "Post deleted successfully" });
    return;
  } catch (error) {
    next(error);
  }
};

//Update post
export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let requestData = req.body;

    let findPost = await findPostById(requestData.id);
    if (!findPost) {
      throw new ApiError(404, "Post record not found");
    }

    let obj = {
      description: requestData.description || findPost.description,
      title: requestData.title || findPost.title,
    };

    await updatePostData(obj, { id: findPost.id })
    res.status(200).json({ message: "Post updated successfully" });
  } catch (error) { next() }
};
