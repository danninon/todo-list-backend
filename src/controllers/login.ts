import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { userConnectionTokens, RegisteredUser } from "../services/auth";

const router = express.Router();

// @ts-ignore
router.post("/", (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    if (RegisteredUser[username] && RegisteredUser[username] === password) {
        const token = uuidv4();
        userConnectionTokens[token] = username;
        return res.status(200).json({ message: "Login successful", token });
    }

    return res.status(401).json({ error: "Invalid username or password" });
});



export function isTokenValid(token: string): boolean {
    if (!token) return false; // Token is undefined or empty

    const username = userConnectionTokens[token]; // Retrieve username from the token
    if (!username) return false; // Token not mapped to any username

    return RegisteredUser.hasOwnProperty(username); // Check if the username exists in RegisteredUser
}

export const loginRoute = router;
