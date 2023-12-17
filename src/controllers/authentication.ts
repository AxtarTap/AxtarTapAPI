import express from "express";
import { authentication, generateRandomString } from "../helpers";
import { createUser, getUserByEmail } from "../schemas/users";
import { get } from "lodash";

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ status: 400, message: "Missing fields" });
        }

        const user = await getUserByEmail(email).select("+authentication.salt +authentication.token");

        if(!user) {
            return res.status(400).json({ status: 400, message: "Email or password is incorrect" });
        }

        const expectedHash = authentication(user.authentication.salt, password);

        if(user.authentication.token !== expectedHash) {
            return res.status(401).json({ status: 401, message: "Email or password is incorrect" });
        }

        const salt = generateRandomString();
        user.authentication.sessionToken = authentication(salt, user._id.toString());

        await user.save();

        res.cookie('auth-token', user.authentication.sessionToken, { domain: 'localhost', path: '/' });

        return res.status(200).json({ user }).end();

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, username } = req.body;

        if(!email || !password || !username) {
            return res.status(400).json({ status: 400, message: "Missing fields" });
        }

        const existingUser = await getUserByEmail(email);

        if(existingUser) {
            return res.status(400).json({ status: 400, message: "User already exists" });
        }

        const salt = generateRandomString();
        const user = await createUser({
            email,
            username,
            authentication: {
                salt,
                token: authentication(salt, password),
            }
        });

        return res.status(201).json({ user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}

// export const logout = async (req: express.Request, res: express.Response) => {
//     try {
//         const identity = get(req, 'identity') as object;

//         identity.user.authentication.sessionToken = null;

//         await user.save();

//         res.clearCookie('auth-token');

//         return res.status(200).json({ status: 200, message: "Logged out" }).end();
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ status: 500, message: error.message });
//     }
// }