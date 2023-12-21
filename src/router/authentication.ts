import express from 'express';

import { login as customerLogin, register as customerRegister } from '../controllers/customer/authentication';
import { login as workerLogin, register as workerRegister } from '../controllers/worker/authentication';

export const workerAuthentication = (router: express.Router) =>  {
    router.post('/worker/register', workerRegister);
    router.post('/worker/login', workerLogin);
};

export const customerAuthentication = (router: express.Router) => {
    router.post('/customer/register', customerRegister);
    router.post('/customer/login', customerLogin);
};