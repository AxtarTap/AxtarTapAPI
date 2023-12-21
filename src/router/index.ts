import express from 'express';
import { workerAuthentication, customerAuthentication } from './authentication';
import users from './users';

const router = express.Router();

export default (): express.Router => {
    workerAuthentication(router);
    customerAuthentication(router);
    users(router)

    return router;
}