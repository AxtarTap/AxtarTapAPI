import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authentication: {
        token: { type: String, required: true, select: false },
        salt: { type: String, required: true, select: false },
        sessionToken: { type: String, select: false },
    }
});

export const CustomerModel = mongoose.model("Customer", CustomerSchema);

export const getUserByEmail = (email: string) => CustomerModel.findOne({ email });
export const getUserBySessionToken = (sessionToken: string) => CustomerModel.findOne({
    "authentication.sessionToken": sessionToken
});
export const getUserById = (id: string) => CustomerModel.findById(id);
export const createUser = (values: Record<string, any>) => new CustomerModel(values).save().then((user: any) => user.toObject());
export const deleteUserById = (id: string) => CustomerModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => CustomerModel.findByIdAndUpdate(id, values);