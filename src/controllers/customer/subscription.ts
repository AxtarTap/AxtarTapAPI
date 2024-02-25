import logger from '../../utils/logger';
import subscriptions from '../../configurations/subscribtions.json';
import { APIError } from '../../errors/APIError';
import { ErrorManager } from '../../helpers/managers/ErrorManager';
import { SubscriptionTypes } from 'types/subscribtionTypes';
import { Request, Response } from 'express';

export const getAllSubscriptions = async (req: Request, res: Response) => {
    try {
        const payload: SubscriptionTypes = subscriptions;
        return res.status(200).json(payload).end();
    } catch (err) {
        const errorHandler = new ErrorManager(res);
        logger.error('Error while getting user information');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}