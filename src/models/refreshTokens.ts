import { Document, Schema, model } from "mongoose";
import { CustomerSchema } from "./customers";
import { WorkerSchema } from "./workers";
import { CustomerType, WorkerType } from "types/types";

export interface RefreshToken extends Document {
    token: string;
    userId: string;
    jwtId: string;
    used?: boolean;
    invalidated?: boolean;
    expiryDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const RefreshTokenSchema = new Schema<RefreshToken>({
    token: { type: String, required: true },
    userId: { type: String, required: true },
    jwtId: { type: String, required: true },
    used: { type: Boolean, default: false },
    invalidated: { type: Boolean, default: false },
    expiryDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date }
});

export const RefreshTokenModel = model<RefreshToken>("RefreshToken", RefreshTokenSchema);
export const getRefreshTokenById = (id: string) => RefreshTokenModel.findById(id);
export const getRefreshTokenJwtId = (id: string) => RefreshTokenModel.findOne({ jwtId: id });
export const createRefreshToken = (values: Record<string, any>) => new RefreshTokenModel(values).save().then((refreshToken: any) => refreshToken.toObject());
export const deleteRefreshTokenById = (id: string) => RefreshTokenModel.findOneAndDelete({ _id: id });