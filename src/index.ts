import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorConverter, errorHandler } from './middlewares/error'
import cookieParser from 'cookie-parser';
import route from './routes';
import dotenv from "dotenv"
import { createConnection } from "./config/database"
dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: [process.env.ADMIN_PANEL_URL || 'http://localhost:5175'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/api/badges', express.static(path.join(__dirname, '../documents')));
app.get('/', (req, res) => {
    res.send('Welcome to the API haha');
});
app.use("/api", route)
app.use(errorConverter)
app.use(errorHandler)
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await createConnection()
});