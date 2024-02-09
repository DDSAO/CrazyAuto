import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

test("Postgres DB Connection Check", async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  // Attempt to connect to the database
  await client.connect();
  const result = await client.query("SELECT NOW()");

  // Verify the connection
  expect(result).toBeTruthy();

  // Release the client
  client.end();
});
