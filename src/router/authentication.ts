import express from 'express';

import { login, register } from '../controllers/authentication';

export const workerAuthentication = (router: express.Router) =>  {
    router.post('/worker/register', register);
    router.post('/worker/login', login);
};

export const customerAuthentication = (router: express.Router) => {
    router.post('/customer/register', register);
    router.post('/customer/login', login);
};