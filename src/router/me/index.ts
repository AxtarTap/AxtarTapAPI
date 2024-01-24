import { Router } from 'express';
import { getUserInformation, refreshToken, verifyToken } from "../../controllers/me";
import { isAuthenticated } from "../../middlewares";

const router = Router();

export default (): Router => {
    router.get('/', isAuthenticated, getUserInformation);
    router.get('/refresh-token', isAuthenticated, refreshToken);
    router.get('/verifyToken', isAuthenticated, verifyToken);
    return router;
}
