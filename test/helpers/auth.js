// test/helpers/auth.js

const request = require('supertest');
const { unwrap } = require('./http');

const uniq = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

async function registerAndLogin(app, { name, email, password, role } = {}) {
  const _name = name ?? 'Test User';
  const _role = role ?? 'USER';
  const _password = password ?? '123456';
  const _email = email ?? `${_role.toLowerCase()}_${uniq()}@test.local`;

  const regRes = await request(app)
    .post('/api/auth/register')
    .send({ name: _name, email: _email, password: _password, role: _role });

  // Agar allaqachon bor bo‘lsa ham testlar yiqilmasin: login qilib ketamiz
  if (regRes.status !== 200) {
    if (regRes.body?.message !== 'User already exists') {
      // boshqa xato bo‘lsa, yiqilsin
      // eslint-disable-next-line no-console
      console.error('REGISTER FAILED:', regRes.status, regRes.body);
      throw new Error(`Register failed: ${regRes.status} ${regRes.body?.message || ''}`);
    }
  }

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: _email, password: _password })
    .expect(200);

  const data = unwrap(loginRes);
  if (!data?.token) throw new Error('Token not found in response wrapper');
  return data.token;
}

module.exports = { registerAndLogin };

async function registerAndLoginAdmin(app) {
  return registerAndLogin(app, {
    name: 'Admin',
    email: 'admin@mail.com',
    password: '123456',
    role: 'ADMIN',
  });
}

async function registerAndLoginUser(app) {
  return registerAndLogin(app, {
    name: 'User',
    email: 'user@mail.com',
    password: '123456',
    role: 'USER',
  });
}

module.exports = { registerAndLoginAdmin, registerAndLoginUser };