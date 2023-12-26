import { get } from "lodash";
import { Request, Response } from "express";
import { CustomerModel, getUserByEmail, getUserById } from "../../models/customers";
import { APIError } from "../../errors/APIError";
import { ErrorManager } from "../../helpers/managers/ErrorManager";
import { hash, passwordMatches } from "../../helpers/security/passwordHash";
import { generateTokens } from "../../helpers/security/jwt";
import { RequestIdentity } from "../../types/types";
import { deleteRefreshTokenById } from "../../models/refreshTokens";
import logger from "../../utils/logger";

export const login = async (req: Request, res: Response) => {
    try {
        const errorHandler = new ErrorManager(res);
        if (get(req, 'identity.user')) {
            return errorHandler.handleError(new APIError('system', 'authentication', 'ALREADY_AUTHENTICATED'));
        }

        const { email, password } = req.body;

        if(!email) {
            errorHandler.addError(new APIError('registration', 'email', 'MISSING_EMAIL'));
        }

        if(!password) {
            errorHandler.addError(new APIError('registration', 'password', 'MISSING_PASSWORD'));
        }

        if(errorHandler.hasErrors()) return errorHandler.handleErrors();

        const user = await CustomerModel.findOne({ email }).select('+authentication.password');

        if(!user) {
            return errorHandler.handleError(new APIError('registration', 'email', 'EMAIL_DOES_NOT_EXIST'));
        }

        if(!(await passwordMatches(password, user.authentication.password))) {
            return errorHandler.handleError(new APIError('registration', 'password', 'INCORRECT_PASSWORD'));
        }
        
        const { accessToken, refreshToken } = await generateTokens(user.toObject());
        user.authentication.accessToken = accessToken;
        user.authentication.refreshToken = refreshToken;
        await user.save();

        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                accessToken: user.authentication.accessToken,
            }
        }).end();

    } catch (error) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while logging user in');
        logger.error(`${error.name}: ${error.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));  
    }
}

export const register = async (req: Request, res: Response) => {
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

            const hashedPassword = await hash(password);
            const user = await CustomerModel.create({ email, username, authentication: { password: hashedPassword } });
            const { accessToken, refreshToken } = await generateTokens(user.toObject());
            user.authentication.accessToken = accessToken;
            user.authentication.refreshToken = refreshToken;
            
            res.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 864000000, path: '/api/@me/refresh_token' });
            res.status(201).json({ 
                user: {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    accessToken: user.authentication.accessToken,
                }
            });

            await user.save();
        }

    } catch (error) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while registering user');
        logger.error(`${error.name}: ${error.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));  
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        const errorHandler = new ErrorManager(res);
        const identity = get(req, 'identity') as RequestIdentity;

        if (!identity) {
            return errorHandler.handleError(new APIError('system', 'authentication', 'NOT_AUTHENTICATED'));
        }

        const user = await getUserById(identity.user._id.toString());
        const refreshToken = await deleteRefreshTokenById(identity.user._id.toString());
        user.authentication.accessToken = null;
        user.authentication.refreshToken = null;
        await user.save();

        res.cookie('refresh_token', '', { httpOnly: true, maxAge: 1, path: '/api/@me/refresh_token' });
        res.status(200).json({ status: 200, message: "Logged out successfully" }).end();

    } catch (error) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while logging user out');
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
