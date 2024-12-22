// move this to service
import bcrypt from "bcrypt";
import {setUser} from "../db/usersDal";
import logger from "./logger";

const saltRounds = 10

export const registerUser = async (userId: string, plainPassword: string) => {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds); // Hash password
    await setUser({userId, password: hashedPassword})
    logger.info(`User ${userId} registered with hashed password.`);
};
