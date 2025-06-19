import db from "../models/index";

export const findPostById = async (id: number) => {
  try {
    let findPost = await db.posts.findByPk(id);
    return findPost;
  } catch (error) {
    throw error;
  }
};

export const findPostByData = async (payload: any) => {
  try {
    let findData = await db.posts.findOne({
      where: payload,
      include: [
        {
          model: db.users,
          as: "usersPost",
          attributes: ["id", "fullName", "email", "userName"],
        },
      ],
    });
    return findData;
  } catch (error) {
    throw error;
  }
};

export const findAllPosts = async (payload: any = {}) => {
  try {
    const findData = await db.posts.findAll({
      where: payload,
      include: [
        {
          model: db.users,
          as: "usersPost",
          attributes: ["id", "fullName", "email", "userName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return findData;
  } catch (error) {
    throw error;
  }
};

export const updatePostData = async (payload: any, condition: any) => {
  try {
    let updateData = await db.posts.update(payload, { where: condition, returning: true });
    return updateData;
  } catch (error) {
    throw error;
  }
};
export const createPost = async (payload: any) => {
  try {
    let create = await db.posts.create(payload);
    return create;
  } catch (error) {
    throw error;
  }
};
