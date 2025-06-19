import { Sequelize, DataTypes, Model } from "sequelize";
import { IPostAttribute } from "../utils/global";

export const postModel = (sequelize: Sequelize) => {
  const Post = sequelize.define<Model<IPostAttribute>>(
    "post",
    {
      description: { type: DataTypes.TEXT, allowNull: false },
      title: { type: DataTypes.CHAR, allowNull: false },
      createdBy: { type: DataTypes.INTEGER, allowNull: true },
      isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
  Post.sync({ alter: true })
    .then(() => console.log("Post table synced successfully"))
    .catch((err: any) => console.log("Error while syncing post table", err));

  (Post as any).associate = (models: any) => {
    Post.belongsTo(models.users, {
      foreignKey: "createdBy",
      targetKey: "id",
      as: "usersPost",
    });
  };
  return Post;
};
