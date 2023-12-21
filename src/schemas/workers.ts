import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authentication: {
        token: { type: String, required: true, select: false },
        salt: { type: String, required: true, select: false },
        sessionToken: { type: String, select: false },
    }
});

export const WorkerModel = mongoose.model("Worker", WorkerSchema);

export const getUserByEmail = (email: string) => WorkerModel.findOne({ email });
export const getUserBySessionToken = (sessionToken: string) => WorkerModel.findOne({ 
    "authentication.sessionToken": sessionToken 
});
export const getUserById = (id: string) => WorkerModel.findById(id);
export const createUser = (values: Record<string, any>) => new WorkerModel(values).save().then((user: any) => user.toObject());
export const deleteUserById = (id: string) => WorkerModel.findOneAndDelete({ _id: id });
export const updateUserById = (id: string, values: Record<string, any>) => WorkerModel.findByIdAndUpdate(id, values);