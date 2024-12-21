import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { userConnectionTokens, RegisteredUser } from "../services/auth";
import jwt from "jsonwebtoken";

const router = express.Router();

// @ts-ignore
router.post("/login", (req: Request, res: Response) => {
    console.log(req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    if (RegisteredUser[username] && RegisteredUser[username] === password) {
        const token = jwt.sign({ id: username, username }, "your_secret_key", { expiresIn: "1h" });
        userConnectionTokens[token] = username;
        // return res.json({ token }); // Send JWT to the client
        return res.status(200).json({ message: "Login successful", token });
    }

    return res.status(401).json({ error: "Invalid username or password" });
});

// export function isTokenValid(token: string): boolean {
//     if (!token) return false; // Token is undefined or empty
//
//     const username = userConnectionTokens[token]; // Retrieve username from the token
//     if (!username) return false; // Token not mapped to any username
//
//     return RegisteredUser.hasOwnProperty(username); // Check if the username exists in RegisteredUser
// }

export const loginRoute = router;
