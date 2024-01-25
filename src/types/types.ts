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
    _id: ObjectId;
    authType: keyof AuthTypes;
    username: string;
    email: string;
    authentication?: AuthenticationType;
    googleAuth?: GoogleAuthType;
}

export interface WorkerType {
    _id: ObjectId;
    authType: keyof AuthTypes;
    username: string;
    email: string;
    authentication?: AuthenticationType;
    googleAuth?: GoogleAuthType;
}

export interface AuthenticationType {
    password: string;
    accessToken: string;
    refreshToken: string;
}

export interface GoogleAuthType {
    id: string;
}

export interface AuthTypes {
    0: 'system',
    1: 'google'
}

export interface CustomLogger extends Logger {
    database?: (message: string) => void;
    request?: (message: string) => void;
}