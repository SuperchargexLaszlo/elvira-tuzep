import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = resolve(__dirname, '../node_modules/@medusajs/js-sdk/dist/esm/index.js');

let content = readFileSync(file, 'utf8');
const patched = content
  .replace(/from "\.\/admin"/g, 'from "./admin/index.js"')
  .replace(/from "\.\/auth"/g, 'from "./auth/index.js"')
  .replace(/from "\.\/client"/g, 'from "./client/index.js"')
  .replace(/from "\.\/store"/g, 'from "./store/index.js"');

if (content === patched) {
  console.log('ℹ️  @medusajs/js-sdk already patched or no changes needed');
} else {
  writeFileSync(file, patched);
  console.log('✅ Patched @medusajs/js-sdk ESM directory imports → explicit index.js paths');
}
