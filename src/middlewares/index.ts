import express from 'express';
import logger from '../utils/logger';
import { get, merge } from 'lodash';
import { getUserBySessionToken as getCustomerBySessionToken } from '../schemas/customers';
import { getUserBySessionToken as getWorkerBySessionToken } from '../schemas/workers';
import { ErrorManager } from '../helpers/managers/ErrorManager';
import { APIError } from '../errors/APIError';

export const checkUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const sessionToken = req.cookies['auth-token'];

        if(!sessionToken) {
            return next();
        }

        const customer = await getCustomerBySessionToken(sessionToken);
        const worker = await getWorkerBySessionToken(sessionToken);
        if(customer) {
            merge(req, { identity: { type: 0, user: customer } });
        } else if(worker) {
            merge(req, { identity: { type: 1, user: worker } });
        }

        return next();
    } catch(err) {
        // const errorHandler = new ErrorManager(res);
        logger.error('Error while checking user');
        logger.error(`${err.name}: ${err.message}`);
        // errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}

// export const isLoggedIn = async (req: express.Request, res: express.Response) => {
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

// export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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