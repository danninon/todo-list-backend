"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRoute = void 0;
exports.isTokenValid = isTokenValid;
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const auth_1 = require("../services/auth");
const router = express_1.default.Router();
// @ts-ignore
router.post("/", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    if (auth_1.RegisteredUser[username] && auth_1.RegisteredUser[username] === password) {
        const token = (0, uuid_1.v4)();
        auth_1.userConnectionTokens[token] = username;
        return res.status(200).json({ message: "Login successful", token });
    }
    return res.status(401).json({ error: "Invalid username or password" });
});
function isTokenValid(token) {
    if (!token)
        return false; // Token is undefined or empty
    const username = auth_1.userConnectionTokens[token]; // Retrieve username from the token
    if (!username)
        return false; // Token not mapped to any username
    return auth_1.RegisteredUser.hasOwnProperty(username); // Check if the username exists in RegisteredUser
}
exports.loginRoute = router;
