import { APIError } from "errors/APIError"
import { Response } from "express"
import { APIErrors, ErrorPayload, MultipleErrorPayload } from "types/errorTypes";

export const handleError = <T extends keyof APIErrors, U extends keyof APIErrors[T], V extends keyof APIErrors[T][U]>(err: APIError<T, U, V>, res: Response) => {
    const { code, status, message, field } = err;
    let payload: ErrorPayload = { code, message };
    return res.status(status).json({ errors: { [field]: payload } });
}

export const handleErrors = <T extends keyof APIErrors, U extends keyof APIErrors[T], V extends keyof APIErrors[T][U]>(errors: APIError<T, U, V>[], res: Response) => {
    let payload: MultipleErrorPayload = { errors: {} };
    

    errors.forEach(err => {
        const { code, field, message } = err;
        let length = errors.filter(error => error.field === field).length;

        if(length > 1) {
            if(!payload.errors[field]) {
                payload.errors[field] = [];
            }

            (payload.errors[field] as ErrorPayload[]).push({ code, message });
        } else {
            payload.errors[field] = { code, message };
        }

    });

    return res.status(400).json(payload);
}