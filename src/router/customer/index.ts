import { Router } from 'express';
import { authentication } from './authentication';
import { googleAuth } from './google_auth';
import subscription from './subscription';

const router = Router();

export default (): Router => {
    authentication(router);
    googleAuth(router);
    router.use('/subscription', subscription());
    return router;
}
