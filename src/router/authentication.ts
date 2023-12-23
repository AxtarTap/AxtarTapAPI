import express from 'express';

import { login as customerLogin, register as customerRegister, logout as customerLogout } from '../controllers/customer/authentication';
import { login as workerLogin, register as workerRegister, logout as workerLogout } from '../controllers/worker/authentication';

export const workerAuthentication = (router: express.Router) =>  {
    router.post('/worker/register', workerRegister);
    router.post('/worker/login', workerLogin);
    router.get('/worker/logout', workerLogout);
};

export const customerAuthentication = (router: express.Router) => {
    router.post('/customer/register', customerRegister);
    router.post('/customer/login', customerLogin);
    router.get('/customer/logout', customerLogout);
};