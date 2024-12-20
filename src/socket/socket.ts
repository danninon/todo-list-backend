const socketIO = require("socket.io");
const { userConnectionTokens } = require("../services/auth");
const { addTodo, getAllTodos } = require("../data/todosDBConnctor"); // Import todo service functions

let todoList = []; // Move this to a service layer in future iterations
const userSocketConnections = {}; // Map socket.id to userId

const initSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: (origin, callback) => {
                callback(null, true);
            },
        },
    });

    io.on("connection", (socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);

        socket.on("registerUser", (token) => {
            const username = userConnectionTokens[token];
            if (username) {
                userSocketConnections[socket.id] = username;
                console.log(`User registered: ${username} with socket: ${socket.id}`);
            } else {
                console.log(`Invalid token attempted for registration: ${token}`);
                socket.disconnect();
            }
        });

        socket.on("addTodo", (todo) => {
            const userId = userSocketConnections[socket.id];
            if (!userId) {
                console.log(`Unauthorized attempt to add a todo from socket: ${socket.id}`);
                socket.emit("error", { message: "Unauthorized" }); // Emit an error message to the client
                return;
            }

            try {
                // Add metadata to the todo
                const todoWithMetadata = {
                    ...todo,
                    userId,
                    timestamp: new Date().toISOString(),
                };

                // Add the todo using the service
                const newTodo = addTodo(todoWithMetadata);

                // Emit the updated todo list to all clients
                const allTodos = getAllTodos();
                io.emit("todos", allTodos);

                console.log("New todo added:", newTodo);
            } catch (error) {
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

module.exports = { initSocket };
