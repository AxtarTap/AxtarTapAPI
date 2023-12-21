import { Logger } from 'winston';

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
    salted: string;
    sessionToken: string;
}

export interface CustomLogger extends Logger {
    database?: (message: string) => void;
    request?: (message: string) => void;
}