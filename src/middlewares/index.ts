import express from 'express';
import { get, merge } from 'lodash';
import { getUserBySessionToken } from '../schemas/users';

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;
        const currentUserId = get(req, 'identity._id') as string;

        if(!currentUserId) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }

        if (currentUserId.toString() !== id) {
            return res.status(403).json({ status: 403, message: "Forbidden" });
        }

        next();
    } catch(error) {
        console.log(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const sessionToken = req.cookies['auth-token'];

        if(!sessionToken) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }

        const user = await getUserBySessionToken(sessionToken);

        if(!user) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }

        merge(req, { identity: user });

        return next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}