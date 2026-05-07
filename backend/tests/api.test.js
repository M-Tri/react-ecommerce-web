import assert from 'node:assert/strict';
import { mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { spawn } from 'node:child_process';
import { after, before, beforeEach, describe, test } from 'node:test';

const backendRoot = path.resolve(import.meta.dirname, '..');
const serverPath = path.join(backendRoot, 'server.js');
const testPort = 3130;
const baseUrl = `http://localhost:${testPort}`;
const adminSecret = 'test-secret';

let server;
let testWorkingDirectory;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  return { response, body };
};

before(async () => {
  testWorkingDirectory = path.join(tmpdir(), `ecommerce-backend-test-${process.pid}`);
  await rm(testWorkingDirectory, { recursive: true, force: true });
  await mkdir(testWorkingDirectory, { recursive: true });

  server = spawn(process.execPath, [serverPath], {
    cwd: testWorkingDirectory,
    env: {
      ...process.env,
      PORT: String(testPort),
      NODE_ENV: 'test',
      ADMIN_SECRET: adminSecret
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let lastError;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const { response } = await request('/api/products');
      if (response.ok) {
        return;
      }
    } catch (err) {
      lastError = err;
    }

    await delay(100);
  }

  throw lastError ?? new Error('Backend test server did not start');
});

beforeEach(async () => {
  const { response } = await request('/api/reset', {
    method: 'POST',
    headers: {
      'x-admin-secret': adminSecret
    }
  });

  assert.equal(response.status, 204);
});

after(async () => {
  if (server) {
    server.kill('SIGTERM');
  }

  await rm(testWorkingDirectory, { recursive: true, force: true });
});

describe('backend API', () => {
  test('lists and searches products', async () => {
    const { response, body } = await request('/api/products?search=socks');

    assert.equal(response.status, 200);
    assert.equal(body.length, 1);
    assert.match(body[0].name, /socks/i);
  });

  test('adds and expands cart items', async () => {
    const productId = 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6';
    const createResult = await request('/api/cart-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1, deliveryOptionId: '2' })
    });

    assert.equal(createResult.response.status, 201);

    const { response, body } = await request('/api/cart-items?expand=product');

    assert.equal(response.status, 200);
    assert.ok(body.some((cartItem) => (
      cartItem.productId === productId &&
      cartItem.product &&
      cartItem.deliveryOptionId === '2'
    )));
  });

  test('creates orders from the cart and clears cart items', async () => {
    const { response, body } = await request('/api/orders', { method: 'POST' });

    assert.equal(response.status, 201);
    assert.ok(body.id);
    assert.ok(body.products.length > 0);

    const cartResult = await request('/api/cart-items');
    assert.equal(cartResult.body.length, 0);

    const ordersResult = await request('/api/orders?expand=products');
    assert.ok(ordersResult.body.some((order) => (
      order.id === body.id &&
      order.products.every((product) => product.product)
    )));
  });

  test('protects reset with an admin secret', async () => {
    const rejected = await request('/api/reset', { method: 'POST' });
    assert.equal(rejected.response.status, 401);

    const accepted = await request('/api/reset', {
      method: 'POST',
      headers: {
        'x-admin-secret': adminSecret
      }
    });
    assert.equal(accepted.response.status, 204);
  });
});
