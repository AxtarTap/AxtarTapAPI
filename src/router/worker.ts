import { Router } from "express";
import { login, register, logout } from '../controllers/worker/authentication';

const router = Router();

export const worker = (router: Router) => {
    workerAuthentication(router);
}

export const workerAuthentication = (router: Router) => {
    router.get('/hello', (req, res) => res.send('Hello World!'));
    // router.post('/register', register);
    // router.post('/login', login);
    // router.get('/logout', logout);
};