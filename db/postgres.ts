import { Client } from "pg";

export const getClient = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });
  await client.connect();
  return client;
};
