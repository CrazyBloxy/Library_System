import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Makes New Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Connects to backend
pool.on("connect", () => {
    console.log("Connected to the database");
});

// Handles Error 
pool.on("error", (err: Error) => {
    console.error("Database error", err);
});


export default pool;