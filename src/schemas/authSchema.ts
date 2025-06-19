import { z } from "zod";

const signupBodySchema = z.object({
    fullName: z.string({ required_error: "Full name is required" }).trim(),
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email({ message: "Invalid email address provided" }),
    phone: z
        .string()
        .trim()
        .optional()
        .refine(
            (val) =>
                !val ||
                /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(val),
            { message: "Invalid phone number" }
        ),
    userName: z
        .string({ required_error: "Username is required" })
        .trim()
        .min(3)
        .max(20),
    password: z.string({ required_error: "Password is required" }).min(8).max(20),
});

const signinBodySchema = z.object({
    email: z
        .string({ required_error: "Email is required" }).trim()
        .email({ message: "Invalid email format" }),
    password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(20, "Password must be at most 20 characters"),
});

const verifyEmail = z.object({
    email: z
        .string({ required_error: "Verify token in required" })
});

export const signupSchema = z.object({
    body: signupBodySchema,
});
export const signinSchema = z.object({
    body: signinBodySchema,
});
export const verifyEmailSchema = z.object({
    query: verifyEmail,
});

export type SignupSchema = z.infer<typeof signupSchema>;
export type SigninSchema = z.infer<typeof signinSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
