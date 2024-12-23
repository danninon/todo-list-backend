CREATE TABLE todo_items (
    id SERIAL PRIMARY KEY,          -- Auto-incrementing integer ID
    text TEXT NOT NULL,             -- The text of the todo
    time_stamp TEXT NOT NULL,       -- Timestamp in string format
    user_id VARCHAR(255) NOT NULL   -- User ID
);

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY, -- Unique user ID
    password TEXT NOT NULL       -- Hashed password
);