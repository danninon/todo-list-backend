import { Pool } from "pg";

const pool = new Pool({
    user: "todo_user",       // Database username
    host: "localhost",       // Database host
    database: "todo_db",     // Database name
    password: "todo_pass",   // Database password
    port: 5432,              // Database port
});

export default pool;
