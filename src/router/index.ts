import { Router } from 'express';
import { workerAuthentication, customerAuthentication } from './authentication';
import { me } from './me';
import { worker } from './worker';

const router = Router();

export default (): Router => {
    workerAuthentication(router);
    // worker(router);
    customerAuthentication(router);
    me(router);
    return router;
}