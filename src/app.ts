import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { initSocketServer } from "./socket/socket";
import { loginRoute } from "./controllers/login";
import logger from "./libs/logger"; // Ensure logger is imported
import config from "./config/default";
import {registerRoute} from "./controllers/register";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Routes
app.use("/auth", registerRoute);
app.use("/auth", loginRoute);
// app.use("/api", todoRoute);

// Serve the frontend
const frontendPath = path.join(__dirname, "../../client/dist"); // Adjust path as needed
app.use(express.static(frontendPath));
logger.info("Serving frontend from:", frontendPath);
//
// app.get("*", (req, res) => {
//     // logger.info("Serving react files...");
//     res.sendFile(path.resolve(frontendPath, "index.html"));
// });

// Initialize Socket.IO
initSocketServer(server);

// Start the server
server.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
});
