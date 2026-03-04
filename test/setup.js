require("dotenv").config({path: ".env.test"});
const {execSync, exec} = require("child_process");

beforeEach(() => {
    execSync("node test/truncate.js", {stdio: "inherit"});
})