import { ObjectId } from 'mongoose';
import { Logger } from 'winston';

export interface RequestIdentity {
    type: 0 | 1,
    user: UserType
}

export interface UserType {
    _id: ObjectId;
    username: string;
    email: string;
}

export interface CustomerType {
    username: string;
    email: string;
    password: string;
    authentication?: AuthenticationType;
}

export interface WorkerType {
    username: string;
    email: string;
    password: string;
    authentication?: AuthenticationType;
}

interface AuthenticationType {
    token: string;
    salt: string;
    sessionToken: string;
}

export interface CustomLogger extends Logger {
    database?: (message: string) => void;
    request?: (message: string) => void;
}