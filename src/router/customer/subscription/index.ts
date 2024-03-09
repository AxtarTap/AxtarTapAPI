import { Router } from 'express';
import { isAuthenticated, isCustomer } from '../../../middlewares';
import { createSubscription, getAllSubscriptions } from '../../../controllers/customer/subscription';

const router = Router();

export default (): Router => {
    router.get('/getAllSubscriptions', isAuthenticated, isCustomer, getAllSubscriptions);
    router.post('/createSubscription', isAuthenticated, isCustomer, createSubscription);
    return router;
}