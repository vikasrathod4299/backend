import { Router } from "express";
import {
    createNewPost,
    deletePostById,
    getPostById,
    getAllPosts,
    updatePost
} from "../controllers/post.controller";
import { verifyToken } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createPostSchema, getPostSchema, updatePostSchema } from "../schemas/postSchema";
const postRoutes = Router();

//GET routes
postRoutes.get("/", verifyToken, getAllPosts);
postRoutes.get("/:id", verifyToken, validate(getPostSchema), getPostById);

//POST routes
postRoutes.post("/", verifyToken, validate(createPostSchema), createNewPost);

//PUT routes
postRoutes.put("/", verifyToken, validate(updatePostSchema), updatePost)

//DELETE routes
postRoutes.delete("/:id", verifyToken, validate(getPostSchema), deletePostById);

export default postRoutes;
