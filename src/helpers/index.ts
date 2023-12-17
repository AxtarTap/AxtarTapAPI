import crypto from 'crypto';
import { config } from 'dotenv';
config();

const SECRET = process.env.SECRET

export const generateRandomString = (length: number = 128): string => {
    return crypto.randomBytes(length).toString('base64');
}

export const authentication = (salt: string, password: string): string => {
    return crypto.createHmac('sha256', [salt, password].join('/')).update(SECRET).digest('hex');
}