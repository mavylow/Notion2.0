import pkg from "pg";
const { Pool } = pkg;

const isProduction = !!process.env.DATABASE_URL;

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "NotionObsidian",
        password: process.env.DB_PASSWORD || "qwerty",
        port: process.env.DB_PORT || 5432,
      }
);

pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.stack);
  });

pool.on("error", (err) => {
  console.error("❌ Unexpected DB error:", err);
});

export default pool;
