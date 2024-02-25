import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { merge } from 'lodash';
import { getUserByAccessToken as getCustomerByAccessToken } from '../models/customers';
import { getUserByAccessToken as getWorkerByAccessToken } from '../models/workers';
import { ErrorManager } from '../helpers/managers/ErrorManager';
import { APIError } from '../errors/APIError';
import { verifyAccessToken } from '../helpers/security/jwt';

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorization = req.headers['authorization'];
        const accessToken = authorization?.split(' ')[1];

        if(!accessToken) {
            return next();
        }

        const verification = await verifyAccessToken(accessToken);

        if(verification) {
            const customer = await getCustomerByAccessToken(accessToken);
            const worker = await getWorkerByAccessToken(accessToken);
            if(customer) {
                merge(req, { identity: { type: 0, user: customer } });
            } else if(worker) {
                merge(req, { identity: { type: 1, user: worker } });
            }
        }

        return next();
    } catch(err) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while checking user');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers['authorization'];
    const accessToken = authorization?.split(' ')[1];
    const errorHandler = new ErrorManager(res);

    if(!accessToken) {
        return errorHandler.handleError(new APIError('system', 'authorization', 'MISSING_AUTHORIZATION'));
    }
    const verification = await verifyAccessToken(accessToken);

    if(verification) {
        return next();
    } else {
        return errorHandler.handleError(new APIError('system', 'authorization', 'AUTHORIZATION_FAILED'));
    }
}

export const isCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers['authorization'];
    const accessToken = authorization?.split(' ')[1];
    const errorHandler = new ErrorManager(res);

    const user = await getCustomerByAccessToken(accessToken);

    if(user) {
        return next();
    } else {
        return errorHandler.handleError(new APIError('system', 'authorization', 'AUTHORIZATION_FAILED'));
    }
}

export const isWorker = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers['authorization'];
    const accessToken = authorization?.split(' ')[1];
    const errorHandler = new ErrorManager(res);

    const user = await getWorkerByAccessToken(accessToken);

    if(user) {
        return next();
    } else {
        return errorHandler.handleError(new APIError('system', 'authorization', 'AUTHORIZATION_FAILED'));
    }
}

// export const isLoggedIn = async (req: Request, res: Response) => {
//     try {
//         const sessionToken = req.cookies['auth-token'];

//         if(!sessionToken) {
//             return false;
//         }

//         const user = await getUserBySessionToken(sessionToken);

//         if(!user) {
//             return false
//         } else {
//             return true;
//         }
//     } catch (error) {
//         const errorHandler = new ErrorManager(res);
//         logger.error('Error while checking if user is logged in');
//         logger.error(`${error.name}: ${error.message}`);
//         errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));  
//     }
// }

// export const isOwner = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { id } = req.params;
//         const currentUserId = get(req, 'identity._id') as string;

//         if(!currentUserId) {
//             return res.status(401).json({ status: 401, message: "Unauthorized" });
//         }

//         if (currentUserId.toString() !== id) {
//             return res.status(403).json({ status: 403, message: "Forbidden" });
//         }

//         next();
//     } catch(error) {
//         console.log(error);
//         res.status(500).json({ status: 500, message: error.message });
//     }
// }

// export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const sessionToken = req.cookies['auth-token'];

//         if(!sessionToken) {
//             return res.status(401).json({ status: 401, message: "Unauthorized" });
//         }

//         const user = await getUserBySessionToken(sessionToken);

//         if(!user) {
//             return res.status(401).json({ status: 401, message: "Unauthorized" });
//         }

//         merge(req, { identity: user });

//         return next();
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ status: 500, message: error.message });
//     }
// }