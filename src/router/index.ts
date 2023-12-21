import express from 'express';
import { workerAuthentication, customerAuthentication } from './authentication';

const router = express.Router();

export default (): express.Router => {
    workerAuthentication(router);
    customerAuthentication(router);

    return router;
}