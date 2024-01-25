import moment from 'moment';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenModel, createRefreshToken } from '../../models/refreshTokens';
import { CustomerType, UserType, WorkerType } from '../../types/types'; 
import { config } from 'dotenv';
config();

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

export const generateTokens = async (user: UserType): Promise <{accessToken: string, refreshToken: string }>  => {
    const jwtId = uuidv4()
    const accessToken = await generateAccessToken(user._id.toString(), jwtId);
    const refreshToken = await generateRefreshToken(user._id.toString(), jwtId);

    return { accessToken, refreshToken };
}

export const generateAccessToken = async (userId: string, jwtId: string): Promise <string> => {
    const payload = {
        userId
    }

    let token = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
        jwtid: jwtId,
    });

    return token;
}

const generateRefreshToken = async (userId: string, jwtId: string): Promise <string> => {
    const payload = {
        userId
    }

    let token = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: '10d',
        jwtid: jwtId,
    });

    const refreshToken = await RefreshTokenModel.findOne({ userId });

    if(refreshToken) {
        refreshToken.updatedAt = moment().toDate();
        refreshToken.token = token;
        await refreshToken.save();
    } else {
        await createRefreshToken({
            token,
            jwtId,
            userId,
            used: false,
            invalidated: false,
            expiryDate: moment().add(10, "d").toDate(),
        });

    }
    return token;
}

export const generateGoogleAccessToken = async (user: CustomerType | WorkerType): Promise <string> => {
    const payload = {
        userId: user._id.toString(),
        googleId: user.googleAuth.id
    }

    let token = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: '2d',
    });

    return token;
}

export const verifyAccessToken = (token: string): Promise <any> => {
    return new Promise((resolve) => {
        jwt.verify(token, JWT_ACCESS_TOKEN_SECRET, (err, decoded) => {
            if(err) return resolve(false);
            resolve(true);
        });
    });
}