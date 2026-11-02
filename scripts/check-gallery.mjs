import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const mongoose = require('mongoose');
require('@next/env').loadEnvConfig(process.cwd());
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required for the isolated gallery check.');
const database = `fwric_gallery_check_${Date.now()}`;
const connection = await mongoose.createConnection(process.env.MONGODB_URI, { dbName: database, serverSelectionTimeoutMS: 10000 }).asPromise();
const scopedMongoose = { models: connection.models, model: connection.model.bind(connection), isValidObjectId: mongoose.isValidObjectId };
const modules = new Map();
const overrides = new Map();
let signedIn = true;
let cloudCalls = 0;
overrides.set('mongoose', { __esModule: true, default: scopedMongoose, Schema: mongoose.Schema });
overrides.set('@/lib/db', { connectToDatabase: async () => {} });
overrides.set('@/lib/admin-auth', { requireAdmin: async (request) => signedIn && (!request || request.headers.get('origin') === new URL(request.url).origin) ? { user: { email: 'gallery-check@example.invalid' } } : null });
overrides.set('cloudinary', { v2: { config() {}, uploader: {
  upload_stream(options, callback) { cloudCalls++; return { end() { callback(null, { public_id: `check/${cloudCalls}`, secure_url: `https://res.cloudinary.com/check/image/upload/v1/check/${cloudCalls}.jpg`, width: 1200, height: 800, bytes: 1000 }); } }; },
  destroy: async () => {},
} } });
function load(relative) {
 const absolute = path.resolve(relative);
 if (modules.has(absolute)) return modules.get(absolute).exports;
 const moduleValue = { exports: {} }; modules.set(absolute, moduleValue);
 const compiled = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
 const localRequire = (specifier) => overrides.has(specifier) ? overrides.get(specifier) : specifier.startsWith('@/') ? load(`src/${specifier.slice(2)}.ts`) : require(specifier);
 vm.runInNewContext(compiled, { module: moduleValue, exports: moduleValue.exports, require: localRequire, process, Buffer, console, Response, Request, URL, File, FormData }, { filename: absolute });
 return moduleValue.exports;
}
try {
 const { DEFAULT_CONTENT } = load('src/lib/content.ts');
 const [firstCategory, secondCategory] = DEFAULT_CONTENT.pages.livestock.sections;
 overrides.set('@/lib/content-store', { mediaConfigured: () => true, getContentSnapshot: async () => ({ content: DEFAULT_CONTENT }) });
 const { MediaAsset } = load('src/models/MediaAsset.ts');
 const admin = load('src/app/api/admin/media/route.ts');
 const gallery = load('src/app/api/gallery/route.ts');
 const request = (route, method = 'GET', body, origin = 'http://localhost') => new Request(`http://localhost${route}`, { method, headers: { Origin: origin, ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}) });
 signedIn = false;
 assert.equal((await admin.GET(request('/api/admin/media'))).status, 401);
 assert.equal((await admin.POST(request('/api/admin/media', 'POST'))).status, 401);
 assert.equal((await admin.PATCH(request('/api/admin/media', 'PATCH', {}))).status, 401);
 signedIn = true;
 assert.equal((await admin.POST(request('/api/admin/media', 'POST', undefined, 'https://other.invalid'))).status, 401);
 assert.equal((await admin.PATCH(request('/api/admin/media', 'PATCH', {}, 'https://other.invalid'))).status, 401);
 const samples = Array.from({ length: 41 }, (_, index) => ({ publicId: `seed/${index}`, url: `https://res.cloudinary.com/check/image/upload/v1/seed/${index}.jpg`, name: `Coral ${index}`, alt: `Coral colony ${index}`, category: firstCategory.id, uploadedBy: 'private@example.invalid', bytes: 10000 }));
 await MediaAsset.insertMany([...samples, { publicId:'private',url:'https://example.invalid/private.jpg',name:'Library only',alt:'Unpublished photo',category:'' }, { publicId:'other',url:'https://example.invalid/other.jpg',name:'Other category',alt:'Other fish',category:secondCategory.id }]);
 const publicPage = await (await gallery.GET(request(`/api/gallery?category=${firstCategory.id}`))).json();
 assert.equal(publicPage.assets.length, 24);
 assert.equal(publicPage.total, 41);
 assert.equal(publicPage.nextPage, 2);
 assert.ok(publicPage.assets.every((asset) => !('uploadedBy' in asset) && !('bytes' in asset) && !('publicId' in asset)));
 const publicPage2 = await (await gallery.GET(request(`/api/gallery?category=${firstCategory.id}&page=2`))).json();
 assert.equal(publicPage2.assets.length, 17);
 assert.equal(publicPage2.nextPage, null);
 assert.equal(new Set([...publicPage.assets, ...publicPage2.assets].map(({ _id }) => _id)).size, 41);
 const libraryPage = await (await admin.GET(request('/api/admin/media'))).json();
 assert.equal(libraryPage.assets.length, 36);
 assert.equal(libraryPage.total, 43);
 assert.equal(libraryPage.nextPage, 2);
 const allGalleryPhotos = await (await admin.GET(request('/api/admin/media?gallery=1'))).json();
 assert.equal(allGalleryPhotos.total, 42, 'admin gallery should exclude library-only photos');
 const selectedGallery = await (await admin.GET(request(`/api/admin/media?gallery=1&category=${secondCategory.id}`))).json();
 assert.equal(selectedGallery.total, 1, 'admin category selector must show the matching photos');
 assert.equal((await admin.GET(request('/api/admin/media?gallery=1&category=missing-category'))).status, 404);
 const match = await (await admin.GET(request('/api/admin/media?q=Coral%2040'))).json();
 assert.equal(match.total, 1);
 const literal = await (await admin.GET(request('/api/admin/media?q=%2E%2A'))).json();
 assert.equal(literal.total, 0, 'search text must not execute as a regex');
 for (const bad of ['0','-1','1.5','10001','nope']) {
  assert.equal((await admin.GET(request(`/api/admin/media?page=${bad}`))).status, 400);
  assert.equal((await gallery.GET(request(`/api/gallery?category=${firstCategory.id}&page=${bad}`))).status, 400);
 }
 assert.equal((await gallery.GET(request('/api/gallery?category=missing-category'))).status, 404);
 assert.equal((await gallery.GET(request('/api/gallery?category=%24ne'))).status, 400);
 const body = { id: publicPage.assets[0]._id, category:'',alt:'Updated coral description' };
 assert.equal((await admin.PATCH(request('/api/admin/media', 'PATCH', { ...body,category:'missing-category' }))).status, 422);
 assert.equal((await admin.PATCH(request('/api/admin/media', 'PATCH', { ...body,alt:'' }))).status, 422);
 assert.equal((await admin.PATCH(request('/api/admin/media', 'PATCH', { ...body,uploadedBy:'forged' }))).status, 422);
 assert.equal((await admin.PATCH(request('/api/admin/media', 'PATCH', body))).status, 200);
 assert.equal((await MediaAsset.findById(body.id)).category, '');
 assert.equal((await (await gallery.GET(request(`/api/gallery?category=${firstCategory.id}`))).json()).total, 40);
 assert.equal((await admin.PATCH(request('/api/admin/media', 'PATCH', { ...body,category:secondCategory.id }))).status, 200);
 assert.equal((await (await gallery.GET(request(`/api/gallery?category=${secondCategory.id}`))).json()).total, 2);
 const form = (category, type='image/jpeg', data=Buffer.from([255,216,255,1])) => {
  const value=new FormData();value.append('file',new File([data],'upload.jpg',{type}));value.append('alt','A colorful coral');value.append('category',category);return value;
 };
 assert.equal((await admin.POST(request('/api/admin/media', 'POST', form('missing-category')))).status, 422);
 assert.equal((await admin.POST(request('/api/admin/media', 'POST', form(firstCategory.id, 'image/png')))).status, 422);
 assert.equal(cloudCalls, 0, 'invalid photos must never reach the provider');
 const response = await admin.POST(request('/api/admin/media','POST',form(firstCategory.id)));
 assert.equal(response.status, 201);
 const uploaded = (await response.json()).asset;
 assert.equal(uploaded.category, firstCategory.id);
 assert.equal(uploaded.alt, 'A colorful coral');
 assert.equal((await MediaAsset.findById(uploaded._id)).category, firstCategory.id);
 const huge=request('/api/admin/media','POST');huge.headers.set('content-length',String(5*1024*1024));
 assert.equal((await admin.POST(huge)).status,413);
 const { imageDeliveryUrl }=load('src/lib/media.ts');
 assert.equal(imageDeliveryUrl('/images/corals.png',640),'/images/corals.png');
 assert.equal(imageDeliveryUrl('https://other.invalid/photo.jpg',640),'https://other.invalid/photo.jpg');
 assert.equal(imageDeliveryUrl(uploaded.url,640),'https://res.cloudinary.com/check/image/upload/f_auto,q_auto,c_limit,w_640/v1/check/1.jpg');
 const imageModule = { exports: {} };
 const imageSource = ts.transpileModule(fs.readFileSync('src/lib/prepare-image.ts','utf8'), { compilerOptions:{ module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020 } }).outputText;
 let dimensions;
 let revoked = 0;
 const canvas = { width:0,height:0,getContext:()=>({drawImage(){}}),toBlob(callback) { dimensions=[this.width,this.height];callback(new Blob([new Uint8Array(800*1024)],{type:'image/webp'})); } };
 vm.runInNewContext(imageSource,{module:imageModule,exports:imageModule.exports,File,Blob,URL:{createObjectURL:()=> 'blob:check',revokeObjectURL:()=>{revoked++;}},window:{Image:class{naturalWidth=6000;naturalHeight=4000;decode(){return Promise.resolve();}}},document:{createElement:()=>canvas}});
 const {prepareImage}=imageModule.exports;
 await assert.rejects(()=>prepareImage(new File(['heic'],'phone.heic',{type:'image/heic'})),/Export HEIC/);
 const gif=new File(['gif'],'animated.gif',{type:'image/gif'});
 assert.equal(await prepareImage(gif),gif,'small animations must be preserved');
 await assert.rejects(()=>prepareImage(new File([new Uint8Array(5*1024*1024)],'animated.gif',{type:'image/gif'})),/4 MB/);
 const compressed=await prepareImage(new File([new Uint8Array(6*1024*1024)],'phone.jpg',{type:'image/jpeg'}));
 assert.equal(compressed.name,'phone.webp');assert.equal(compressed.type,'image/webp');
 assert.ok(compressed.size<=900*1024);assert.deepEqual(dimensions,[2400,1600]);assert.equal(revoked,1);
 console.log('PASS gallery category isolation, pagination, public data projection, admin authentication/origin checks, literal search, upload validation, category assignment/removal, and optimized delivery URLs.');
 console.log('PASS image preparation size/type checks, proportional resizing, WebP output, and animation preservation (browser encoder mocked).');
 console.log('Cloudinary was mocked; all database writes used an isolated temporary database.');
} finally {
 await connection.dropDatabase();
 await connection.close();
}
