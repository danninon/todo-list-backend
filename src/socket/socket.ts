import { Server } from "http";
import { Socket } from "socket.io";
import { TodoItem } from "../interfaces/TodoItem";
import { addTodo, getAllTodos, deleteTodo } from "../data/dal"; // Import todo service functions
import { userConnectionTokens } from "../services/auth";
import socketIO, { Server as IOServer } from "socket.io";
import {TodoItemPayload} from "../interfaces/TodoItemPayload";

const userSocketConnections: { [key: string]: string } = {}; // Map socket.id to userId

export const initSocket = (server: Server): void => {
    const io: IOServer = new socketIO.Server(server, {
        cors: {
            origin: (origin, callback) => {
                callback(null, true);
            },
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);

        socket.on("registerUser", (token: string) => {
            const username = userConnectionTokens[token];
            if (username) {
                userSocketConnections[socket.id] = username;
                console.log(`User registered: ${username} with socket: ${socket.id}`);
            } else {
                console.log(`Invalid token attempted for registration: ${token}`);
                socket.disconnect();
            }
        });

        socket.on("addTodo", (todoPayload: TodoItemPayload) => {
            const userId = userSocketConnections[socket.id];
            if (!userId) {
                console.log(`Unauthorized attempt to add a todo from socket: ${socket.id}`);
                socket.emit("error", { message: "Unauthorized" }); // Emit an error message to the client
                return;
            }

            try {
                const todoWithoutID: Omit<TodoItem, "id"> = {
                    text: todoPayload.text,
                    timeStamp: new Date(todoPayload.timestamp),
                    userId: userSocketConnections[socket.id]
                };

                const newTodo = addTodo(todoWithoutID);
                const allTodos = getAllTodos();
                io.emit("todos", allTodos);

                console.log("New todo added:", newTodo);
            } catch (error) {
                console.error("Failed to add todo:", error);
                socket.emit("error", { message: "Failed to add todo" }); // Notify the client about the error
            }
        });

        socket.on("deleteTodo", ({ id }: { id: string }) => {
            const userId = userSocketConnections[socket.id];
            if (!userId) {
                console.log(`Unauthorized delete attempt from socket: ${socket.id}`);
                socket.emit("error", { message: "Unauthorized" });
                return;
            }

            try {
                const success = deleteTodo(id);
                if (success) {
                    const allTodos = getAllTodos(); // Retrieve the updated todo list
                    io.emit("todos", allTodos); // Broadcast the updated list to all clients
                    console.log(`Todo with id ${id} deleted successfully.`);
                } else {
                    console.log(`Failed to delete todo with id ${id}.`);
                    socket.emit("error", { message: "Todo not found or deletion failed" });
                }
            } catch (error) {
                console.error("Error deleting todo:", error);
                socket.emit("error", { message: "Error deleting todo" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔥: ${socket.id} user disconnected`);
            delete userSocketConnections[socket.id];
        });
    });
};
