import { Sequelize, DataTypes, Model } from "sequelize";
import { invitationStatus } from "../utils/constant";
import { IInvitationAttribute } from "../utils/global";

export const invitationModel = (sequelize: Sequelize) => {
    const Invite = sequelize.define<Model<IInvitationAttribute>>(
        "invitation",
        {
            invitedById: { type: DataTypes.INTEGER, allowNull: true },
            invitedToEmail: { type: DataTypes.STRING, allowNull: false },
            isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
            status: {
                type: DataTypes.STRING,
                defaultValue: invitationStatus.PENDING,
            },
        },
        {
            timestamps: true,
            paranoid: true,
        }
    );
    Invite.sync({ alter: true })
        .then(() => console.log("Invite table synced successfully"))
        .catch((err: any) => console.log("Error while syncing invite table"));
    (Invite as any).associate = (models: any) => { };
    return Invite;
};
