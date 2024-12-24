import {Pool} from "pg";

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'todo_user',
    password: process.env.DB_PASSWORD || 'todo_pass',
    database: process.env.DB_NAME || 'todo_db',
});

export default pool;
