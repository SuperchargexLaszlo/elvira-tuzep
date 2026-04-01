import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const esmDir = resolve(__dirname, '../node_modules/@medusajs/js-sdk/dist/esm');

function getAllJsFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...getAllJsFiles(full));
    } else if (entry.endsWith('.js') && !entry.endsWith('.min.js')) {
      files.push(full);
    }
  }
  return files;
}

function fixImports(content, fileDir) {
  return content.replace(/from ["'](\.[^"']+)["']/g, (match, importPath) => {
    // Already has .js extension
    if (importPath.endsWith('.js')) return match;
    const abs = resolve(fileDir, importPath);
    // Check if it's a file (file.js exists)
    if (existsSync(abs + '.js')) {
      return match.replace(importPath, importPath + '.js');
    }
    // Check if it's a directory with index.js
    if (existsSync(join(abs, 'index.js'))) {
      return match.replace(importPath, importPath + '/index.js');
    }
    return match;
  });
}

let patchedCount = 0;
for (const file of getAllJsFiles(esmDir)) {
  const content = readFileSync(file, 'utf8');
  const patched = fixImports(content, dirname(file));
  if (content !== patched) {
    writeFileSync(file, patched);
    patchedCount++;
  }
}

console.log(`✅ Patched ${patchedCount} files in @medusajs/js-sdk/dist/esm`);
