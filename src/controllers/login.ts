import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../libs/logger";
import config from "../config/default";

import {RegisteredUser} from "../db/usersDal";

const router = express.Router();

// @ts-ignore
router.post("/login", async (req: Request, res: Response) => {
    logger.info("Received login request");

    const { username, password } = req.body;


    if (!username || !password) {
        logger.warn("Login failed: Missing username or password in request");
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    const hashedPassword = RegisteredUser[username]; // Get stored hashed password
    if (!hashedPassword) {
        logger.warn(`Login failed: User ${username} not found`);
        return res.status(401).json({ error: "Invalid username or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, hashedPassword); // Compare passwords
    if (isPasswordValid) {
        const token = jwt.sign(
    // { id: username, username },
            {id: username},
            config.jwtSecret,
    { expiresIn: config.jwtExpireTime }
        );
        logger.info(`Login successful for user: ${username}`);
        return res.status(200).json({ message: "Login successful", token });
    }

    logger.warn(`Login failed: Invalid credentials for username: ${username}`);
    return res.status(401).json({ error: "Invalid username or password" });
});


export const loginRoute = router;
