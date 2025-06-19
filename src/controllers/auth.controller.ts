import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmailWithSMTP, createToken } from "../utils/helper";
import ApiError from "../utils/ApiError";
import { invitationStatus, userRoles } from "../utils/constant";
import {
  createUser,
  findUserByData,
  findUserById,
  updateUsersData,
} from "../services/users.service";
import {
  findInvitationByData,
  updateInvitationData,
} from "../services/invitation.service";

//Register new user
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, userName, password, fullName, phone } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const [emailExists, usernameExists] = await Promise.all([
      findUserByData({ email: normalizedEmail, isDeleted: false }),
      findUserByData({ userName, isDeleted: false }),
    ]);

    if (emailExists)
      throw new ApiError(409, "Provided email address already registered");
    if (usernameExists)
      throw new ApiError(409, "Provided username already used");

    const passwordHash = await bcrypt.hash(password, 10);

    if (req.params.invitedBy) {
      const [inviter, invitation] = await Promise.all([
        findUserById(Number(req.params.invitedBy)),
        findInvitationByData({
          invitedById: req.params.invitedBy,
          invitedToEmail: normalizedEmail,
          status: invitationStatus.PENDING,
        }),
      ]);
      if (!inviter) throw new ApiError(400, "Inviter user not found");
      if (!invitation) throw new ApiError(400, "Invitation record not found");
      await updateInvitationData(
        { status: invitationStatus.APPROVED },
        { id: invitation.id }
      );
    }

    const newUser = await createUser({
      fullName,
      email: normalizedEmail,
      phone,
      userName,
      password: passwordHash,
      role: userRoles.USER,
    });

    const verificationToken = createToken(
      { email: normalizedEmail },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "15m" }
    );

    await sendEmailWithSMTP({
      from_email: process.env.FROM_EMAIL,
      to: [{ email: normalizedEmail, type: "to" }],
      subject: "Verify Your Email",
      templateName: "verifyEmail",
      options: {
        fullName,
        email: normalizedEmail,
        link: `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`,
      },
    });

    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    next(error);
  }
};

//Verify email after registration
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string")
      throw new ApiError(400, "Invalid token");

    let decoded = jwt.decode(token) as { email: string };
    if (!decoded?.email) throw new ApiError(400, "Invalid token");

    let validToken = jwt.verify(
      token,
      `${process.env.JWT_SECRET}${decoded.email}` || "secret"
    );
    if (!validToken) {
      throw new ApiError(403, "Invalid or expired token");
    }

    const user = await findUserByData({
      email: decoded.email,
      isDeleted: false,
    });
    if (!user) throw new ApiError(400, "User not found");

    if (user.isVerified) throw new ApiError(200, "User already verified");

    await updateUsersData({ isVerified: true }, { id: user.id });
    const accessToken = createToken(
      { email: decoded.email, id: user.id },
      `${process.env.JWT_SECRET}${user.password}` || "secret",
      "15m"
    );

    const refreshToken = createToken(
      { email: decoded.email, id: user.id },
      `${process.env.JWT_SECRET}${user.password}${true}`,
      { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY as any) || "7d" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 900000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800000, // 7 days
    });

    res.status(200).json({
      message: "Email verified successfully",
      user: { email: decoded.email, isVerified: true },
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Login user
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { email, password, role } = req.body;
    email = email.toLowerCase().trim();

    const user = await findUserByData({ email });

    if (!user) {
      throw new ApiError(400, "User not found");
    }

    if (!user.isVerified) {
      throw new ApiError(400, "Email not verified");
    }

    if (user.isBanned) {
      throw new ApiError(400, "User is banned, please contact support");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(403, "Invalid password provided");
    }

    const accessToken = createToken(
      { email, id: user.id },
      `${process.env.JWT_SECRET}${user.password}` || "secret",
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );

    const refreshToken = createToken(
      { email, id: user.id },
      `${process.env.JWT_SECRET}${user.password}` || "secret",
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );

    const existingTokens = Array.isArray(user.refreshTokens)
      ? user.refreshTokens
      : [];
    await user.update({ refreshTokens: [...existingTokens, refreshToken] });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000, // 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800000, // 7 days
    });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    next(error);
  }
};

//Logout user
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw new ApiError(400, "No refresh token provided");

    const payload = jwt.decode(refreshToken) as { email: string };

    if (!payload?.email) throw new ApiError(400, "Invalid refresh token");

    const user = await findUserByData({
      email: payload.email,
      isDeleted: false,
    });

    if (!user) throw new ApiError(404, "User not found");

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // Remove refresh token from user's refreshTokens array
    const existingTokens: string[] = Array.isArray(user.refreshTokens)
      ? user.refreshTokens
      : [];

    const updatedTokens = existingTokens.filter(
      (token: string) => token !== refreshToken
    );

    await updateUsersData({ refreshTokens: updatedTokens }, { id: user.id });
    res.status(200).json({ message: "User logout successfully" });
  } catch (error) {
    next(error);
  }
};

//refresh a access token for auth
export const refreshAccessToken = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    const payload = jwt.decode(refreshToken) as { email: string };

    if (!payload || !payload.email) {
      throw new ApiError(400, "Invalid token");
    }
    const user = await findUserByData({ email: payload.email });
    // const user = await User.findOne({ where: { email: payload.email } });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const validToken = jwt.verify(
      refreshToken,
      `${process.env.JWT_SECRET}${user.password}` || "secret"
    );
    if (!validToken)
      throw new ApiError(403, "Invalid or expired refresh token");

    const accessToken = createToken(
      { email: payload.email, id: user.id },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
      }
    );
    return accessToken;
  } catch (error) {
    next(error);
  }
};
