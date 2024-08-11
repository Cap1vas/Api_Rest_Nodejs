import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config()

const pool = mysql.createPool({
    "user": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port": process.env.PORT
});


export default pool;