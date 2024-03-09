import { DoneCallback, Profile } from "passport";
import { Strategy } from "passport-google-oauth2";
import { host as $ } from "../../utils";
import { CustomerModel, WorkerModel } from "../../models";
import { generateGoogleAccessToken, generateTokens } from "../security/jwt";

export const CustomerStrategy = new Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: $('/api/customer/auth/google/callback'),
        passReqToCallback: true    
    },
    async function (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: DoneCallback) {
        try {
            const googleId = profile.id,
                username = profile.displayName,
                email = profile.emails[0].value;

            const user = await CustomerModel.findOne({ email });

            if (user) {
                if (user.authType !== 1) {
                    return done('This email is not linked to a google account, please login with your password');
                }

                const accessToken = await generateGoogleAccessToken(user.toObject());
                user.authentication.accessToken = accessToken;
                user.updatedDate = Date.now();
                
                done(null, user);
                await user.save();
            } else {
                const newUser = new CustomerModel({ authType: 1, username, email, googleAuth: { id: googleId } });
                const accessToken = await generateGoogleAccessToken(newUser.toObject());
                newUser.authentication.accessToken = accessToken;
                newUser.updatedDate = Date.now();

                done(null, newUser);
                await newUser.save();
            }
        } catch (err) {
            done(err);
        };
    } as any
);

export const WorkerStrategy = new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: $('/api/worker/auth/google/callback'),
    passReqToCallback: true
},
    async function (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: DoneCallback) {
        try {
            const googleId = profile.id,
                username = profile.displayName,
                email = profile.emails[0].value;

            const user = await WorkerModel.findOne({ email });

            if (user) {
                if (user.authType !== 1) {
                    return done('This email is not linked to a google account, please login with your password');
                }

                const accessToken = await generateGoogleAccessToken(user.toObject());
                user.authentication.accessToken = accessToken;
                user.updatedDate = Date.now();

                done(null, user);
                await user.save();
            } else {
                const newUser = new WorkerModel({ authType: 1, username, email, googleAuth: { id: googleId } });
                const accessToken = await generateGoogleAccessToken(newUser.toObject());
                newUser.authentication.accessToken = accessToken;
                newUser.updatedDate = Date.now();

                done(null, newUser);
                await newUser.save();
            }
        } catch (err) {
            console.log(err);
            done(err);
        };
    } as any
);