import { Router } from 'express';
import worker from './worker';
import customer from './customer';
import me from './me';

const router = Router();

export default (): Router => {
    router.use('/worker', worker());
    router.use('/customer', customer());
    router.use('/@me', me());
    return router;
}