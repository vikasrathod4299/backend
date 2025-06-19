import { Router } from "express";
import {
    approveBadge,
    getAllUsers,
    getUserById,
    getPendingBadges,
    unBanUserById,
    requestBadge,
    banUserById,
    getUserProfile,
    updateUserData,
    generateKeyToDeleteUser,
    deleteUserAccount,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth";
const userRoutes = Router();

// GET routes
userRoutes.get("/", verifyToken, getAllUsers);
userRoutes.get("/request-badge", verifyToken, requestBadge);
userRoutes.get("/profile", verifyToken, getUserProfile);
userRoutes.get("/pending-badges", verifyToken, getPendingBadges);
userRoutes.get("/ban/:id", verifyToken, banUserById);
userRoutes.get("/un-ban/:id", verifyToken, unBanUserById);
userRoutes.get("/:id", getUserById);

// POST routes
// userRoutes.post("/", addUser);
userRoutes.post("/badges/:id", verifyToken, approveBadge);

// PATCH routes
userRoutes.patch("/", verifyToken, updateUserData);

// DELETE routes
userRoutes.post("/generate-key", generateKeyToDeleteUser);
userRoutes.post("/delete-user", deleteUserAccount);

export default userRoutes;
