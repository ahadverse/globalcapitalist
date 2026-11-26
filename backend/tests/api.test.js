const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const app = require('../server');
const { generateSlug } = require('../utils/generateSlug');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test('root endpoint describes the API', async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result, {
    name: 'globalcapitalist API',
    status: 'running',
    database: 'disconnected',
  });
});

test('health endpoint is not exposed separately', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Route not found' });
});

test('site content endpoint reports when the database is unavailable', async () => {
  const response = await fetch(`${baseUrl}/api/site-content`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'Site content is temporarily unavailable' });
});

test('post search rejects oversized input before database access', async () => {
  const search = 'a'.repeat(101);
  const response = await fetch(`${baseUrl}/api/posts?search=${search}`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Search query must be 100 characters or fewer' });
});

test('contact submissions validate required fields before database access', async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Reader', email: 'reader@example.com', subject: 'A question' }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'message is required' });
});

test('contact messages are private to authenticated admins', async () => {
  const response = await fetch(`${baseUrl}/api/contact/admin`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Authentication required' });
});

test('post writes require authentication', async () => {
  const response = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'A story', content: 'Story content' }),
  });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Authentication required' });
});

test('login validates required credentials before database access', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: '' }),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Email and password are required' });
});

test('slugs retain non-Latin letters and normalize whitespace', () => {
  assert.equal(generateSlug('বাংলা  ব্লগ!'), 'বাংলা-ব্লগ');
  assert.equal(generateSlug('  Hello,   World! '), 'hello-world');
});
