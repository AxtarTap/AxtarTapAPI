import { Router } from 'express';
import { authentication } from './authentication';
import { googleAuth } from './google_auth';

const router = Router();

export default (): Router => {
    authentication(router);
    googleAuth(router);
    return router;
}
