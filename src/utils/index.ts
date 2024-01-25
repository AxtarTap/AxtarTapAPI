import { config } from "dotenv";
config();

export const base = (path?: string) => {
    return path ? process.env.BASE_URL + path : process.env.BASE_URL;
}

export const host = (path?: string) => {
    return path ? process.env.HOST_URL + path : process.env.HOST_URL;
}