import express from 'express';
import { deleteUser, updateUser } from '../controllers/users';
import { isAuthenticated, isOwner } from '../middlewares';

export default (router: express.Router) => {
    router.delete('/auth/users/:id', isAuthenticated, isOwner, deleteUser);
    router.patch('/auth/users/:id', isAuthenticated, isOwner, updateUser);
};