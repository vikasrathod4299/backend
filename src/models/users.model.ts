import { Sequelize, DataTypes, Model } from "sequelize";
import { userRoles } from "../utils/constant";
import { IUserAttribute } from "../utils/global";

export const userModel = (sequelize: Sequelize) => {
    const User = sequelize.define<Model<IUserAttribute>>(
        "users",
        {
            email: { type: DataTypes.STRING, allowNull: false },
            fullName: { type: DataTypes.STRING, allowNull: false },
            isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
            isPayment: { type: DataTypes.BOOLEAN, defaultValue: false },
            badgeRequestStatus: { type: DataTypes.INTEGER, defaultValue: 0 }, //0 means pending, 1 means requested, 2 means accepted
            profilePic: { type: DataTypes.STRING, allowNull: true },
            badgeFileName: { type: DataTypes.STRING, allowNull: true },
            securityKey: { type: DataTypes.STRING, allowNull: true },
            isBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
            isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
            password: { type: DataTypes.STRING, allowNull: false },
            phone: { type: DataTypes.STRING, allowNull: true },
            userName: { type: DataTypes.STRING, allowNull: false },
            role: {
                type: DataTypes.ENUM(userRoles.ADMIN, userRoles.USER),
                allowNull: true,
            },
            refreshTokens: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
                defaultValue: [],
            },
        },
        {
            timestamps: true,
            paranoid: true,
        }
    );
    User.sync({ alter: true })
        .then(() => console.log("User table synced successfully"))
        .catch((err: any) => console.log("Error while syncing user table", err));
    (User as any).associate = (models: any) => { };
    return User;
};
