import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { Writable } from 'node:stream';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const mongoose = require('mongoose');
require('@next/env').loadEnvConfig(process.cwd());
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required for this isolated persistence check.');
const database = `fwric_cms_check_${Date.now()}`;
const connection = await mongoose.createConnection(process.env.MONGODB_URI, { dbName: database, serverSelectionTimeoutMS: 10000 }).asPromise();
const modules = new Map();
const overrides = new Map();
const scopedMongoose = { models: connection.models, model: connection.model.bind(connection) };
overrides.set('mongoose', { __esModule: true, default: scopedMongoose, Schema: mongoose.Schema });
let authorized = true;
let uploadConfigured = false;
overrides.set('@/lib/admin-auth', { requireAdmin: async () => authorized ? { user: { email: 'validation@fwric.invalid', role: 'admin' } } : null });
overrides.set('@/lib/db', { connectToDatabase: async () => {} });

function load(relative) {
  const absolute = path.resolve(relative);
  if (modules.has(absolute)) return modules.get(absolute).exports;
  const evaluatedModule = { exports: {} }; modules.set(absolute, evaluatedModule);
  const source = fs.readFileSync(absolute, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const localRequire = (specifier) => {
    if (overrides.has(specifier)) return overrides.get(specifier);
    if (specifier.startsWith('@/')) return load(`src/${specifier.slice(2)}.ts`);
    return require(specifier);
  };
  vm.runInNewContext(compiled, { module: evaluatedModule, exports: evaluatedModule.exports, require: localRequire, process, Buffer, console, Response, Request, URL, File, FormData }, { filename: absolute });
  return evaluatedModule.exports;
}

try {
  const { DEFAULT_CONTENT, contentSchema } = load('src/lib/content.ts');
  contentSchema.parse(DEFAULT_CONTENT);
  const { ContentDocument } = load('src/models/SiteContent.ts');
  overrides.set('@/lib/content-store', {
    mediaConfigured: () => uploadConfigured,
    getContentSnapshot: async () => {
      const stored = await ContentDocument.findById('site');
      return { content: stored?.content ?? DEFAULT_CONTENT, revision: stored?.revision ?? 0, updatedAt: stored?.updatedAt?.toISOString() ?? null, storageAvailable: true, mediaAvailable: false };
    },
  });
  const route = load('src/app/api/site-config/route.ts');
  const put = (body) => route.PUT(new Request('http://localhost/api/site-config', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost' }, body: JSON.stringify(body) }));
  authorized = false;
  assert.equal((await put({})).status, 401);
  authorized = true;
  const branding = { ...DEFAULT_CONTENT.branding, siteName: 'Persistence verification' };
  let response = await put({ section: 'branding', revision: 0, data: branding });
  assert.equal(response.status, 200, await response.clone().text());
  let snapshot = await response.json(); assert.equal(snapshot.revision, 1);
  assert.equal((await ContentDocument.findById('site')).content.branding.siteName, branding.siteName);
  response = await put({ section: 'page', slug: 'services', revision: 1, data: { ...DEFAULT_CONTENT.pages.services, title: 'Verified service page' } });
  assert.equal(response.status, 200, await response.clone().text()); snapshot = await response.json();
  assert.equal(snapshot.revision, 2); assert.equal(snapshot.content.branding.siteName, branding.siteName); assert.equal(snapshot.content.pages.services.title, 'Verified service page');
  assert.equal((await put({ section: 'branding', revision: 1, data: branding })).status, 409, 'stale updates must not overwrite a newer save');
  assert.equal((await put({ section: 'branding', revision: 2, data: { ...branding, logoDark: 'javascript:alert(1)' } })).status, 422);
  assert.equal((await put({ section: 'branding', revision: 2, data: { ...branding, injected: true } })).status, 422);
  const responses = await Promise.all(['First editor', 'Second editor'].map((siteName) => put({ section: 'branding', revision: 2, data: { ...branding, siteName } })));
  assert.deepEqual(responses.map((result) => result.status).sort(), [200, 409], 'only one concurrent editor may publish the same revision');
  const final = await ContentDocument.findById('site'); assert.equal(final.revision, 3); assert.equal(final.history.length, 3);
  assert.equal(final.content.pages.services.title, 'Verified service page');
  assert.equal((await put({ section: 'branding', revision: 3, data: final.content.branding })).status, 200);
  assert.equal((await ContentDocument.findById('site')).revision, 3, 'unchanged content should not create another version');
  response = await put({ section: 'business', revision: 3, data: { ...DEFAULT_CONTENT.business, phone: '(804) 555-0100', mapsUrl: 'https://maps.example.invalid/store' } });
  assert.equal(response.status, 200);
  snapshot = await response.json();
  assert.equal(snapshot.content.pages.contact.primaryHref, 'tel:+18045550100', 'shared phone changes should update call buttons');
  assert.equal(snapshot.content.pages.home.secondaryHref, 'https://maps.example.invalid/store', 'shared directions should update the home button');
  assert.equal(snapshot.content.pages.services.title, 'Verified service page');
  let uploadedCount = 0, destroyedCount = 0;
  overrides.set('cloudinary', { v2: {
    config() {},
    uploader: {
      upload_stream(_options, callback) {
        const stream = new Writable({ write(_chunk, _encoding, done) { done(); } });
        stream.on('finish', () => { uploadedCount++; callback(null, { public_id: `validation-${uploadedCount}`, secure_url: 'https://res.cloudinary.com/validation/image/upload/photo.png', width: 32, height: 32, bytes: 705 }); });
        return stream;
      },
      async destroy() { destroyedCount++; },
    },
  } });
  const mediaRoute = load('src/app/api/admin/media/route.ts');
  const uploadRequest = (file, alt = 'Validation image') => {
    const body = new FormData(); body.append('file', file); body.append('alt', alt);
    return new Request('http://localhost/api/admin/media', { method: 'POST', headers: { Origin: 'http://localhost' }, body });
  };
  const png = new File([fs.readFileSync('public/icon/icon-light-32x32.png')], 'validation.png', { type: 'image/png' });
  assert.equal((await mediaRoute.POST(uploadRequest(png))).status, 503, 'unconfigured uploads must report setup required');
  uploadConfigured = true;
  assert.equal((await mediaRoute.POST(uploadRequest(new File(['not an image'], 'fake.png', { type: 'image/png' })))).status, 422);
  assert.equal((await mediaRoute.POST(uploadRequest(png, ''))).status, 422);
  assert.equal(uploadedCount, 0, 'invalid uploads must not reach the media provider');
  response = await mediaRoute.POST(uploadRequest(png));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).asset.alt, 'Validation image');
  assert.equal((await (await mediaRoute.GET()).json()).assets.length, 1);
  const { MediaAsset } = load('src/models/MediaAsset.ts');
  const create = MediaAsset.create;
  MediaAsset.create = async () => { throw new Error('Simulated database failure'); };
  try { assert.equal((await mediaRoute.POST(uploadRequest(png))).status, 503); } finally { MediaAsset.create = create; }
  assert.equal(destroyedCount, 1, 'a provider upload must be removed if recording it fails');
  authorized = false;
  assert.equal((await mediaRoute.GET()).status, 401);
  assert.equal((await mediaRoute.POST(uploadRequest(png))).status, 401);
  console.log('PASS media validation, setup reporting, library persistence, authenticated access, and upload-failure cleanup (media provider mocked).');
  console.log('PASS isolated MongoDB persistence, page/branding updates, unchanged-section preservation, authorization, validation, conflicts, concurrent saves, and history.');
} finally {
  assert.equal(connection.db.databaseName, database);
  await connection.dropDatabase();
  await connection.close();
  console.log('Removed isolated validation database. The configured site database was not changed.');
}
