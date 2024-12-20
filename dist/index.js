"use strict";
const express = require("express");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket/socket");
const { loginRoute } = require("./controllers/login");
const { todoRoute } = require("./controllers/todo");
const { PORT } = require("./config/constants");
const app = express();
const server = http.createServer(app);
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// Routes
app.use("/login", loginRoute);
app.use("/api", todoRoute);
// Initialize Socket.IO
initSocket(server);
// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
