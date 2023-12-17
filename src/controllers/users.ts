import express from 'express';
import { deleteUserById, getUserById, getUsers } from '../schemas/users';

export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await getUsers();

        return res.status(200).json(users).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: error.message });
    }
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        const deletedUser = await deleteUserById(id);

        return res.status(200).json(deletedUser).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: error.message });
    }
};

export const updateUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ status: 400, message: 'Missing Fields' });
        }

        const user = await getUserById(id);
        user.username = username;
        await user.save();

        res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}