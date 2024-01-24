import { Router } from 'express';
import worker from './worker';
import customer from './customer';
import google_auth from './google_auth';
import me from './me';

const router = Router();

export default (): Router => {
    router.use('/worker', worker());
    router.use('/customer', customer());
    router.use('/auth/google', google_auth());
    router.use('/@me', me());
    return router;
}