import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
const modules = new Map();
function load(relative) {
  const absolute = path.resolve(relative);
  if (modules.has(absolute)) return modules.get(absolute).exports;
  const evaluatedModule = { exports: {} }; modules.set(absolute, evaluatedModule);
  const compiled = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const localRequire = (specifier) => {
    if (specifier === 'next/navigation') return { useRouter: () => ({ refresh() {} }), usePathname: () => '/admin' };
    if (specifier.startsWith('@/') || specifier.startsWith('.')) {
      const target = specifier.startsWith('@/') ? path.resolve('src', specifier.slice(2)) : path.resolve(path.dirname(absolute), specifier);
      for (const extension of ['.tsx', '.ts']) if (fs.existsSync(target + extension)) return load(target + extension);
      throw new Error(`Missing source module: ${specifier}`);
    }
    return require(specifier);
  };
  vm.runInNewContext(compiled, { module: evaluatedModule, exports: evaluatedModule.exports, require: localRequire, process, Buffer, console, structuredClone, Map }, { filename: absolute });
  return evaluatedModule.exports;
}
const { DEFAULT_CONTENT, PAGE_SLUGS } = load('src/lib/content.ts');
const { ContentEditor } = load('src/components/admin/content-editor.tsx');
for (const target of ['branding', 'business', ...PAGE_SLUGS]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  client.setQueryData(['admin-content'], { content: DEFAULT_CONTENT, revision: 0, updatedAt: null, storageAvailable: true, mediaAvailable: false });
  const html = renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, React.createElement(ContentEditor, { target })));
  assert.ok(html.includes('Save &amp; publish'), `${target} editor should render its publishing control`);
  if (target === 'branding') {
    for (const label of ['Logo for light backgrounds', 'Logo for dark backgrounds', 'logo-light.svg', 'logo-dark.svg']) assert.ok(html.includes(label), `branding editor should include ${label}`);
  } else if (target === 'business') {
    for (const label of ['Store phone', 'Store hours', 'Sunday']) assert.ok(html.includes(label), `business editor should include ${label}`);
  } else {
    assert.ok(html.includes('Page introduction'));
    assert.ok(html.includes('Search appearance'));
    if (target === 'contact') assert.ok(html.includes('shared Visit the Store section'));
    else assert.ok(html.includes('Card heading'));
  }
  client.clear();
  console.log('PASS rendered editor', target);
}

const { MediaLibrary } = load('src/components/admin/media-library.tsx');
const { LivestockGallery } = load('src/components/site/livestock-gallery.tsx');
const category = DEFAULT_CONTENT.pages.livestock.sections[0];
const photo = { _id: 'test-photo', url: 'https://res.cloudinary.com/test/image/upload/v1/coral.jpg', name: 'coral.jpg', alt: 'Orange coral colony', category: category.id };
const mediaClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
mediaClient.setQueryData(['admin-media', '', 'library'], { pages: [{ assets: [photo], total: 201, nextPage: 2, configured: true, categories: [{ id: category.id, title: category.title }] }], pageParams: [1] });
let markup = renderToStaticMarkup(React.createElement(QueryClientProvider, { client: mediaClient }, React.createElement(MediaLibrary)));
for (const text of ['Drop your photos here', 'Choose photos', 'Upload destination', 'Edit gallery details', 'Load more photos', 'Showing 1 of 201', 'f_auto,q_auto,c_limit,w_480']) {
  assert.ok(markup.includes(text), `media library should render ${text}`);
}
assert.ok(markup.includes('multiple=""'), 'photo picker should allow batch selection');
assert.ok(markup.includes('.heic,.heif,.hif'), 'photo picker must accept iPhone HEIC and HEIF files');
assert.ok(markup.includes('iPhone HEIC photos are converted automatically'), 'uploader should explain automatic iPhone photo conversion');
mediaClient.setQueryData(['admin-media', '', ''], { pages: [{ assets: [photo], total: 1, nextPage: null, configured: true, categories: [{ id: category.id, title: category.title }] }], pageParams: [1] });
markup = renderToStaticMarkup(React.createElement(QueryClientProvider, { client: mediaClient }, React.createElement(MediaLibrary, { galleryMode: true })));
assert.ok(markup.includes('Livestock gallery category'), 'admin Gallery must use Livestock categories');
assert.ok(markup.includes('Choose a category from your Livestock page'), 'gallery upload requires choosing a category');
assert.ok(markup.includes('gallery photos'), 'admin Gallery should show gallery photos instead of site assets');
mediaClient.setQueryData(['gallery', category.id], { pages: [{ assets: [photo], total: 25, nextPage: 2 }], pageParams: [1] });
markup = renderToStaticMarkup(React.createElement(QueryClientProvider, { client: mediaClient }, React.createElement(LivestockGallery, { category: category.id, title: category.title })));
for (const text of ['Enlarge Orange coral colony', 'Load more photos', 'f_auto,q_auto,c_limit,w_640']) assert.ok(markup.includes(text), `gallery should render ${text}`);
mediaClient.setQueryData(['gallery', category.id], { pages: [{ assets: [], total: 0, nextPage: null }], pageParams: [1] });
markup = renderToStaticMarkup(React.createElement(QueryClientProvider, { client: mediaClient }, React.createElement(LivestockGallery, { category: category.id, title: category.title })));
assert.ok(markup.includes('New photos are coming soon'), 'empty galleries should show a useful message');
mediaClient.clear();
console.log('PASS rendered batch uploader, paginated library, populated gallery, and empty gallery.');
