module.exports = {
    testEnvironment: "node",
    testTimeout: 30000, 
    testMatch: ["**/test/**/*.test.js"],
    setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
    setupFilesAfterEnv:["<rootDir>/test/jest.setup.js"],
    globalSetup: "<rootDir>/test/globalSetup.js",
    globalTeardown: "<rootDir>/test/globalTeardown.js",
    verbose: true,
};