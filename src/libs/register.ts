// move this to service
import {RegisteredUser} from "../db/usersDal";
import bcrypt from "bcrypt";

const saltRounds = 10

export const registerUser = async (username: string, plainPassword: string) => {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds); // Hash password
    console.log(hashedPassword);
    RegisteredUser[username] = hashedPassword; // Store hashed password
    // logger.info(`Registered user ${username} has been registered`);
    console.log(`User ${username} registered with hashed password.`);
};
