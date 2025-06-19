import { z } from "zod";

const bodyCreatePostSchema = z.object({
    description: z
        .string({ required_error: "Description is required" })
        .min(10, { message: "Description must be at least 10 characters" })
        .max(500, { message: "Description must not exceed 500 characters" }),
    title: z
        .string({ required_error: "title is required" })
        .min(3, { message: "Title must be at least 3 characters" })
        .max(100, { message: "Title must not exceed 100 characters" }),
});

const updatePost = z.object({
    id: z.number({ required_error: "Id is required" }),

    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" })
        .max(500, { message: "Description must not exceed 500 characters" })
        .optional(),

    title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(100, { message: "Title must not exceed 100 characters" })
        .optional(),
});
const paramsGetPostSchema = z.object({
    id: z.string({ required_error: "post id is required" }),
});

// =================================================================
export const getPostSchema = z.object({
    params: paramsGetPostSchema,
});
export const createPostSchema = z.object({
    body: bodyCreatePostSchema,
});
export const updatePostSchema = z.object({
    body: updatePost,
});
export type Post = z.infer<typeof createPostSchema>;
export type GetPost = z.infer<typeof getPostSchema>;
export type UpdatePostSchema = z.infer<typeof updatePostSchema>;
