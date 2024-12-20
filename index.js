const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const url = require("url");
const { v4: uuidv4 } = require("uuid"); // For generating unique tokens

const app = express();
const PORT = 4000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let todoList = [];

//connected - live
let userSocketConnections = {}; // Map socket.id to userId

//connected - live
let userConnectionTokens = {};

let RegisteredUser = {"dan":"123", "aaa":"1234"};


// Create HTTP server
const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin: (origin, callback) => {
            // Allow all origins in development
            callback(null, true);
        },
    },
});

// Socket.IO event handling
io.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("registerUser", (token) => {
        console.log("in registerUser " + token);
        const username = userConnectionTokens[token]; // Validate the token
        if (username) {
            userSocketConnections[socket.id] = username; // Map socket.id to username
            console.log(`User registered: ${username} with socket: ${socket.id}`);
        } else {
            console.log(`Invalid token attempted for registration: ${token}`);
            socket.disconnect(); // Disconnect if the token is invalid
        }
    });

    socket.on("addTodo", (todo) => {
        const userId = userSocketConnections[socket.id]; // Infer user from socket

        // Check if user is authenticated
        if (!userId) {
            console.log(`Unauthorized attempt to add a todo from socket: ${socket.id}`);
            return;
        }

        // Add timestamp and userId to todo
        const todoWithMetadata = {
            ...todo,
            userId,
            timestamp: new Date().toISOString(),
        };

        // Add todo to list
        todoList.unshift(todoWithMetadata);

        // Broadcast updated todo list to all clients
        io.emit("todos", todoList);

        console.log("New todo added:", todoWithMetadata);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`🔥: ${socket.id} user disconnected`);
        delete userSocketConnections[socket.id];
    });
});

// REST endpoint for login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // Authenticate user
    if (RegisteredUser[username] && RegisteredUser[username] === password) {
        const token = uuidv4(); // Generate a unique token
        console.log(token);
        userConnectionTokens[token] = username; // Map the token to the username
        return res.status(200).json({ message: "Login successful", token });
    }

    // Invalid credentials
    return res.status(401).json({ error: "Invalid username or password" });
});


// REST endpoint for retrieving todos
app.get("/api", (req, res) => {
    res.json(todoList);
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
