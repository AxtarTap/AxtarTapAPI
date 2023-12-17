import { Logger } from 'winston';

export interface CustomLogger extends Logger {
    database?: (message: string) => void;
    request?: (message: string) => void;
}