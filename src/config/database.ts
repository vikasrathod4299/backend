import { Sequelize } from "sequelize";
import { seedAdminUser } from "../utils/seeder";

const dbUrl = process.env.DATABASE_URL as string;

export const sequelize = new Sequelize(
    dbUrl,{
        host: "localhost",
        dialect: "postgres",
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

export const createConnection = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
        await seedAdminUser();
    } catch (error) {
        console.log("Database connection error:", error);
        throw error;
    }
};
