import { Router } from 'express';
import { authenticate, callback } from '../../controllers/customer/google_auth';

export const googleAuth = (router: Router) => {
    router.get('/auth/google/', authenticate);
    router.get('/auth/google/callback', callback);
};