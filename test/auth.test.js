jest.mock('../src/services/translate.service.js', () => require('./_mock_/translate.service.js'));
require("dotenv").config({path: ".env.test"});

const request = require("supertest");
const app = require("../src/app.js");
const { unwrap, expectOk } = require('./helpers/http.js');
 
describe("Auth", () => {
    it("register -> login returns token (wrapped)", async () => {
        const regRes = await request(app).post("/api/auth/register").send({
            name: "Test",
            email: "test@mail.com",
            password: "123456",
            role: "ADMIN",
        }).expect(200);
        expectOk(regRes);
        
        const loginRes = await request(app).post("/api/auth/login").send({
            email: "test@mail.com",
            password: "123456",
        }).expect(200);
        expectOk(loginRes);

        //expect(res.body.data.token).toBeTruthy();
        const data = unwrap(loginRes);
        expect(data.token).toBeTruthy();    
    });
});