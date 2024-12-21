import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { userConnectionTokens, RegisteredUser } from "../services/auth";
import jwt from "jsonwebtoken";
import logger from "../libs/logger";

const router = express.Router();

// @ts-ignore
router.post("/login", (req: Request, res: Response) => {
    logger.info("Received login request");

    const { username, password } = req.body;

    if (!username || !password) {
        logger.warn("Login failed: Missing username or password in request");
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    if (RegisteredUser[username] && RegisteredUser[username] === password) {
        const token = jwt.sign({ id: username, username }, "your_secret_key", { expiresIn: "1h" });
        userConnectionTokens[token] = username;

        logger.info(`Login successful for user: ${username}`);
        return res.status(200).json({ message: "Login successful", token });
    }

    logger.warn(`Login failed: Invalid credentials for username: ${username}`);
    return res.status(401).json({ error: "Invalid username or password" });
});


export const loginRoute = router;
