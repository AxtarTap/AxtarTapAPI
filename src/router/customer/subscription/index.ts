import { Router } from 'express';
import { isAuthenticated, isCustomer } from '../../../middlewares';
import { getAllSubscriptions } from '../../../controllers/customer/subscription';

const router = Router();

export default (): Router => {
    router.get('/getAllSubscriptions', isAuthenticated, isCustomer, getAllSubscriptions);
    return router;
}