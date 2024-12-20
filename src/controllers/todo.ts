import express, { Request, Response } from "express";
import { getAllTodos } from "../data/todosDBConnctor"; // Import the getAllTodos function
import { TodoItem } from "../interfaces/TodoItem"; // Import the TodoItem interface

const router = express.Router();

// Route to fetch all todos
router.get("/", (req: Request, res: Response) => {
    try {
        const todos: TodoItem[] = getAllTodos(); // Retrieve all todos from the service
        res.status(200).json(todos); // Respond with the todos
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve todos" });
    }
});

export const todoRoute = router;
