import { Schema, model } from "mongoose";
import { AuthTypes, AuthenticationType, GoogleAuthType } from "types/types";

export interface WorkerType {
    authType: keyof AuthTypes;
    username: string;
    email: string;
    password: string;
    authentication?: AuthenticationType;
    googleAuth?: GoogleAuthType;
    createdDate?: number;
    updatedDate?: number;
}

export const WorkerSchema = new Schema<WorkerType>({
    authType: { type: Number, default: 0 },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authentication: {
        password: {
            type: String, required: function () {
                return !this.googleAuth || !this.googleAuth.id;
            }, select: false,
        },
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false }
    },
    googleAuth: {
        id: {
            type: String, required: function () {
                return !this.authentication.password && !this.authentication.refreshToken;
            }
        }
    },
    createdDate: { type: Number, default: Date.now() },
    updatedDate: { type: Number, default: null }
});

export const WorkerModel = model<WorkerType>("Worker", WorkerSchema);

// Functions
export const getUserByEmail = (email: string, select?: string) => WorkerModel.findOne({ email }).select(select);
export const getUserByAccessToken = (accessToken: string, select?: string) => WorkerModel.findOne({
    "authentication.accessToken": accessToken
}).select(select);
export const getUserById = (id: string, select?: string) => WorkerModel.findById(id).select(select);
export const getUserByGoogleId = (googleId: string, select?: string) => WorkerModel.findOne({ "googleAuth.id": googleId }).select(select);
export const createUser = (values: Record<string, any>) => new WorkerModel(values).save().then((user: any) => user.toObject());
export const findOrCreateGoogleUser = async (values: Record<string, any>) => {
    return await WorkerModel.findOne(values).then(async (user: any) => {
        if (user) {
            return user;
        }
        return await createUser(values);
    });
}
export const deleteUserById = (id: string) => WorkerModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => WorkerModel.findByIdAndUpdate(id, values);