import db from "../models/index"

export const findInvitationById = async (id: number) => {
    try {
        let findPost = await db.invitation.findByPk(id)
        return findPost
    } catch (error) {
        throw error
    }
}

export const findInvitationByData = async (payload: object) => {
    try {
        let findData = await db.invitation.findOne({ where: payload })
        return findData
    } catch (error) {
        throw error
    }
}

export const findAllInvitations = async (payload?: object) => {
    try {
        let findData = await db.invitation.findAll({ where: payload })
        return findData
    } catch (error) {
        throw error
    }
}

export const updateInvitationData = async (payload: object, condition: object) => {
    try {
        let updateData = await db.invitation.update(payload, { where: condition })
        return updateData
    } catch (error) {
        throw error
    }
}
export const sendInvitation = async (payload: object) => {
    try {
        let createData = await db.invitation.create(payload)
        return createData
    } catch (error) {
        throw error
    }
}
