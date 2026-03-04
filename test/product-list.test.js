require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const app = require('../src/app');
const { unwrap, getMeta, expectOk } = require('./helpers/http');
const { registerAndLoginAdmin } = require('./helpers/auth');
const { seedBrand, seedCategory, seedProduct } = require('./helpers/seed');

describe('Products: list (search/filter/sort/pagination)', () => {
  it('supports search + pagination meta', async () => {
    const token = await registerAndLoginAdmin(app);
    const brandA = await seedBrand('Apple');
    const brandB = await seedBrand('Samsung');
    const catPhone = await seedCategory('Telefon');
    const catTv = await seedCategory('TV');

    // 12 products: 8 iphone, 4 tv
    for (let i = 1; i <= 8; i++) {
      await seedProduct({
        name: `iPhone ${i}`,
        price: 900 + i,
        stock: i % 2 === 0 ? 0 : 5,
        brandId: brandA.id,
        categoryIds: [catPhone.id],
      });
    }
    for (let i = 1; i <= 4; i++) {
      await seedProduct({
        name: `Samsung TV ${i}`,
        price: 500 + i,
        stock: 5,
        brandId: brandB.id,
        categoryIds: [catTv.id],
      });
    }

    // search=iphone, page=1, limit=5
    const res = await request(app)
      .get('/api/products?search=iphone&page=1&limit=5&sort=price_desc')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expectOk(res);

    const data = unwrap(res);
    const meta = getMeta(res);

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(5);

    // meta
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(5);
    expect(meta.total).toBe(8);
    expect(meta.totalPages).toBe(2);

    // sort=price_desc -> birinchi element eng qimmat iphone bo'lishi kerak
    expect(String(data[0].name).toLowerCase()).toContain('iphone');
  });

  it('supports brandId + categoryId filter (M2M) and inStock', async () => {
    const token = await registerAndLoginAdmin(app);

    const brandA = await seedBrand('Apple');
    const brandB = await seedBrand('Samsung');
    const catPhone = await seedCategory('Telefon');
    const catTv = await seedCategory('TV');

    await seedProduct({
      name: 'iPhone 15',
      price: 1200,
      stock: 0,
      brandId: brandA.id,
      categoryIds: [catPhone.id],
    });

    await seedProduct({
      name: 'iPhone Case',
      price: 20,
      stock: 10,
      brandId: brandA.id,
      categoryIds: [catPhone.id],
    });

    await seedProduct({
      name: 'Samsung TV',
      price: 700,
      stock: 10,
      brandId: brandB.id,
      categoryIds: [catTv.id],
    });

    // Apple + Telefon + inStock=true => faqat iPhone Case qolishi kerak
    const res = await request(app)
      .get(`/api/products?brandId=${brandA.id}&categoryId=${catPhone.id}&inStock=true`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expectOk(res);

    const data = unwrap(res);
    expect(data.length).toBe(2);
    expect(String(data[0].name).toLowerCase()).toContain('iphone');
    expect(String(data[0].name).toLowerCase()).toContain('case');
  });
});