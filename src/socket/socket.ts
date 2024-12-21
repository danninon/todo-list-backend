import { Server } from "http";
import { Socket } from "socket.io";
import { SocketHandler } from "./socketHandler";
import socketIO, { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken";

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
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(token, "your_secret_key");
            console.log("decoded ", decoded);
            socket.data.user = decoded; // Attach decoded user info to the socket
            next(); // Allow the connection
        } catch (err) {
            next(new Error("Authentication error: Invalid token")); // Deny the connection
        }
    });

    io.on("connection", (socket: Socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);

        const socketHandler:SocketHandler = new SocketHandler(socket,io);

        // Register socket event listeners
        socket.on("getTodos", () => socketHandler.handleGetTodos());
        // socket.on("registerUser", (token: string) => socketHandler.handleRegisterUser(token));
        socket.on("addTodo", (xmlPayload: string) => socketHandler.handleAddTodo(xmlPayload));
        socket.on("deleteTodo", (xmlPayload: string) => socketHandler.handleDeleteTodo(xmlPayload));
        socket.on("disconnect", () => socketHandler.handleDisconnect());
    });
};
