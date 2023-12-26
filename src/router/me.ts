import { Router } from "express";
import { getUserInformation, refreshToken, verifyToken } from "../controllers/me";
import { isAuthenticated } from "../middlewares";

const router = Router();

export const me = (router: Router) => {
    router.get('/@me', isAuthenticated, getUserInformation);
    router.get('/@me/refresh-token', isAuthenticated, refreshToken);
    router.get('/@me/verifyToken', isAuthenticated, verifyToken);
}