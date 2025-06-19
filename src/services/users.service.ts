import db from "../models/index"

export const findUserById = async (id: number) => {
    try {
        let findUser = await db.users.findByPk(id)
        return findUser
    } catch (error) {
        throw error
    }
}

export const findUserByData = async (payload: object) => {
    try {
        let findData = await db.users.findOne({ where: payload })
        return findData
    } catch (error) {
        throw error
    }
}
export const findAllUser = async (payload?: object) => {
    try {
        let findData = await db.users.findAll({ where: payload })
        return findData
    } catch (error) {
        throw error
    }
}

export const updateUsersData = async (payload: object, condition: object) => {
    try {
        let updateData = await db.users.update(payload, { where: condition })
        return updateData
    } catch (error) {
        throw error
    }
}
export const createUser = async (payload: object) => {
    try {
        let createUser = await db.users.create(payload)
        return createUser
    } catch (error) {
        throw error
    }
}
