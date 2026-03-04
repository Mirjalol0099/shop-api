function unwrap(res) {
    //Supertest res
    const body = res.body;
    if (!body || typeof body !== "object") return body;

    if (body.success === true && 'data' in body) return body.data;
    return body;
}

function getMeta(res) {
    return res.body?.meta;
}

function expectOk(res) {
    expect(res.body).toBeTruthy();
    expect(res.body.success).toBe(true);
    expect('data' in res.body).toBe(true);
}

function expectFail(res) {
    expect(res.body).toBeTruthy();
    expect(res.body.success).toBe(false);
    expect(typeof res.body.message).toBe('string');
    expect(res.body.requestId).toBeTruthy();
}

module.exports = { unwrap, getMeta, expectFail, expectOk };