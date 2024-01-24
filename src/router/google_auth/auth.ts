import { Router } from 'express';
import { authenticate, callback } from '../../controllers/google_auth';

export const auth = (router: Router) => {
    router.get('/', authenticate);
    router.get('/callback', callback)
};