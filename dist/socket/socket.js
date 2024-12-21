"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const dal_1 = require("../data/dal"); // Import todo service functions
const auth_1 = require("../services/auth");
const socket_io_1 = __importDefault(require("socket.io"));
const userSocketConnections = {}; // Map socket.id to userId
const initSocket = (server) => {
    const io = new socket_io_1.default.Server(server, {
        cors: {
            origin: (origin, callback) => {
                callback(null, true);
            },
        },
    });
    io.on("connection", (socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);
        socket.on("registerUser", (token) => {
            const username = auth_1.userConnectionTokens[token];
            if (username) {
                userSocketConnections[socket.id] = username;
                console.log(`User registered: ${username} with socket: ${socket.id}`);
            }
            else {
                console.log(`Invalid token attempted for registration: ${token}`);
                socket.disconnect();
            }
        });
        socket.on("addTodo", (todoPayload) => {
            const userId = userSocketConnections[socket.id];
            if (!userId) {
                console.log(`Unauthorized attempt to add a todo from socket: ${socket.id}`);
                socket.emit("error", { message: "Unauthorized" }); // Emit an error message to the client
                return;
            }
            try {
                const todoWithoutID = {
                    text: todoPayload.text,
                    timeStamp: new Date(todoPayload.timestamp),
                    userId: userSocketConnections[socket.id]
                };
                const newTodo = (0, dal_1.addTodo)(todoWithoutID);
                const allTodos = (0, dal_1.getAllTodos)();
                io.emit("todos", allTodos);
                console.log("New todo added:", newTodo);
            }
            catch (error) {
                console.error("Failed to add todo:", error);
                socket.emit("error", { message: "Failed to add todo" }); // Notify the client about the error
            }
        });
        socket.on("disconnect", () => {
            console.log(`🔥: ${socket.id} user disconnected`);
            delete userSocketConnections[socket.id];
        });
    });
};
exports.initSocket = initSocket;
