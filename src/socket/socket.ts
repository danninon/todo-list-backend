import { Server } from "http";
import { Socket } from "socket.io";
import { TodoItem } from "../interfaces/TodoItem";
import { addTodo, getAllTodos, deleteTodo } from "../data/dal"; // Import todo service functions
import { userConnectionTokens } from "../services/auth";
import socketIO, { Server as IOServer } from "socket.io";
import { parseStringPromise, Builder } from "xml2js";

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

        socket.on("getTodos", () => {
            const allTodos = getAllTodos(); // Retrieve the current list of todos
            const xmlResponse = new Builder().buildObject({
                todos: {
                    todo: allTodos, // Ensure allTodos is properly structured
                },
            });
            socket.emit("todos", xmlResponse); // Send the XML response to the client
        });

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

        socket.on("addTodo", async (xmlPayload: string) => {
            try {
                console.log("xmlPayload ", xmlPayload);

                // Parse the incoming XML payload to a JavaScript object
                const parsedPayload = await parseStringPromise(xmlPayload, {
                    explicitArray: false,
                });
                console.log("parsedPayload ", parsedPayload);

                const todoPayload = parsedPayload.todo; // Extract the todo object

                // Check if the user is authorized
                const userId = userSocketConnections[socket.id];
                if (!userId) {
                    console.log(`Unauthorized attempt to add a todo from socket: ${socket.id}`);
                    const errorResponse = new Builder().buildObject({ error: "Unauthorized" });
                    socket.emit("error", errorResponse); // Emit an error in XML format
                    return;
                }

                // Construct the TodoItem object without an ID
                const todoWithoutID: Omit<TodoItem, "id"> = {
                    text: todoPayload.text,
                    timeStamp: todoPayload.timestamp,
                    userId,
                };

                // Add the todo and retrieve the updated list
                const newTodo = addTodo(todoWithoutID);
                const allTodos = getAllTodos();

                // Construct the XML response with proper nesting
                const xmlTodos = {
                    todos: {
                        todo: allTodos, // Ensure allTodos is an array of properly structured items
                    },
                };

                console.log('xmlTodos ', JSON.stringify(xmlTodos));

                // Convert the JavaScript object to XML
                const xmlResponse = new Builder().buildObject(xmlTodos);

                console.log('xmlResponse ', xmlResponse);


                io.emit("todos", xmlResponse); // Emit the updated todo list in XML format
                console.log("New todo added:", newTodo);
            } catch (error) {
                console.error("Failed to add todo:", error);
                const errorResponse = new Builder().buildObject({ error: "Failed to add todo" });
                socket.emit("error", errorResponse); // Emit an error in XML format
            }
        });

        socket.on("deleteTodo", async (xmlPayload: string) => {
            try {
                console.log("Received XML payload for deleteTodo:", xmlPayload);

                // Parse the incoming XML payload to extract the todo ID
                const parsedPayload = await parseStringPromise(xmlPayload, {
                    explicitArray: false,
                });
                console.log("Parsed deleteTodo payload:", parsedPayload);

                const todoId = parsedPayload.todo?.id; // Extract the todo ID
                if (!todoId) {
                    const errorResponse = new Builder().buildObject({ error: "Invalid payload: Missing todo ID" });
                    socket.emit("error", errorResponse);
                    return;
                }

                // Check if the user is authorized
                const userId = userSocketConnections[socket.id];
                if (!userId) {
                    console.log(`Unauthorized delete attempt from socket: ${socket.id}`);
                    const errorResponse = new Builder().buildObject({ error: "Unauthorized" });
                    socket.emit("error", errorResponse);
                    return;
                }

                // Attempt to delete the todo
                const success = deleteTodo(todoId);
                if (success) {
                    const allTodos = getAllTodos(); // Retrieve the updated todo list

                    // Construct the XML response for the updated list
                    const xmlResponse = new Builder().buildObject({
                        todos: {
                            todo: allTodos, // Ensure allTodos is properly structured
                        },
                    });
                    io.emit("todos", xmlResponse); // Broadcast the updated list in XML format
                    console.log(`Todo with id ${todoId} deleted successfully.`);
                } else {
                    console.log(`Failed to delete todo with id ${todoId}.`);
                    const errorResponse = new Builder().buildObject({ error: "Todo not found or deletion failed" });
                    socket.emit("error", errorResponse);
                }
            } catch (error) {
                console.error("Error deleting todo:", error);
                const errorResponse = new Builder().buildObject({ error: "Error processing deleteTodo request" });
                socket.emit("error", errorResponse);
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔥: ${socket.id} user disconnected`);
            delete userSocketConnections[socket.id];
        });
    });
};
