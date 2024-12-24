import {Server as IOServer, Socket} from "socket.io";
import {Builder, parseStringPromise} from "xml2js";
import {addTodo, deleteTodo, getAllTodos} from "../db/todosPostgresDal";
import {DataValidator} from "../db/validator";
import logger from "../libs/logger";

const userSocketConnections: { [key: string]: string } = {};

export class SocketHandler {
    private socket: Socket;
    private io: IOServer;
    private dataValidator: DataValidator;

    constructor(socket: Socket, io: IOServer) {
        this.socket = socket;
        this.io = io;
        this.dataValidator = new DataValidator();
    }

    async handleGetTodos() {
        const userId = this.socket.data.user.id;
        if (!userId) {
            logger.warn(`Unauthorized attempt to add a todo from socket: ${this.socket.id}`);
            const errorResponse = new Builder().buildObject({error: "Unauthorized"});
            this.socket.emit("error", errorResponse);
            return;
        }

        const allTodos = await getAllTodos();
        const xmlResponse = new Builder().buildObject({
            todos: {
                todo: allTodos,
            },
        });
        this.io.emit("todos", xmlResponse);
    }

    async handleAddTodo(xmlPayload: string) {
        try {
            logger.info("Received XML payload for addTodo:", xmlPayload);
            const parsedPayload = await parseStringPromise(xmlPayload, {explicitArray: false});
            const todoPayload = parsedPayload.todo;

            const userId = this.socket.data.user.id;
            if (!userId) {
                logger.warn(`Unauthorized attempt to add a todo from socket: ${this.socket.id}`);
                const errorResponse = new Builder().buildObject({error: "Unauthorized"});
                this.socket.emit("error", errorResponse);
                return;
            }

            const todoWithoutID = {
                text: todoPayload.text,
                timeStamp: todoPayload.timestamp,
                userId,
            };
            this.dataValidator.validate(todoWithoutID);
            const newTodo = await addTodo(todoWithoutID);
            const allTodos = await getAllTodos();
            const xmlTodos = {
                todos: {
                    todo: allTodos,
                },
            };

            const xmlResponse = new Builder().buildObject(xmlTodos);
            this.io.emit("todos", xmlResponse);
            // logger.info(`New xmlResponse: ${xmlResponse}`);
        } catch (error) {
            const errorMessage = `Failed to add todo: ${error}`;
            logger.error(errorMessage);
            const errorResponse = new Builder().buildObject({error: errorMessage});
            this.socket.emit("error", errorResponse);
        }
    }

    async handleDeleteTodo(xmlPayload: string) {
        try {
            logger.info(`Received XML payload for deleteTodo: ${xmlPayload}`);
            const parsedPayload = await parseStringPromise(xmlPayload, {explicitArray: false});
            const todoId = parsedPayload.todo?.id;
            if (!todoId) {
                logger.error(`Invalid payload: Missing todo ID`);
                const errorResponse = new Builder().buildObject({error: "Invalid payload: Missing todo ID"});
                this.socket.emit("error", errorResponse);
                return;
            }

            const userId = this.socket.data.user.id;
            if (!userId) {
                logger.warn(`Unauthorized delete attempt from socket: ${this.socket.id}`);
                const errorResponse = new Builder().buildObject({error: "Unauthorized"});
                this.socket.emit("error", errorResponse);
                return;
            }

            const success = await deleteTodo(todoId);
            if (success) {
                const allTodos = await getAllTodos();
                const xmlResponse = new Builder().buildObject({
                    todos: {
                        todo: allTodos,
                    },
                });
                this.io.emit("todos", xmlResponse);
                logger.info(`Todo with id ${todoId} deleted successfully.`);
            } else {
                const errorResponse = new Builder().buildObject({error: "Todo not found or deletion failed"});
                logger.warn("Todo not found or deletion failed");
                this.socket.emit("error", errorResponse);
            }
        } catch (error) {
            logger.error("Error deleting todo:", error);
            const errorResponse = new Builder().buildObject({error: "Error processing deleteTodo request"});
            this.socket.emit("error", errorResponse);
        }
    }

    handleDisconnect() {
        console.info(`🔥: ${this.socket.id} user disconnected`);
        delete userSocketConnections[this.socket.id];
    }
}
