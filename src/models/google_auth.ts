import { Schema, model } from "mongoose";

export interface GoogleAuthType {
    googleId: string;
    username: string;
    email: string;
}

export const GoogleAuthSchema = new Schema<GoogleAuthType>({
    googleId: { type: "string", required: true},
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

export const GoogleAuthModel = model<GoogleAuthType>("GoogleAuth", GoogleAuthSchema);

export const getUserByEmail = (email: string) => GoogleAuthModel.findOne({ email });
export const getUserById = (id: string) => GoogleAuthModel.findById(id);
export const getUserByGoogleId = (googleId: string) => GoogleAuthModel.findOne({ googleId });
export const createUser = (values: Record<string, any>) => new GoogleAuthModel(values).save().then((user: any) => user.toObject());
export const findOrCreateUser = async (values: Record<string, any>) => {
    return await GoogleAuthModel.findOne(values).then(async (user: any) => {
        if (user) {
            return user;
        }
        return await createUser(values);
    });
}
export const deleteUserById = (id: string) => GoogleAuthModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => GoogleAuthModel.findByIdAndUpdate(id, values);