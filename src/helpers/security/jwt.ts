import moment from 'moment';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenModel, createRefreshToken } from '../../models/refreshTokens';
import { CustomerType, UserType, WorkerType } from '../../types/types'; 
import { getUserById as getCustomerById } from '../../models/customers';
import { getUserById as getWorkerById } from '../../models/workers';
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
    const type = await findUserType(userId);
    const payload = {
        type,
        userId
    }

    let token = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
        jwtid: jwtId,
    });

    return token;
}

const generateRefreshToken = async (userId: string, jwtId: string): Promise <string> => {
    const type = await findUserType(userId);
    const payload = {
        type,
        userId
    }

    let token = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: '10d',
        jwtid: jwtId,
    });

    const refreshToken = await RefreshTokenModel.findOne({ userId });

    if(refreshToken) {
        refreshToken.updatedDate = Date.now();
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
    const type = await findUserType(user._id.toString());
    const payload = {
        type,
        userId: user._id.toString(),
        googleId: user.googleAuth.id
    }

    let token = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: '2d',
    });

    return token;
}

export const verifyAccessToken = async (token: string): Promise <any> => {
    return new Promise((resolve) => {
        jwt.verify(token, JWT_ACCESS_TOKEN_SECRET, async (err, decoded: DecodedPayload) => {
            if(err) return resolve(false);

            const { type, userId } = decoded;

            if(type === 0) {
                const customer = await getCustomerById(userId).select('+authentication.accessToken');

                if(customer.authentication.accessToken === token) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
                
            } else if(type === 1) {
                const worker = await getWorkerById(userId).select('+authentication.accessToken');

                if (worker.authentication.accessToken === token) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            }
        });
    });
}

interface DecodedPayload extends jwt.JwtPayload {
    type: number;
    userId: string;
}

async function findUserType(userId: string): Promise<Number> {
    const customer = await getCustomerById(userId);
    const worker = await getWorkerById(userId);

    if(customer) return 0;
    else if(worker) return 1;
}