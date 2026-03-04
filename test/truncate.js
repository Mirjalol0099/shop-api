require('dotenv').config({ path: ".env.test" });

const { Client } = require("pg");

(async () => {
    const client = new Client({connectionString: process.env.DATABASE_URL});
    await client.connect();

    const { rows } = await client.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname='public'`);

    const tables = rows.map(r => `"public"."${r.tablename}"`).filter(t => !t.includes("_prisma_migrations"));

    if (tables.length) {
        await client.query(`TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE;`);
    }

    await client.end();
}) ();