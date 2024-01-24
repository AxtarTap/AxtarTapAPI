import passport from "passport";
import { Request, Response } from "express";
import { GoogleAuthType } from "models/google_auth";

export const authenticate = passport.authenticate('google', {
    scope: ['email', 'profile']
});

export const callback = (req: Request, res: Response) => {
    passport.authenticate('google', { session: false, failureRedirect: '/error' }, (err: Error, data: GoogleAuthType) => {
        if(err) {
            res.redirect('/customer/login');
        } else {
            // TODO: Add life time to cookie
            res.cookie('googleId', data.googleId, { httpOnly: true });
            res.redirect('/dashboard');
        }
    })(req, res);
}