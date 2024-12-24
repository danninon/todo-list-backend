import {Server} from "http";
import socketIO, {Server as IOServer, Socket} from "socket.io";
import {SocketHandler} from "./socketHandler";
import jwt from "jsonwebtoken";
import logger from "../libs/logger";
import config from "../config/default";

export const initSocketServer = (server: Server): void => {
    const io: IOServer = new socketIO.Server(server, {
        cors: {
            origin: (origin, callback) => {
                callback(null, true);
            },
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            logger.error("Authentication error: No token provided");
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            console.log(token);
            const decoded = jwt.verify(token, config.jwtSecret);
            socket.data.user = decoded;
            next();
        } catch (err) {
            logger.error("Authentication error: Invalid token");
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket: Socket) => {
        logger.info(`⚡: ${socket.id} user just connected!`);
        const socketHandler: SocketHandler = new SocketHandler(socket, io);
        socket.on("getTodos", () => socketHandler.handleGetTodos());
        socket.on("addTodo", (xmlPayload: string) => socketHandler.handleAddTodo(xmlPayload));
        socket.on("deleteTodo", (xmlPayload: string) => socketHandler.handleDeleteTodo(xmlPayload));
        socket.on("disconnect", () => socketHandler.handleDisconnect());
    });
};
