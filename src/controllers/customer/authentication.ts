import express from "express";
import logger from "../../utils/logger";
import { authentication, generateRandomString } from "../../helpers";
import { createUser, getUserByEmail, getUserById } from "../../schemas/customers";
import { APIError } from "../../errors/APIError";
import { ErrorManager } from "../../helpers/managers/ErrorManager";
import { get } from "lodash";
import { RequestIdentity } from "types/types";

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const errorHandler = new ErrorManager(res)
        if (get(req, 'identity.user')) {
            return errorHandler.handleError(new APIError('system', 'authentication', 'ALREADY_AUTHENTICATED'));
        }

        const { email, password } = req.body;

        if(!email) {
            errorHandler.addError(new APIError('authentication', 'email', 'MISSING_EMAIL'));
        }

        if(!password) {
            errorHandler.addError(new APIError('authentication', 'password', 'MISSING_PASSWORD'));
        }

        if(errorHandler.hasErrors()) return errorHandler.handleErrors();

        const user = await getUserByEmail(email).select("+authentication.salt +authentication.token");

        if(!user) {
            return errorHandler.handleError(new APIError('authentication', 'email', 'EMAIL_DOES_NOT_EXIST'));
        }

        const expectedHash = authentication(user.authentication.salt, password);

        if(user.authentication.token !== expectedHash) {
            return errorHandler.handleError(new APIError('authentication', 'password', 'INCORRECT_PASSWORD'));
        }

        const salt = generateRandomString();
        user.authentication.sessionToken = authentication(salt, user._id.toString());

        await user.save();

        res.cookie('auth-token', user.authentication.sessionToken, { domain: 'localhost', path: '/' });

        return res.status(200).json({ user }).end();

    } catch (error) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while logging user in');
        logger.error(`${error.name}: ${error.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));  
    }
}

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const errorHandler = new ErrorManager(res)

        if (get(req, 'identity.user')) {
            return errorHandler.handleError(new APIError('system', 'authentication', 'ALREADY_AUTHENTICATED'));
        }

        const { email, password, username } = req.body;

        if (!email) {
            errorHandler.addError(new APIError('registration', 'email', 'MISSING_EMAIL'));
        }

        if (!password) {
            errorHandler.addError(new APIError('registration', 'password', 'MISSING_PASSWORD'));
        }

        if (!username) {
            errorHandler.addError(new APIError('registration', 'username', 'MISSING_USERNAME'));
        }

        if (errorHandler.hasErrors()) return errorHandler.handleErrors();

        if (validateEmail(email, errorHandler) && validatePassword(password, errorHandler) && validateUsername(username, errorHandler)) {

            const existingUser = await getUserByEmail(email);

            if(existingUser) {
               return errorHandler.handleError(new APIError('registration', 'email', 'EMAIL_ALREADY_EXISTS'));
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
        }

    } catch (error) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while registering user');
        logger.error(`${error.name}: ${error.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));  
    }
}

const validateEmail = (email: string, errorHandler: ErrorManager): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailRegex.test(email)) {
        errorHandler.addError(new APIError('registration', 'email', 'INVALID_EMAIL'));
    }

    if (errorHandler.hasErrors()) {
        errorHandler.handleErrors();
        return false;
    } else {
        return true;
    }
}

const validatePassword = (password: string, errorHandler: ErrorManager): boolean => {
    const minLength = 8;

    const uppercaseRegex = /[A-ZİŞĞÜÖÇƏ]/u;
    const lowercaseRegex = /[a-zıiışğüöçə]/u;
    const digitRegex = /\d/;
    // const specialCharRegex = /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/;

    if (password.length < minLength) {
        errorHandler.addError(new APIError('registration', 'password', 'INVALID_LENGTH'));
    }
    
    // if (!lowercaseRegex.test(password)) {
    //     errorHandler.addError(new APIError('registration', 'password', 'MISSING_LOWERCASE'));
    // }

    // if (!uppercaseRegex.test(password)) {
    //     errorHandler.addError(new APIError('registration', 'password', 'MISSING_UPPERCASE'));
    // }

    if (!digitRegex.test(password)) {
        errorHandler.addError(new APIError('registration', 'password', 'MISSING_DIGIT'));
    }

    // if (!specialCharRegex.test(password)) {
    //    errorHandler.addError(new APIError('registration', 'password', 'MISSING_SPECIAL_CHAR'));
    // }

    if (errorHandler.hasErrors()) {
        errorHandler.handleErrors();
        return false;
    } else {
        return true;
    }
}

const validateUsername = (username: string, errorHandler: ErrorManager): boolean => {
    const minLength = 3;
    const maxLength = 20;

    if (username.length < minLength || username.length > maxLength) {
        errorHandler.addError(new APIError('registration', 'username', 'INVALID_USERNAME_LENGTH'));
    }

    if (errorHandler.hasErrors()) {
        errorHandler.handleErrors();
        return false;
    } else {
        return true;
    }
}

export const logout = async (req: express.Request, res: express.Response) => {
    try {
        const errorHandler = new ErrorManager(res);
        const identity = get(req, 'identity') as RequestIdentity;

        if(!identity) {
            return errorHandler.handleError(new APIError('system', 'authentication', 'NOT_AUTHENTICATED'));
        }

        const user = await getUserById(identity.user._id.toString());
        user.authentication.sessionToken = null;
        await user.save();

        res.clearCookie('auth-token');
        return res.status(200).json({ status: 200, message: "Logged out successfully" }).end();

    } catch (error) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while logging user out');
        logger.error(`${error.name}: ${error.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}