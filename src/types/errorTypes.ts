export interface APIError {
    code?: number;
    status: number;
    message: string;
}

export interface ErrorPayload {
    code: number;
    message: string;
}

export type ErrorFields<T extends keyof APIErrors, U extends keyof APIErrors[T]> = {
    [key in U]: ErrorPayload | ErrorPayload[];
}

export interface MultipleErrorPayload {
    errors: ErrorFields<any, any>;
}

// System
export type ServerErrors = {
    INTERNAL_SERVER_ERROR: APIError,
}

export type SystemAuthenticationErrors = {
    ALREADY_AUTHENTICATED: APIError,
    NOT_AUTHENTICATED: APIError
}

export type SystemErrors = {
    server: ServerErrors,
    authentication: SystemAuthenticationErrors,
}

// Registration
export type RegistrationEmailErrors = {
    MISSING_EMAIL: APIError,
    INVALID_EMAIL: APIError,
    EMAIL_ALREADY_EXISTS: APIError,
}

export type RegistrationPasswordErrors = {
    MISSING_PASSWORD: APIError,
    INVALID_LENGTH: APIError,
    MISSING_LOWERCASE: APIError,
    MISSING_UPPERCASE: APIError,
    MISSING_DIGIT: APIError,
}

export type RegistrationUsernameErrors = {
    MISSING_USERNAME: APIError,
    INVALID_USERNAME_LENGTH: APIError,
}

export type RegitrationErrors = {
    email: RegistrationEmailErrors,
    password: RegistrationPasswordErrors,
    username: RegistrationUsernameErrors,
}

// Authentication
export type AuthenticationEmailErrors = {
    MISSING_EMAIL: APIError,
    EMAIL_DOES_NOT_EXIST: APIError,
}

export type AuthenticationPasswordErrors = {
    MISSING_PASSWORD: APIError,
    INCORRECT_PASSWORD: APIError,
}

export type AuthenticationErrors = {
    email: AuthenticationEmailErrors,
    password: AuthenticationPasswordErrors,
}

export type APIErrors = {
    system: SystemErrors,
    registration: RegitrationErrors,
    authentication: AuthenticationErrors
}
