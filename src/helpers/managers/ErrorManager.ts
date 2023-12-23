import { handleError, handleErrors } from "../../handlers/errorHandler";
import { APIError } from "../../errors/APIError";
import { Response } from "express";

export class ErrorManager {
    private errors: APIError<any, any, any>[] = [];
    private res: Response;

    constructor(res: Response) {
        this.res = res;
    }

    public addError(error: APIError<any, any, any>): this {
        this.errors.push(error);
        return this;
    }

    public getErrors(): APIError<any, any, any>[] {
        return this.errors;
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    public clearErrors(): this {
        this.errors = [];
        return this;
    }

    public handleError(error: APIError<any, any, any>): void {
        handleError(error, this.res);
    }

    public handleErrors(): void {
        const errors = this.getErrors();
        if (errors.length > 0) {
            handleErrors(errors, this.res);
            this.clearErrors();
        }
    }
}