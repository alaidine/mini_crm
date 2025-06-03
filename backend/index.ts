import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mysql, { ConnectionOptions } from "mysql2/promise";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const access: ConnectionOptions = {
  user: process.env.MARIADB_ROOT,
  password: process.env.MARIADB_ROOT_PASS,
  database: "my_crm",
};

app.use(bodyParser.json());

app.get("/", (request: Request, response: Response) => { 
  response.status(200).send("Hello World");
}); 

app.get("/users", async (request: Request, response: Response) => {
  const conn = await mysql.createConnection(access);
  const [ rows, fileds ] = await conn.execute("SELECT id, email, role from users;");
  response.status(200).send(rows);
  await conn.end();
});

app.get("/contacts", async (request: Request, response: Response) => {
  const conn = await mysql.createConnection(access);
  const [ rows, fileds ] = await conn.execute("SELECT * from contacts;");
  response.status(200).send(rows);
  await conn.end();
});

app.post("/auth/register", async (request: Request, response: Response) => {
  const conn = await mysql.createConnection(access);
  console.log(request.body);
  bcrypt.hash(request.body.password, 10, async function (err, hash) {
    const result = await conn.execute(`INSERT INTO users (email, role, password_hash) VALUES (${request.body.email}, ${request.body.role}, ${hash});`)
  })
  response.status(200);
  await conn.end();
});

app.listen(PORT, () => { 
  console.log("Server running at PORT: ", PORT); 
}).on("error", (error) => {
  // gracefully handle error
  throw new Error(error.message);
});
