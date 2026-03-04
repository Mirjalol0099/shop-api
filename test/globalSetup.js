require('dotenv').config({ path: ".env.test" });
const {execSync} = require('child_process');

module.exports = async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error("Database URL is required for tests");
    }

    execSync("npx prisma migrate deploy", {stdio: "inherit"});

    execSync("node test/truncate.js", {stdio: "inherit"});
};