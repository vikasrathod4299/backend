import { Request, Response, NextFunction } from "express";
import {
  createTemplate,
  generateBadge,
  sendEmailWithSMTP,
  generateRandomKey,
} from "../utils/helper";
import ApiError from "../utils/ApiError";
import {
  findAllUser,
  findUserByData,
  findUserById,
  updateUsersData,
} from "../services/users.service";

//Currently not in use
// export const addUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { fullName, email, phone, password } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser: any = {
//       fullName,
//       email,
//       password: hashedPassword,
//       phone,
//       isVerified: false,
//     };

//     const existingUserSnapshot = await usersCollection
//       .where("email", "==", email)
//       .get();
//     if (!existingUserSnapshot.empty) {
//       res.status(400).json({ error: "User with this email already exists" });
//       return;
//     }
//     const userDoc = await usersCollection.add(newUser);
//     newUser.id = userDoc.id;

//     await sendEmailWithSMTP({
//       from_email: process.env.FROM_EMAIL,
//       to: [{ email: email, type: "to" }],
//       subject: "Verify Your Email Address",
//       templateName: "verifyEmail",
//       options: {
//         fullName: fullName,
//         companyName: "Araman",
//         link: `${process.env.FRONTEND_URL}/verify-email?email=${email}`,
//         year: new Date().getFullYear(),
//       },
//     });

//     res
//       .status(201)
//       .json({ message: "User created successfully", user: newUser });
//     return;
//   } catch (error) {
//     next(error);
//   }
// };

//Get all users - Listing
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let findAllRecord = await findAllUser({ isDeleted: false });
    res
      .status(200)
      .json({ message: "User retrieved successfully", data: findAllRecord });
  } catch (error) {
    next(error);
  }
};

//Get single user by provided Id
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    let findUser = await findUserById(Number(id));

    res.status(200).json({
      message: "User retrieved successfully",
      data: findUser,
    });
  } catch (error) {
    next(error);
  }
};

//Request for a badge
export const requestBadge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Unauthorized");

    if (!req.user?.profilePic)
      throw new ApiError(
        401,
        "Please upload a profile picture to request a badge."
      );

    const userDoc = await findUserById(Number(userId));
    if (!userDoc) {
      throw new ApiError(404, "User not found");
    }
    //1 means requested
    if (userDoc.badgeRequested === 1)
      throw new ApiError(400, "Badge request already submitted");

    await updateUsersData({ badgeRequested: 1 }, { id: userDoc.id });

    res.status(200).json({ message: "Badge request submitted successfully" });
  } catch (error) {
    next(error);
  }
};

//Get pending badges - Listing
export const getPendingBadges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let findAll = await findAllUser({
      isDeleted: false,
      badgeRequestStatus: 0, //0 means pending
    });
    res.status(200).json({
      message: "Pending badge requests retrieved successfully",
      data: findAll,
    });
  } catch (error) {
    next(error);
  }
};

//Approve badge
export const approveBadge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const { approved } = req.body;
    let findUser = await findUserById(Number(userId));
    if (!findUser) {
      throw new ApiError(404, "User not found");
    }

    if (approved == 2) {
      const bgUrl = "https://thenetwork.3braintechnolabs.com/images/bg.jpg";
      const profilePic =
        findUser.profilePic ||
        "https://thenetwork.3braintechnolabs.com/images/avatars/1.png";
      const issueDate = new Date().toISOString().split("T")[0];

      // expDate will be 10 years of issueDate
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 10);
      const formattedExpDate = expDate.toISOString().split("T")[0];

      const html = await createTemplate("certificate", {
        bgUrl: bgUrl,
        name: findUser.fullName || "User",
        issueDate,
        expDate: formattedExpDate,
        profilePic,
      });

      const pdfFileName = await generateBadge(userId, html);

      await updateUsersData(
        {
          badgeFileName: pdfFileName,
          badgeRequestStatus: approved == 2 ? 2 : 1,
        },
        { id: findUser.id }
      );

      res.status(200).json({
        message: `Badge request ${approved ? "approved" : "denied"
          } successfully`,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Ban user by provided Id
export const banUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    let findUser = await findUserById(Number(userId));
    if (!findUser) throw new ApiError(404, "User not found");
    await updateUsersData({ isBanned: true }, { id: findUser.id });
    res.status(200).json({ message: "User banned successfully" });
  } catch (error) {
    next(error);
  }
};

//Un ban user by provided Id
export const unBanUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    let findUser = await findUserByData({ id: Number(userId), isBanned: true });

    if (!findUser) throw new ApiError(404, "User not found");

    await updateUsersData({ isBanned: false }, { id: findUser.id });
    res.status(200).json({ message: "User un-banned successfully" });
  } catch (error) {
    next(error);
  }
};

//Get users data by logged in user id
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    let findUser = await findUserById(Number(userId));
    if (!findUser) throw new ApiError(404, "User not found");

    res.status(200).json({
      message: "User profile retrieved successfully",
      data: findUser,
    });
  } catch (error) {
    next(error);
  }
};

//User users data by provided id
export const updateUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { fullName, phone, userName, profilePic } = req.body;
    let findUser = await findUserById(Number(userId));
    if (!findUser) throw new ApiError(404, "User not found");

    const updatedData: any = {};
    if (fullName) updatedData.fullName = fullName;
    if (phone) updatedData.phone = phone;
    if (userName) updatedData.userName = userName;
    if (profilePic) updatedData.profilePic = profilePic;

    await updateUsersData(updatedData, { id: findUser.id });

    res.status(200).json({
      message: "User profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

//Generate random key to delete user account
export const generateKeyToDeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { id } = req.body;
    if (!id) throw new ApiError(400, "Please provide user id");

    let findUser = await findUserById(id);

    if (!findUser)
      throw new ApiError(404, "User not found with provided email address");

    let securityKey = generateRandomKey(6);
    await updateUsersData({ securityKey: securityKey }, { id: findUser.id });

    //send-email
    await sendEmailWithSMTP({
      from_email: process.env.FROM_EMAIL,
      to: [{ email: findUser.email, type: "to" }],
      subject: "Delete User secret key",
      templateName: "secretKey",
      options: {
        userName: findUser.fullName,
        companyName: "Araman",
        key: securityKey,
        year: new Date().getFullYear(),
      },
    });

    res.status(200).json({
      message: "Key has been sent to the provided email address",
    });
  } catch (error) {
    next(error);
  }
};

//Delete user account by email & security key
export const deleteUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let userData = req.body;

    if (!userData.id || !userData.securityKey)
      throw new ApiError(400, "Please provide both id & key together");

    let findUser = await findUserById(Number(userData.id));

    if (findUser) throw new ApiError(400, "User not found with provided id");

    let validateKey = await findUserByData({
      securityKey: userData.securityKey,
      isDeleted: false,
    });

    if (!validateKey) throw new ApiError(400, "Invalid key provided");

    await updateUsersData({ isDeleted: true }, { id: findUser.id });
    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
