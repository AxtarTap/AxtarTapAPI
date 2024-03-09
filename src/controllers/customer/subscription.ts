import logger from '../../utils/logger';
import subscriptions from '../../configurations/subscribtions.json';
import { APIError } from '../../errors/APIError';
import { ErrorManager } from '../../helpers/managers/ErrorManager';
import { createSubscription as create, getSubscriptionByCustomerId } from '../../models/customerSubscribtions';
import { SubscriptionRequestPayload, SubscriptionTypes } from 'types/subscribtionTypes';
import { Request, Response } from 'express';
import { RequestIdentity } from 'types/types';
import { get } from 'lodash';

export const getAllSubscriptions = async (req: Request, res: Response) => {
    try {
        const payload: SubscriptionTypes = subscriptions;
        return res.status(200).json(payload).end();
    } catch (err) {
        const errorHandler = new ErrorManager(res);
        logger.error('An error occured while getting user information');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const errorHandler = new ErrorManager(res);
        const identity: RequestIdentity = get(req, 'identity');
        const user = identity.user;
        const { tier }: SubscriptionRequestPayload = req.body;

        if(await getSubscriptionByCustomerId(user._id.toString())) {
            return errorHandler.handleError(new APIError('subscription', 'payload', 'ALREADY_SUBSCRIBED'));
        }

        if(!tier) {
            return errorHandler.handleError(new APIError('system', 'payload', 'MISSING_PROPERTY'), { p: 'subscription tier' });
        }

        const subscriptionDetails = subscriptions[tier];

        if(!subscriptionDetails) {
            return errorHandler.handleError(new APIError('system', 'payload', 'INVALID_PROPERTY'), { p: 'subscription tier' });
        }

        const subscription = await create({
            subscription: subscriptionDetails,
            customer: user._id
        });

        return res.status(201).json(subscription).end();

    } catch(err) {
        const errorHandler = new ErrorManager(res);
        logger.error('An error occured while creating new subscription');
        logger.error(`${err.name}: ${err.message}`);
        errorHandler.handleError(new APIError('system', 'server', 'INTERNAL_SERVER_ERROR'));
    }
}