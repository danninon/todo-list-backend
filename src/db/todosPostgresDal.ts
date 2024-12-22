import {TodoItem} from "../interfaces/TodoItem";
import { v4 as uuidv4 } from "uuid";
import logger from "../libs/logger";
import pool from "../config/connection";

let todoList:TodoItem[] = []; // A centralized in-memory storage for todos


async function addTodo(todoItemWithoutID: Omit<TodoItem, "id">): Promise<TodoItem> {
    logger.info("Adding todo item1234:", todoItemWithoutID);

    // SQL query to insert the todo into the database
    const query = `
        INSERT INTO todo_items (text, time_stamp, user_id)
        VALUES ($1, $2, $3)
        RETURNING id, text, time_stamp AS "timeStamp", user_id AS "userId"
    `;

    // Values for the query
    const values = [todoItemWithoutID.text, todoItemWithoutID.timeStamp, todoItemWithoutID.userId];
    logger.info("values:", values);
    // Execute the query
    const result = await pool.query(query, values);
    logger.info("result:", result);
    // Return the newly added todo item

    return result.rows[0];

}


// Function to add a new todo
// function addTodo(todoItemWithoutID:Omit<TodoItem, "id">):TodoItem {
//     logger.info("Adding todo item with ID:", todoItemWithoutID);
//     const todoItem: TodoItem = {
//         ...todoItemWithoutID,
//         id: uuidv4(), // Generate a unique ID
//     };
//     // Add the todo to the beginning of the list
//     todoList.unshift(todoItem);
//     return todoItem; // Return the added todo for confirmation
// }

// // Function to delete a todo by ID
async function deleteTodo(todoId: string): Promise<boolean> {
    logger.info("Deleting todo item with ID:", todoId);

    const query = `
        DELETE FROM todo_items
        WHERE id = $1
    `;
    const values = [todoId];

    const result = await pool.query(query, values);

    // Return true if at least one row was deleted
    return result.rowCount ? result.rowCount > 0 : false;
}

// Function to get all todos
async function getAllTodos(): Promise<TodoItem[]> {
    logger.info("Fetching all todos from the database");

    const query = `
        SELECT id, text, time_stamp AS "timeStamp", user_id AS "userId"
        FROM todo_items
    `;

    const result = await pool.query(query);
    logger.info("result: ", result);
    // Return all todo items as an array
    return result.rows;
}



// Export the functions
export {
    addTodo,
    deleteTodo,
    getAllTodos,
};
