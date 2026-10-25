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
    assert.ok(html.includes('Card heading'));
  }
  client.clear();
  console.log('PASS rendered editor', target);
}
