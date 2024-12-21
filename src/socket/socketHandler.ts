import {Server as IOServer, Socket} from "socket.io";
import { Builder, parseStringPromise } from "xml2js";
import { addTodo, getAllTodos, deleteTodo } from "../data/dal"; // Import todo service functions
import { userConnectionTokens } from "../services/auth";
import {DataValidator} from "../data/validator";
import  logger  from "../libs/logger";

const userSocketConnections: { [key: string]: string } = {}; // Map socket.id to userId

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
            const errorResponse = new Builder().buildObject({ error: "Unauthorized" });
            this.socket.emit("error", errorResponse);
            return;
        }

        const allTodos = getAllTodos();
        const xmlResponse = new Builder().buildObject({
            todos: {
                todo: allTodos, // Ensure allTodos is properly structured
            },
        });
        this.io.emit("todos", xmlResponse);
    }

    async handleAddTodo(xmlPayload: string) {
        try {
            logger.info("Received XML payload for addTodo:", xmlPayload);
            // console.log('socket.data.user',this.socket.data.user)

            const parsedPayload = await parseStringPromise(xmlPayload, { explicitArray: false });
            const todoPayload = parsedPayload.todo;

            const userId = this.socket.data.user.id;
            if (!userId) {
                logger.warn(`Unauthorized attempt to add a todo from socket: ${this.socket.id}`);
                const errorResponse = new Builder().buildObject({ error: "Unauthorized" });
                this.socket.emit("error", errorResponse);
                return;
            }

            const todoWithoutID = {
                text: todoPayload.text,
                timeStamp: todoPayload.timestamp,
                userId,
            };

           this.dataValidator.validate(todoWithoutID);

            const newTodo = addTodo(todoWithoutID);
            const allTodos = getAllTodos();

            const xmlTodos = {
                todos: {
                    todo: allTodos,
                },
            };

            const xmlResponse = new Builder().buildObject(xmlTodos);
            this.io.emit("todos", xmlResponse);
            logger.info(`New xmlResponse: ${xmlResponse}`);
        } catch (error) {
            const errorMessage = `Failed to add todo: ${error}`;
            logger.error(errorMessage);
            const errorResponse = new Builder().buildObject({ error: errorMessage});
            this.socket.emit("error", errorResponse);
        }
    }

    //TODO?: add validation
    async handleDeleteTodo(xmlPayload: string) {
        try {
            logger.info(`Received XML payload for deleteTodo: ${xmlPayload}`);

            const parsedPayload = await parseStringPromise(xmlPayload, { explicitArray: false });
            const todoId = parsedPayload.todo?.id;

            if (!todoId) {
                logger.error(`Invalid payload: Missing todo ID`);
                const errorResponse = new Builder().buildObject({ error: "Invalid payload: Missing todo ID" });
                this.socket.emit("error", errorResponse);
                return;
            }

            const userId = this.socket.data.user.id;
            if (!userId) {
                logger.warn(`Unauthorized delete attempt from socket: ${this.socket.id}`);
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
                logger.info(`Todo with id ${todoId} deleted successfully.`);
            } else {
                const errorResponse = new Builder().buildObject({ error: "Todo not found or deletion failed" });
                logger.warn("Todo not found or deletion failed");
                this.socket.emit("error", errorResponse);
            }
        } catch (error) {
            logger.error("Error deleting todo:", error);
            const errorResponse = new Builder().buildObject({ error: "Error processing deleteTodo request" });
            this.socket.emit("error", errorResponse);
        }
    }

    handleDisconnect() {
        console.info(`🔥: ${this.socket.id} user disconnected`);
        delete userSocketConnections[this.socket.id];
    }
}
