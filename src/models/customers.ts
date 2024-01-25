import { Schema, model } from "mongoose";
import { AuthTypes, AuthenticationType, GoogleAuthType } from "types/types";

export interface CustomerType {
    authType: keyof AuthTypes;
    username: string;
    email: string;
    password: string;
    authentication?: AuthenticationType;
    googleAuth?: GoogleAuthType;
}
// TODO: Add creation date
export const CustomerSchema = new Schema<CustomerType>({
    authType: { type: Number, default: 0 },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authentication: {
        password: {
            type: String, required: function () {
                return !this.googleAuth || !this.googleAuth.id;
            }, select: false },
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false }
    },
    googleAuth: {
        id: { type: String, required: true },
    }
});

export const CustomerModel = model<CustomerType >("Customer", CustomerSchema);

export const getUserByEmail = (email: string) => CustomerModel.findOne({ email });
export const getUserByAccessToken = (accessToken: string) => CustomerModel.findOne({
    "authentication.accessToken": accessToken
});
export const getUserById = (id: string) => CustomerModel.findById(id);
export const getUserByGoogleId = (googleId: string) => CustomerModel.findOne({ "googleAuth.id": googleId });
export const createUser = (values: Record<string, any>) => new CustomerModel(values).save().then((user: any) => user.toObject());
export const findOrCreateGoogleUser = async (values: Record<string, any>) => {
    return await CustomerModel.findOne(values).then(async (user: any) => {
        if (user) {
            return user;
        }
        return await createUser(values);
    });
}
export const deleteUserById = (id: string) => CustomerModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => CustomerModel.findByIdAndUpdate(id, values);