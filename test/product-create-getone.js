require('dotenv').config({path: '.env.test'});

const request = require('supertest');
const app = require('../src/app.js');
const { unwrap, expectOk } = require('./helpers/http.js');
const { registerAndLoginAdmin } = require('./helpers/auth.js');
const { seedBrand, seedCategory } = require('./helpers/seed.js');

describe('Products: create -> getOne (i18n + m2m)', () => {
    it('ADMIN can create product with categoryIds and getOne returns localized fields', async () => {
        const token = await registerAndLoginAdmin(app);

        const brand = await seedBrand('Apple');
        const cat1 = await seedCategory('Telefon');
        const cat2 = await seedCategory('Elektronika');

        const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Iphone 15')
        .field('description', 'Yangi Model')
        .field('sourceLang', 'uz-Latn')
        .field('price', '1000')
        .field('stock', '5')
        .field('brandId', String(brand.id))
        .field('categoryIds', `${cat1.id}, ${cat2.id}`)
        .expect(201);

        expectOk(createRes);
        const created = unwrap(createRes);
        expect(created.id).toBeTruthy();

        const getRes = await request(app)
            .get(`/api/products/${created.id}?lang=ru`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expectOk(getRes);
        const product = unwrap(getRes);
        expect(typeof product.name).toBe('string');

        expect(Array.isArray(product.categories)).toBe(true);
        expect(product.categories.length).toBe(2);

        expect(product.brand).toBeTruthy();
        expect(typeof product.brand.name).toBe('string');
    });
});