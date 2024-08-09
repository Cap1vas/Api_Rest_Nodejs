import mysql from "mysql";

const pool = mysql.createPool({
    "user": "root",
    "password": '123456',
    "database": "FUNCIONAPFR",
    "host": "localhost",
    "port": 3306
});


export default pool;