import { userModel } from "./users.model";
import { postModel } from "./post.model";
import { invitationModel } from "./invitation.model";
import { sequelize } from "../config/database";

const db: any = {};

db.users = userModel(sequelize);
db.posts = postModel(sequelize);
db.invitation = invitationModel(sequelize);

Object.values(db).forEach((model: any) => {
  if (typeof model.associate === "function") {
    model.associate(db);
  }
});

export default db;
