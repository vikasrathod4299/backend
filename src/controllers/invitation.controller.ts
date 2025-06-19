import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { invitationStatus } from "../utils/constant";
import { sendEmailWithSMTP } from "../utils/helper";
import {
  findAllInvitations,
  findInvitationByData,
  findInvitationById,
  sendInvitation,
  updateInvitationData,
} from "../services/invitation.service";
import { findUserByData } from "../services/users.service";
import { Op } from "sequelize";

//Get all invitation by userId
export const getInvitesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const invites = await findInvitationByData({ invitedBy: userId });
    res.status(200).json({ message: "Retrieved successfully", data: invites });
  } catch (error) {
    next(error);
  }
};

//Send invitation to user
export const sendInvitationToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let loggedInUser = req.user;
    let requestData = req.body;
    const invitedToEmail = requestData.invitedToEmail.trim().toLowerCase();

    let findUser = await findUserByData({
      id: loggedInUser?.id,
      isDeleted: false,
    });
    if (!findUser) throw new ApiError(404, "Sender user is not found");

    if (findUser.email === invitedToEmail)
      throw new ApiError(403, "Cannot send an invitation to yourself!");

    let checkInvitedInUsers = await findUserByData({
      email: invitedToEmail,
      isDeleted: false,
    });
    if (checkInvitedInUsers)
      throw new ApiError(409, "Sent to user already registered");

    let findUserInList = await findInvitationByData({
      invitedToEmail: invitedToEmail,
      invitedById: findUser.id,
      status: { [Op.not]: invitationStatus.EXPIRED },
    });
    if (findUserInList)
      throw new ApiError(403, "You have already sent invitation to this user");

    let getCount = await findAllInvitations({
      invitedById: findUser.id,
      isDeleted: false,
      [Op.or]: [
        { status: invitationStatus.PENDING },
        { status: invitationStatus.EXPIRED },
      ],
    });
    const maxInviteCount = Number(process.env.MAX_INVITE_COUNT);
    if (getCount.length >= maxInviteCount) {
      throw new ApiError(409, "You have reached max invitation count");
    }
    //Create record in db collection
    let createDataObj: object = {
      invitedById: loggedInUser?.id,
      invitedToEmail: invitedToEmail,
      status: invitationStatus.PENDING,
    };
    let sendInvite = await sendInvitation(createDataObj);

    //Send invitation email
    await sendEmailWithSMTP({
      from_email: process.env.FROM_EMAIL,
      to: [{ email: invitedToEmail, type: "to" }],
      subject: "Invitation",
      templateName: "sendInvitation",
      options: {
        userName: findUser.fullName,
        companyName: "Araman",
        link: `${process.env.ADMIN_PANEL_URL}/accept-invite?referer_id=${loggedInUser?.id}`,
        year: new Date().getFullYear(),
      },
    });
    res
      .status(201)
      .json({ message: "Invitation sent successfully", data: sendInvite });
  } catch (error) {
    next(error);
  }
};

//Get all invited users of particular user
export const getUserWiseInvited = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser) {
      throw new ApiError(400, "Logged in user not found");
    }

    //admin user fetching for an user
    let findUserFromAdmin;
    if (req.query.userId) {
      findUserFromAdmin = await findUserByData({
        id: req.query.userId,
        isDeleted: false,
      });
      if (!findUserFromAdmin) {
        throw new ApiError(400, "User not found which admin trying to access");
      }
    }

    const userId = req.query.userId ? req.query.userId : loggedInUser.id;
    const invites = await findAllInvitations({ invitedById: userId });
    const sendRes: any = {
      message: "Data retrieved successfully",
      data: invites,
    };

    if (findUserFromAdmin) {
      sendRes.user = findUserFromAdmin;
    }

    res.status(200).json(sendRes);
  } catch (error) {
    next(error);
  }
};

//Get all invitations
export const getAllInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let getAll = await findAllInvitations({ isDeleted: false });
    res.status(201).json({
      message: "Fetched all invitation",
      data: getAll,
      count: getAll.length,
    });
  } catch (error) {
    next(error);
  }
};

//Revoke accepted invitation
export const revokeAcceptedInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let inviteId = req.params.id as string;
    let findRecord = await findInvitationById(Number(inviteId));
    if (!findRecord) {
      throw new ApiError(404, "Data not found ");
    }
    let findRecordWithStatus = await findInvitationByData({
      id: Number(inviteId),
      status: invitationStatus.APPROVED,
    });
    if (!findRecordWithStatus) {
      throw new ApiError(404, "You can revoke only accepted invitation");
    }
    await updateInvitationData({ isDeleted: true }, { id: findRecord.id });
    res.status(201).json({
      message: "Revoked invitation successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const cancelPendingInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let inviteId = req.params.id as string;
    let findRecord = await findInvitationById(Number(inviteId));
    if (!findRecord) {
      throw new ApiError(404, "Data not found ");
    }
    let findRecordWithStatus = await findInvitationByData({
      id: Number(inviteId),
      status: invitationStatus.PENDING,
    });
    if (!findRecordWithStatus) {
      throw new ApiError(404, "You can cancel only pending invitation");
    }
    await updateInvitationData({ isDeleted: true }, { id: findRecord.id });
    res.status(201).json({
      message: "Revoked invitation successfully",
    });
  } catch (error) {
    next(error);
  }
};
