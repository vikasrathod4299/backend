import { Router } from "express";
import {
    getInvitesByUserId,
    sendInvitationToUser,
    getUserWiseInvited,
    getAllInvitations,
    revokeAcceptedInvitation,
    cancelPendingInvitation
} from "../controllers/invitation.controller";
import { verifyToken } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { sendInvitationSchema } from "../schemas/invitationSchema";
const inviteRoutes = Router();

//Get routes
inviteRoutes.get("/:userId", getInvitesByUserId);
inviteRoutes.get("/", getAllInvitations);
inviteRoutes.get("/get/user-wise", verifyToken, getUserWiseInvited);
inviteRoutes.get("/revoke/invitation/:id", verifyToken, revokeAcceptedInvitation);
inviteRoutes.get("/cancel/invitation/:id", verifyToken, cancelPendingInvitation);

//POST routes
inviteRoutes.post(
    "/send-invitation",
    verifyToken,
    validate(sendInvitationSchema),
    sendInvitationToUser
);

export default inviteRoutes;
