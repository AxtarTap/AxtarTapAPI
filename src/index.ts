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
import { config } from "dotenv";
import { checkUser } from "./middlewares";
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { GoogleAuthType, findOrCreateUser } from "./models/google_auth";

config();
const app = express();

app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
}));

app.use(compression());
app.use(cookieParser());
// app.use(passport.initialize());
// app.use(passport.session());
app.use(bodyParser.json());
app.use(checkUser);
app.use('/v1/', router());

app.get('/error', (req, res) => {
    // console.log('error', req);
    res.send(200)
});
app.get('/dashboard', (req, res) => {
    // console.log('dashboard', req);
    res.send(200)
});

app.use((req, res) => {
    res.status(404).json({ status: 404, message: 'Not Found'});
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/auth/google/callback",
    passReqToCallback: true
},
    async function (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: DoneCallback) {
        try {
            const payload: GoogleAuthType = {
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value
            }
            const user = await findOrCreateUser(payload)
            done(null, user);
        } catch (err) {
            done(err);
        };
    } as any
)); 

const server = http.createServer(app);

server.listen(process.env.API_PORT, () => {
    logger.info(`Server is running on port http://localhost:${process.env.API_PORT}/`);
});

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on("connected", () => logger.database("Connected to MongoDB"));
mongoose.connection.on("error", (err: Error) => logger.error(err));
