"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoRoute = void 0;
const express_1 = __importDefault(require("express"));
const dal_1 = require("../data/dal"); // Import the getAllTodos function
const router = express_1.default.Router();
// Route to fetch all todos
router.get("/", (req, res) => {
    try {
        const todos = (0, dal_1.getAllTodos)(); // Retrieve all todos from the service
        res.status(200).json(todos); // Respond with the todos
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve todos" });
    }
});
exports.todoRoute = router;
