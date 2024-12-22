import express from "express";
import cors from "cors";
import http from "http";
import { initSocketServer } from "./socket/socket";
import { loginRoute } from "./controllers/login";
// import { todoRoute } from "./controllers/todo";
import  logger  from "./libs/logger"; // Ensure logger is imported
import config from './config/default';
import {registerUser} from "./libs/register";
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Routes
app.use("/auth", loginRoute);
// app.use("/api", todoRoute);

// Initialize Socket.IO
initSocketServer(server);
// Start the server
server.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
});
