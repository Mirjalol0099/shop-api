require("dotenv").config({path: ".env.test"});

const request = require("supertest");
const app = require("../src/app.js");
const prisma = require("../src/prismaClient.js");
const { unwrap, expectOk } = require('./helpers/http.js');
const { registerAndLoginAdmin } = require('./helpers/auth.js');

describe("Order stock rules", () => {
    it("create order decrements stock,, cancel restores stock", async () => {
        const token = await registerAndLoginAdmin(app);

        const brand = await prisma.brand.create({data: {name: {"uz-Latn": "Apple", "ru": "Apple", "uz-Cyrl": "Apple" }  }});    
        const cat = await prisma.category.create({data: {name: {"uz-Latn": "Telefon", "ru": "Телефон", "uz-Cyrl": "Телефон"}}});

        const product = await prisma.product.create({   
            data: { 
                name: {"uz-Latn": "Iphone 15", "ru": "Iphone 15", "uz-Cyrl": "Iphone 15"},
                nameKey: "iphone 15",
                price: 1000,
                stock: 5,
                brandId: brand.id,
                categories: {create: [{ categoryId: cat.id }]},
            },
        });
        //create order
        const createRes = await request(app).post("/api/orders").set("Authorization", `Bearer ${token}`).send({ items: [{productId: product.id, quantity: 2}] }).expect(201);
        expectOk(createRes);

        const order = unwrap(createRes);
        const orderId = order.id;
        expect(order.id).toBeTruthy();

        const p1 = await prisma.product.findUnique({ where: { id: product.id } });
        expect(p1.stock).toBe(3);

        //cancel order
        const cancelRes = await request(app).patch(`/api/orders/${orderId}/status`).set("Authorization", `Bearer ${token}`).send({ status: "CANCELED" }).expect(200);
        expectOk(cancelRes);

        const p2 = await prisma.product.findUnique({ where: { id: product.id } });
        expect(p2.stock).toBe(5);
    });
});