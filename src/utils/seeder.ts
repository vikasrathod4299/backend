import bcrypt from "bcrypt";
import { userRoles } from "./constant";
import { findUserByData, createUser } from "../services/users.service";

export const seedAdminUser = async () => {
    try {
        const hashedPassword = await bcrypt.hash("Admin@123", 10);
        const adminUser = {
            userName: "admin",
            fullName: "admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            isVerified: true,
            role: userRoles.ADMIN,
        };

        let findUser = await findUserByData({
            email: adminUser.email,
            isDeleted: false,
        });

        if (!findUser) {
            await createUser(adminUser);
            console.log("Admin created successfully");
        } else {
            console.log("Admin user already exists");
        }
    } catch (error) {
        console.error("Error seeding admin user:", error);
    }
};
