import { get } from "lodash";
import { Request, Response } from "express";
import { APIError } from "../../errors/APIError";
import { WorkerModel } from "../../models/workers";
import { RequestIdentity } from "../../types/types";
import { CustomerModel } from "../../models/customers";
import { RefreshTokenModel } from "../../models/refreshTokens";
import { generateAccessToken } from "../../helpers/security/jwt";
import { ErrorManager } from "../../helpers/managers/ErrorManager";
import logger from "../../utils/logger";

export const getUserInformation = async (req: Request, res: Response) => {
    try {
        const identity: RequestIdentity = get(req, 'identity');
        const model = identity.type === 0 ? CustomerModel : WorkerModel;
        const userData = await model.findById(identity.user._id.toString()).select('-__v');

        return res.status(200).json({ user: userData }).end();
    } catch(err) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while getting user information');
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
        logger.error('Error while verifying token');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const identity: RequestIdentity = get(req, 'identity');
        const model = identity.type === 0 ? CustomerModel : WorkerModel;
        const user = await model.findById(identity.user._id.toString()).select('+authentication.accessToken +authentication.refreshToken');
        const refreshToken = await RefreshTokenModel.findOne({ userId: user._id.toString() });
        const refreshTokenCookie = req.cookies['refresh_token'];

        if(!refreshTokenCookie) {
            return res.status(401).end();
        }

        if (!refreshToken || refreshToken.token !== user.authentication.refreshToken || user.authentication.refreshToken !== refreshTokenCookie) {
            return res.status(401).end();
        }

        const accessToken = await generateAccessToken(user._id.toString(), refreshToken.jwtId);

        res.status(200).json({ accessToken }).end();

        user.authentication.accessToken = accessToken;
        await user.save();        
    } catch(err) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while refreshing token');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}