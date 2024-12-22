import pool from "../config/connection";
import logger from "../libs/logger";

const RegisteredUser: { [key: string]: string } = {
    dan: "$2b$10$vBGWMPRjt4TuEcExJj9Ha.7W6m6irYbxC0vaCNIsQvBJh.y/jHf2u",
    aaa: "$2b$10$CJzU.1Sb71Tm/ABYl/bJrOGMphxwFdO2Pyl5fBzFsnqGEvRUnAnMO"};

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

async function setUser({ userId, password }: { userId: string; password: string }): Promise<boolean> {

    const query = `
        INSERT INTO users (id, password)
        VALUES ($1, $2)
    `;
    try {
        await pool.query(query, [userId, password]);
        return true; // User successfully created
    } catch (error) {
        logger.error("Error inserting user: ", error);
        return false;
    }
}

export { getUser, setUser };

// export {RegisteredUser}