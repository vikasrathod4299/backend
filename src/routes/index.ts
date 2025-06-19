import { Router } from "express"
import authRoutes from "./auth.route"
// import followRoutes from "./follower.route"
import inviteRoutes from "./invitation.route"
import postRoutes from "./post.route"
import userRoutes from "./user.route"
const route = Router()

route.use("/auth", authRoutes)
// route.use("/followers", followRoutes)
route.use("/invite", inviteRoutes)
route.use("/posts", postRoutes)
route.use("/users", userRoutes)

export default route

