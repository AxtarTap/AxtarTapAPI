import bcrypt from 'bcrypt';

export const hash = async (password: string): Promise<string> => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export const passwordMatches = async (password: string, hashedPassword: string): Promise <boolean> =>{
    return await bcrypt.compare(password, hashedPassword);
}