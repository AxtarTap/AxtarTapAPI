import { Schema, model } from "mongoose";
import { AuthenticationType } from "types/types";

export interface CustomerType {
    username: string;
    email: string;
    password: string;
    authentication?: AuthenticationType;
}

export const CustomerSchema = new Schema<CustomerType>({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authentication: {
        password: { type: String, required: true, select: false },
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false }
    }
});

export const CustomerModel = model<CustomerType >("Customer", CustomerSchema);

export const getUserByEmail = (email: string) => CustomerModel.findOne({ email });
export const getUserByAccessToken = (accessToken: string) => CustomerModel.findOne({
    "authentication.accessToken": accessToken
});
export const getUserById = (id: string) => CustomerModel.findById(id);
export const createUser = (values: Record<string, any>) => new CustomerModel(values).save().then((user: any) => user.toObject());
export const deleteUserById = (id: string) => CustomerModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => CustomerModel.findByIdAndUpdate(id, values);