import express from 'express';

import { login, register } from '../controllers/authentication';

export default (router: express.Router) =>  {
    router.post('/auth/client/register', register);
    router.post('/auth/client/login', login);
};