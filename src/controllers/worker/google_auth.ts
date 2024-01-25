import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { WorkerType } from "types/types";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    res.cookie('redirect', req.headers.referer, { httpOnly: true, maxAge: 60000, path: '/api/worker/auth/google/callback' });
    passport.authenticate('worker', {
        scope: ['email', 'profile']
    })(req, res, next);
}

export const callback = (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.cookies.redirect;
    passport.authenticate('worker', { session: false, failureRedirect: redirect }, (err: Error, data: WorkerType) => {
        if (err) {
            res.redirect(`${redirect}?success=false&error=${err}`);
        } else {
            const { accessToken } = data.authentication;

            res.redirect(`${redirect}?succes=true&accessToken=${accessToken}`);
        }
    })(req, res, next);
}