import { Document, Schema, model } from "mongoose";

export interface RefreshToken extends Document {
    token: string;
    userId: string;
    jwtId: string;
    used?: boolean;
    invalidated?: boolean;
    expiryDate: number;
    createdDate?: number;
    updatedDate?: number;
}

const RefreshTokenSchema = new Schema<RefreshToken>({
    token: { type: String, required: true },
    userId: { type: String, required: true },
    jwtId: { type: String, required: true },
    used: { type: Boolean, default: false },
    invalidated: { type: Boolean, default: false },
    expiryDate: { type: Number, required: true },
    createdDate: { type: Number, default: Date.now() },
    updatedDate: { type: Number, default: null }
});

export const RefreshTokenModel = model<RefreshToken>("RefreshToken", RefreshTokenSchema);
export const getRefreshTokenById = (id: string) => RefreshTokenModel.findById(id);
export const getRefreshTokenJwtId = (id: string) => RefreshTokenModel.findOne({ jwtId: id });
export const createRefreshToken = (values: Record<string, any>) => new RefreshTokenModel(values).save().then((refreshToken: any) => refreshToken.toObject());
export const deleteRefreshTokenById = (id: string) => RefreshTokenModel.findOneAndDelete({ _id: id });
export const deleteRefreshTokenByUserId = (id: string) => RefreshTokenModel.findOneAndDelete({ userId: id });