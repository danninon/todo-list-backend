const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { userConnectionTokens, RegisteredUser } = require("../services/auth");

const router = express.Router();

router.post("/", (req, res) => {
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

module.exports = { loginRoute: router };
