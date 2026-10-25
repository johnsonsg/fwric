import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const base = process.env.CHECK_BASE_URL ?? 'http://localhost:3000';
const jar = new Map();
async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options, redirect: 'manual', signal: AbortSignal.timeout(30000),
    headers: { Cookie: [...jar].map(([name, value]) => `${name}=${value}`).join('; '), ...options.headers },
  });
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(';');
    const at = pair.indexOf('=');
    jar.set(pair.slice(0, at), pair.slice(at + 1));
  }
  return response;
}

const unauthorized = await request('/api/site-config', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: base }, body: '{}' });
assert.equal(unauthorized.status, 401, 'anonymous content updates must be rejected');
const csrf = await (await request('/api/auth/csrf')).json();
const login = await request('/api/auth/callback/credentials', {
  method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: base },
  body: new URLSearchParams({ csrfToken: csrf.csrfToken, email: process.env.ADMIN_EMAIL ?? 'admin@example.com', password: process.env.ADMIN_PASSWORD ?? 'change-me-123', callbackUrl: `${base}/admin`, json: 'true' }),
});
assert.ok([200, 302].includes(login.status), 'admin login should respond successfully');
const session = await (await request('/api/auth/session')).json();
assert.equal(session.user?.role, 'admin', 'configured admin credentials should create an admin session');

for (const path of ['/admin', '/admin/pages', ...['home', 'livestock', 'services', 'about', 'contact'].map((slug) => `/admin/pages/${slug}`), '/admin/branding', '/admin/business', '/admin/media', '/admin/activity']) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} should render for an administrator`);
  const html = await response.text();
  assert.ok(html.includes('Site studio'), `${path} should include the admin navigation`);
  console.log('PASS', path);
}

const snapshot = await (await request('/api/site-config')).json();
assert.equal(snapshot.storageAvailable, true, 'content storage should be connected');
for (const path of ['/', '/livestock', '/services', '/about', '/contact']) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} menu destination should work`);
  assert.ok((await response.text()).includes('<h1'), `${path} should render its main heading`);
}
for (const category of snapshot.content.pages.livestock.sections) {
  const response = await request(`/livestock?category=${category.id}`);
  assert.equal(response.status, 200);
  assert.equal(((await response.text()).match(/<article\b/g) ?? []).length, 1, 'a category filter should show only its selected card');
}
assert.equal((await request('/missing-page-route')).status, 404);
console.log('PASS all public menu routes, category filters, and unknown-page handling');
const invalid = await request('/api/site-config', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ section: 'branding', revision: snapshot.revision, data: { ...snapshot.content.branding, logoLight: 'javascript:alert(1)' } }) });
assert.equal(invalid.status, 422, 'unsafe image URLs should be rejected');
const forgedOrigin = await request('/api/site-config', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: 'https://unrelated.example' }, body: '{}' });
assert.equal(forgedOrigin.status, 401, 'cross-origin writes should be rejected');
const media = await request('/api/admin/media');
assert.equal(media.status, 200, 'authenticated media library should load');
const mediaData = await media.json();
assert.ok(Array.isArray(mediaData.assets));
const activity = await request('/api/admin/activity');
assert.equal(activity.status, 200);
console.log('PASS login, authenticated routes, database connectivity, input validation, origin protection, media library, activity');
console.log('Upload provider configured:', mediaData.configured);
// This check deliberately never publishes to the configured site database.
