import {TodoItem} from "../interfaces/TodoItem";
import { v4 as uuidv4 } from "uuid";

let todoList:TodoItem[] = []; // A centralized in-memory storage for todos

// Function to add a new todo
function addTodo(todoItemWithoutID:Omit<TodoItem, "id">):TodoItem {

    const todoItem: TodoItem = {
        ...todoItemWithoutID,
        id: uuidv4(), // Generate a unique ID
    };
    // Add the todo to the beginning of the list
    todoList.unshift(todoItem);
    return todoItem; // Return the added todo for confirmation
}

// Function to delete a todo by ID
function deleteTodo(todoId:string):boolean {
    const initialLength = todoList.length; // Save the initial length of the list

    // Filter out the TodoItem with the matching ID
    todoList = todoList.filter((todo) => todo.id !== todoId);

    // Check if the length has changed (indicating deletion occurred)
    return todoList.length < initialLength;
}

// Function to get all todos
function getAllTodos():TodoItem[] {
    return todoList; // Simply return the entire todo list
}


// Export the functions
export {
    addTodo,
    deleteTodo,
    getAllTodos,
};
