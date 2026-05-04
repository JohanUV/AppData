// Descarga los binarios prebuilt de better-sqlite3 contra el ABI de Electron.
// Se ejecuta como postinstall. Mucho más rápido y libre de toolchain que
// recompilar con electron-rebuild + node-gyp + Visual Studio.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function readPkg(p) {
  return JSON.parse(readFileSync(path.join(root, p), 'utf8'));
}

const electronVersion = readPkg('node_modules/electron/package.json').version;
const platform = process.platform;
const arch = process.arch;

const targets = ['better-sqlite3'];

for (const name of targets) {
  const dir = path.join(root, 'node_modules', name);
  if (!existsSync(dir)) continue;
  console.log(`[prebuild] ${name} -> electron@${electronVersion} ${platform}-${arch}`);
  try {
    execSync(
      `npx --no-install prebuild-install --runtime=electron --target=${electronVersion} --arch=${arch} --platform=${platform}`,
      { cwd: dir, stdio: 'inherit' },
    );
  } catch (err) {
    console.error(`[prebuild] failed for ${name}:`, err.message);
    process.exit(1);
  }
}
