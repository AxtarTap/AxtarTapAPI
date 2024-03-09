import express from "express";
import passport, { DoneCallback, Profile } from "passport";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import router from "./router";
import logger from "./utils/logger";
import flash from "connect-flash";
import { config } from "dotenv";
import { host as $ } from "./utils";
import { checkUser } from "./middlewares";
import { CustomerStrategy, WorkerStrategy } from "./helpers/passport";
import { exec } from "child_process";

console.clear();

config();
const app = express();

// Middlewares
app.use(cors({
    origin: $(),
    credentials: true,
}));

app.use(flash());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(checkUser);
app.use('/v1/', router());
passport.use('customer', CustomerStrategy);
passport.use('worker', WorkerStrategy);

app.use((req, res) => {
    res.status(404).json({ status: 404, message: 'Not Found'});
});

// Server
const server = http.createServer(app);

// Database
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once('connected', () => {
    server.listen(process.env.API_PORT, () => {
        logger.info(`Server is running on port http://localhost:${process.env.API_PORT}/`);
    });
});
mongoose.connection.on('connected', () => logger.database('Connected to MongoDB'));
mongoose.connection.on('error', (err: Error) => logger.error(err));
