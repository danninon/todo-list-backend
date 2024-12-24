import express, {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../libs/logger";
import config from "../config/default";


import {getUser} from "../db/usersDal";

const router = express.Router();


// @ts-ignore
router.post("/login", async (req: Request, res: Response) => {
    logger.info("Received login request");

    const {username: userId, password} = req.body;


    if (!userId || !password) {
        logger.warn("Login failed: Missing username or password in request");
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    const userDetails = await getUser(userId)
    if (!userDetails) {
        logger.warn(`Login failed: User ${userId} not found`);
        return res.status(401).json({error: "Invalid username or password"});
    }

    const {password: hashedPassword} = userDetails
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (isPasswordValid) {
        const token = jwt.sign(
            {id: userId},
            config.jwtSecret,
            {expiresIn: config.jwtExpireTime}
        );
        logger.info(`Login successful for user: ${userId}`);
        return res.status(200).json({message: "Login successful", token});
    }

    logger.warn(`Login failed: Invalid credentials for username: ${userId}`);
    return res.status(401).json({error: "Invalid username or password"});
});


export const loginRoute = router;
