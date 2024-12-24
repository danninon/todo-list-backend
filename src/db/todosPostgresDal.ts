import {TodoItem} from "../interfaces/TodoItem";
import logger from "../libs/logger";
import pool from "../config/connection";

async function addTodo(todoItemWithoutID: Omit<TodoItem, "id">): Promise<TodoItem> {
    logger.info("Adding todo item1234:", todoItemWithoutID);


    const query = `
        INSERT INTO todo_items (text, time_stamp, user_id)
        VALUES ($1, $2, $3)
        RETURNING id, text, time_stamp AS "timeStamp", user_id AS "userId"
    `;
    const values = [todoItemWithoutID.text, todoItemWithoutID.timeStamp, todoItemWithoutID.userId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function deleteTodo(todoId: string): Promise<boolean> {
    logger.info("Deleting todo item with ID:", todoId);

    const query = `
        DELETE FROM todo_items
        WHERE id = $1
    `;
    const values = [todoId];

    const result = await pool.query(query, values);


    return result.rowCount ? result.rowCount > 0 : false;
}


async function getAllTodos(): Promise<TodoItem[]> {
    logger.info("Fetching all todos from the database");

    const query = `
        SELECT id, text, time_stamp AS "timeStamp", user_id AS "userId"
        FROM todo_items
    `;
    const result = await pool.query(query);
    return result.rows;
}


export {
    addTodo,
    deleteTodo,
    getAllTodos,
};
