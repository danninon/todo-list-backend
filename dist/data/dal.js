"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTodo = addTodo;
exports.getAllTodos = getAllTodos;
const uuid_1 = require("uuid");
let todoList = []; // A centralized in-memory storage for todos
// Function to add a new todo
function addTodo(todoItemWithoutID) {
    const todoItem = {
        ...todoItemWithoutID,
        id: (0, uuid_1.v4)(), // Generate a unique ID
    };
    // Add the todo to the beginning of the list
    todoList.unshift(todoItem);
    return todoItem; // Return the added todo for confirmation
}
// Function to delete a todo by ID
// function deleteTodo(todoID) {
//     const initialLength = todoList.length;
//
//     // Filter out the todo with the matching ID
//     todoList = todoList.filter((todo) => todo.id !== todoID);
//
//     // Return true if a todo was deleted, false otherwise
//     return initialLength !== todoList.length;
// }
// Function to get all todos
function getAllTodos() {
    return todoList; // Simply return the entire todo list
}
