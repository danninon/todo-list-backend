import { Server } from "http";
import { Socket } from "socket.io";
import { SocketHandler } from "./socketHandler";
import socketIO, { Server as IOServer } from "socket.io";

export const initSocketServer = (server: Server): void => {
    const io: IOServer = new socketIO.Server(server, {
        cors: {
            origin: (origin, callback) => {
                callback(null, true);
            },
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);

        const socketHandler:SocketHandler = new SocketHandler(socket,io);

        // Register socket event listeners
        socket.on("getTodos", () => socketHandler.handleGetTodos());
        socket.on("registerUser", (token: string) => socketHandler.handleRegisterUser(token));
        socket.on("addTodo", (xmlPayload: string) => socketHandler.handleAddTodo(xmlPayload));
        socket.on("deleteTodo", (xmlPayload: string) => socketHandler.handleDeleteTodo(xmlPayload));
        socket.on("disconnect", () => socketHandler.handleDisconnect());
    });
};
