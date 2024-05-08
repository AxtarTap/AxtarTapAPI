import { config } from "dotenv";
import { ErrorManager } from "../helpers/managers/ErrorManager";
import { APIError } from "../errors/APIError";
import { Request, Response, NextFunction } from "express";
import logger from "./logger";
config();

export const base = (path?: string): string => {
    return path ? process.env.BASE_URL + path : process.env.BASE_URL;
}

export const host = (path?: string): string => {
    return path ? process.env.HOST_URL + path : process.env.HOST_URL;
}

export const validateEmail = (email: string, errorHandler: ErrorManager): boolean => {
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

export const validatePassword = (password: string, errorHandler: ErrorManager): boolean => {
    const minLength = 8;

    const uppercaseRegex = /[A-ZİŞĞÜÖÇƏ]/u;
    const lowercaseRegex = /[a-zıiışğüöçə]/u;
    const charRegex = /[a-zA-ZİŞĞÜÖÇƏ]/u;
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

    if (!charRegex.test(password)) {
        errorHandler.addError(new APIError('registration', 'password', 'MISSING_CHAR'));
    }

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

export const validateUsername = (username: string, errorHandler: ErrorManager): boolean => {
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

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
    logger.info(`Request (${req.method}) => "${req.path}"`);
    next();
}