import { Schema, model } from "mongoose";
import { AuthenticationType } from "types/types";

export interface WorkerType {
    username: string;
    email: string;
    password: string;
    authentication?: AuthenticationType;
}

export const WorkerSchema = new Schema<WorkerType>({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authentication: {
        password: { type: String, required: true, select: false },
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false }
    }
});

export const WorkerModel = model<WorkerType>("Worker", WorkerSchema);

export const getUserByEmail = (email: string) => WorkerModel.findOne({ email });
export const getUserByAccessToken = (accessToken: string) => WorkerModel.findOne({
    "authentication.accessToken": accessToken
});
export const getUserById = (id: string) => WorkerModel.findById(id);
export const createUser = (values: Record<string, any>) => new WorkerModel(values).save().then((user: any) => user.toObject());
export const deleteUserById = (id: string) => WorkerModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => WorkerModel.findByIdAndUpdate(id, values);