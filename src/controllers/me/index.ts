import { get } from "lodash";
import { Request, Response } from "express";
import { APIError } from "../../errors/APIError";
import { WorkerModel, getUserByAccessToken as getWorkerByAccessToken } from "../../models/workers";
import { RequestIdentity } from "../../types/types";
import { CustomerModel, getUserByAccessToken as getCustomerByAccessToken } from "../../models/customers";
import { RefreshTokenModel, deleteRefreshTokenByUserId } from "../../models/refreshTokens";
import { generateAccessToken } from "../../helpers/security/jwt";
import { ErrorManager } from "../../helpers/managers/ErrorManager";
import { hash, passwordMatches } from "../../helpers/security/passwordHash";
import { getSubscriptionByCustomerId } from "../../models/customerSubscribtions";
import { validatePassword } from "../../utils";
import logger from "../../utils/logger";

export const getUserInformation = async (req: Request, res: Response) => {

    try {
        const identity: RequestIdentity = get(req, 'identity');
        const model = identity.type === 0 ? CustomerModel : WorkerModel;
        const userData = await model.findById(identity.user._id.toString()).select('-__v');
        const subsciptionData = await getSubscriptionByCustomerId(userData._id.toString(), '-__v -_id');

        return res.status(200).json({ type: identity.type, user: { userData, subscription: subsciptionData || null } }).end();
    } catch(err) {
        const errorHandler = new ErrorManager(res);
        logger.error('An error occured while getting user information');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}

export const verifyToken = async (req: Request, res: Response) => {
    try {
        const authorization = req.headers['authorization'];
        const accessToken = authorization?.split(' ')[1];
        const identity: RequestIdentity = get(req, 'identity');
        const model = identity.type === 0 ? CustomerModel : WorkerModel;
        const user = await model.findById(identity.user._id.toString()).select('+authentication.accessToken');
        if (accessToken === user.authentication.accessToken) {
            return res.status(200).end();
        } else {
            return res.status(401).end();
        }

    } catch (err) {
        const errorHandler = new ErrorManager(res);
        logger.error('An error occured while verifying token');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const authorization = req.headers['authorization'];
        const authToken = authorization?.split(' ')[1];
        const customer = await getCustomerByAccessToken(authToken, '+authentication.accessToken +authentication.refreshToken -__v');
        const worker = await getWorkerByAccessToken(authToken, '+authentication.accessToken +authentication.refreshToken -__v');
        let user = null;

        if(customer) {
            user = customer;
        } else if(worker) {
            user = worker;
        } else {
            return res.status(401).end();
        }

        const refreshToken = await RefreshTokenModel.findOne({ userId: user._id.toString() });
        const refreshTokenCookie = req.cookies['refresh_token'];

        if(!refreshTokenCookie) {
            return res.status(401).end();
        }
        if (!refreshToken || refreshToken.token !== user.authentication.refreshToken || user.authentication.refreshToken !== refreshTokenCookie) {
            return res.status(401).end();
        }
        
        const accessToken = await generateAccessToken(user._id.toString(), refreshToken.jwtId);
        user.authentication.accessToken = accessToken;

        res.status(200).json({ accessToken }).end();

        await user.save();        
    } catch(err) {
        const errorHandler = new ErrorManager(res);
        logger.error('An error occured while refreshing token');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}

export const changePassword = async (req: Request, res: Response) => {
    try {
        const errorHandler = new ErrorManager(res);
        const identity: RequestIdentity = get(req, 'identity');
        const model = identity.type === 0 ? CustomerModel : WorkerModel;
        const user = await model.findById(identity.user._id.toString()).select('+authentication.password');
        const { old_password, new_password } = req.body;

        if(!old_password) {
            errorHandler.addError(new APIError('system', 'payload', 'MISSING_PROPERTY'), { p: 'old password'})
        }

        if(!new_password) {
            errorHandler.addError(new APIError('system', 'payload', 'MISSING_PROPERTY'), { p: 'new password'})
        }

        if(errorHandler.hasErrors()) return errorHandler.handleErrors();

        if(old_password == new_password) {
            return errorHandler.handleError(new APIError('system', 'payload', 'INVALID_PAYLOAD'), { m: 'old password and new password cannot be the same'});
        }

        if(!(await passwordMatches(old_password, user.authentication.password))) {
            return errorHandler.handleError(new APIError('system', 'payload', 'INCORRECT_PROPERTY'), { p: 'Old password'});
        }

        if(validatePassword(new_password, errorHandler)) {

            const hashedPassword = await hash(new_password);
            user.authentication.password = hashedPassword;
            user.authentication.accessToken = null;
            user.authentication.refreshToken = null;
            user.updatedDate = Date.now();
            
            res.cookie('refresh_token', '', { httpOnly: true, maxAge: 1, path: '/api/@me/refresh-token' });
            res.status(200).end();

            await deleteRefreshTokenByUserId(user._id.toString());
            await user.save();
        }

    } catch(err) {
        const errorHandler = new ErrorManager(res);
        logger.error('An error occured while changing password');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}