import {Server as IOServer, Socket} from "socket.io";
import { Builder, parseStringPromise } from "xml2js";
import { addTodo, getAllTodos, deleteTodo } from "../data/dal"; // Import todo service functions
import { userConnectionTokens } from "../services/auth";

const userSocketConnections: { [key: string]: string } = {}; // Map socket.id to userId

export class SocketHandler {
    private socket: Socket;
    private io: IOServer;

    constructor(socket: Socket, io: IOServer) {
        this.socket = socket;
        this.io = io;
    }

    async handleGetTodos() {
        const allTodos = getAllTodos();
        const xmlResponse = new Builder().buildObject({
            todos: {
                todo: allTodos, // Ensure allTodos is properly structured
            },
        });
        this.io.emit("todos", xmlResponse);
    }

    handleRegisterUser(token: string) {
        const username = userConnectionTokens[token];
        if (username) {
            userSocketConnections[this.socket.id] = username;
            console.log(`User registered: ${username} with socket: ${this.socket.id}`);
        } else {
            console.log(`Invalid token attempted for registration: ${token}`);
            this.socket.disconnect();
        }
    }

    async handleAddTodo(xmlPayload: string) {
        try {
            console.log("Received XML payload for addTodo:", xmlPayload);

            const parsedPayload = await parseStringPromise(xmlPayload, { explicitArray: false });
            const todoPayload = parsedPayload.todo;

            const userId = userSocketConnections[this.socket.id];
            if (!userId) {
                console.log(`Unauthorized attempt to add a todo from socket: ${this.socket.id}`);
                const errorResponse = new Builder().buildObject({ error: "Unauthorized" });
                this.socket.emit("error", errorResponse);
                return;
            }

            const todoWithoutID = {
                text: todoPayload.text,
                timeStamp: todoPayload.timestamp,
                userId,
            };

            const newTodo = addTodo(todoWithoutID);
            const allTodos = getAllTodos();

            const xmlTodos = {
                todos: {
                    todo: allTodos,
                },
            };

            const xmlResponse = new Builder().buildObject(xmlTodos);
            this.io.emit("todos", xmlResponse);
            console.log("New todo added:", newTodo);
        } catch (error) {
            console.error("Failed to add todo:", error);
            const errorResponse = new Builder().buildObject({ error: "Failed to add todo" });
            this.socket.emit("error", errorResponse);
        }
    }

    async handleDeleteTodo(xmlPayload: string) {
        try {
            console.log("Received XML payload for deleteTodo:", xmlPayload);

            const parsedPayload = await parseStringPromise(xmlPayload, { explicitArray: false });
            const todoId = parsedPayload.todo?.id;

            if (!todoId) {
                const errorResponse = new Builder().buildObject({ error: "Invalid payload: Missing todo ID" });
                this.socket.emit("error", errorResponse);
                return;
            }

            const userId = userSocketConnections[this.socket.id];
            if (!userId) {
                console.log(`Unauthorized delete attempt from socket: ${this.socket.id}`);
                const errorResponse = new Builder().buildObject({ error: "Unauthorized" });
                this.socket.emit("error", errorResponse);
                return;
            }

            const success = deleteTodo(todoId);
            if (success) {
                const allTodos = getAllTodos();
                const xmlResponse = new Builder().buildObject({
                    todos: {
                        todo: allTodos,
                    },
                });
                this.io.emit("todos", xmlResponse);
                console.log(`Todo with id ${todoId} deleted successfully.`);
            } else {
                const errorResponse = new Builder().buildObject({ error: "Todo not found or deletion failed" });
                this.socket.emit("error", errorResponse);
            }
        } catch (error) {
            console.error("Error deleting todo:", error);
            const errorResponse = new Builder().buildObject({ error: "Error processing deleteTodo request" });
            this.socket.emit("error", errorResponse);
        }
    }

    handleDisconnect() {
        console.log(`🔥: ${this.socket.id} user disconnected`);
        delete userSocketConnections[this.socket.id];
    }
}
