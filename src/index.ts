import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "dotenv";
import router from "./router";
import logger from "./utils/logger";

config();
const app = express()

app.use(cors({
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/api/', router());
app.use((req, res) => {
    res.status(404).json({ status: 404, message: 'Not Found'});
});

const server = http.createServer(app);

server.listen(process.env.API_PORT, () => {
    logger.info(`Server is running on port http://localhost:${process.env.API_PORT}/`);
});

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on("connected", () => logger.database("Connected to MongoDB"));
mongoose.connection.on("error", (err: Error) => logger.error(err));
