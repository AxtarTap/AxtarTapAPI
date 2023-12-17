import express from 'express';
import { deleteUser, getAllUsers, updateUser } from '../controllers/users';
import { isAuthenticated, isOwner } from '../middlewares';

export default (router: express.Router) => {
    router.get('/auth/users', isAuthenticated, getAllUsers);
    router.delete('/auth/users/:id', isAuthenticated, isOwner, deleteUser);
    router.patch('/auth/users/:id', isAuthenticated, isOwner, updateUser);
};