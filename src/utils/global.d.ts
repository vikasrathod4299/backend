import { userRoles } from "../utils/constant"

type SendEmailOptions = {
  from_email?: string;
  to: Array<{ email: string; type: string }>;
  subject: string;
  templateName: string;
  options: any;
};

export interface IUserAttribute {
  email: string;
  fullName: string;
  isVerified?: boolean;
  isPayment?: boolean;
  isDeleted?: boolean;
  isBanned?: boolean;
  password: string;
  phone: string;
  userName: string;
  profilePic: string;
  badgeFileName: string;
  securityKey: string;
  badgeRequestStatus: number,
  refreshTokens: any,
  role?: "admin" | "user";
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IPostAttribute {
  description: string;
  title: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  isPublic: boolean
  isDeleted: boolean
}export interface IInvitationAttribute {
  invitedById: number;
  invitedToEmail?: string;
  isDeleted: boolean;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string;[key: string]: any };
    }
  }
}