"use strict";
const express = require("express");
const { getAllTodos } = require("../data/todosDBConnctor"); // Import the getAllTodos function
const router = express.Router();
// Route to fetch all todos
router.get("/", (req, res) => {
    try {
        const todos = getAllTodos(); // Retrieve all todos from the service
        res.status(200).json(todos); // Respond with the todos
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve todos" });
    }
});
module.exports = { todoRoute: router };
