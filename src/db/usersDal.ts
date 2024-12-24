import pool from "../config/connection";
import logger from "../libs/logger";

async function getUser(userId: string): Promise<{ userId: string; password: string } | null> {
    const query = `
        SELECT id AS "userId", password
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}

async function setUser({userId, password}: { userId: string; password: string }): Promise<boolean> {

    const query = `
        INSERT INTO users (id, password)
        VALUES ($1, $2)
    `;
    try {
        await pool.query(query, [userId, password]);
        return true;
    } catch (error) {
        logger.error("Error inserting user: ", error);
        return false;
    }
}

export {getUser, setUser};

