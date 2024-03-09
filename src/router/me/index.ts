import { Router } from 'express';
import { changePassword, getUserInformation, refreshToken, verifyToken } from "../../controllers/me";
import { isAuthenticated } from "../../middlewares";

const router = Router();

export default (): Router => {
    router.get('/', isAuthenticated, getUserInformation);
    router.get('/refresh-token', refreshToken);
    router.get('/verifyToken', isAuthenticated, verifyToken);
    router.post('/changePassword', isAuthenticated, changePassword);
    return router;
}
