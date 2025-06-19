import { z } from "zod";

const sendInvitation = z.object({
    invitedToEmail: z.string({ required_error: "Invitation email is required" })
});
export const sendInvitationSchema = z.object({
    body: sendInvitation,
});
export type SendInvitationSchema = z.infer<typeof sendInvitationSchema>;