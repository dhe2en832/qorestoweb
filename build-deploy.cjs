/**
 * build-deploy.cjs
 *
 * Script build otomatis untuk qorestoweb.
 * Mengikuti pola webcsa-v2 (trenly): env file terpisah per mode.
 *
 * Usage:
 *   node build-deploy.cjs --mode=primary    → build server utama
 *   node build-deploy.cjs --mode=cadangan   → build server cadangan
 *
 * Yang dilakukan script ini:
 *   1. Jalankan CRA build dengan env dari ./env/qorestoweb/.env + .env.prod / .env.prod.cadangan
 *      (CRA membaca BUILD_PATH dan PUBLIC_URL dari env secara otomatis)
 *   2. Copy app.cfg yang sesuai ke dalam folder build hasil:
 *      - primary   → public/app.cfg          → {BUILD_PATH}/app.cfg
 *      - cadangan  → public/app.cfg.cadangan → {BUILD_PATH}/app.cfg
 *   3. Tampilkan ringkasan hasil build
 *
 * Struktur env files:
 *   env/qorestoweb/.env                → shared (xendit config, bank code, mock flag)
 *   env/qorestoweb/.env.prod           → primary  (PUBLIC_URL=/qorestoweb/, BUILD_PATH=build/prod/qorestoweb)
 *   env/qorestoweb/.env.prod.cadangan  → cadangan (PUBLIC_URL=/qorestoweb-cad/, BUILD_PATH=build/prod/qorestoweb-cad)
 */

const { execSync }   = require('child_process');
const fs             = require('fs');
const path           = require('path');

// ── Parse args ──────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const modeArg = args.find((a) => a.startsWith('--mode='));
const mode    = modeArg ? modeArg.split('=')[1].trim().toLowerCase() : 'primary';

if (!['primary', 'cadangan'].includes(mode)) {
  console.error('❌  Mode tidak valid. Gunakan: --mode=primary atau --mode=cadangan');
  process.exit(1);
}

const isCadangan = mode === 'cadangan';

// ── Paths ───────────────────────────────────────────────────────────────────
const ROOT       = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');

const ENV_SHARED = './env/qorestoweb/.env';
const ENV_SPECIFIC = isCadangan
  ? './env/qorestoweb/.env.prod.cadangan'
  : './env/qorestoweb/.env.prod';

const APP_CFG_SRC = isCadangan
  ? path.join(PUBLIC_DIR, 'app.cfg.cadangan')
  : path.join(PUBLIC_DIR, 'app.cfg');

// ── Helper: baca nilai dari .env file ───────────────────────────────────────
function readEnvValue(filePath, key) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match   = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match ? match[1].trim() : null;
  } catch (_) { return null; }
}

// Baca BUILD_PATH dari env specific (bisa di-override)
const buildPath = readEnvValue(path.join(ROOT, ENV_SPECIFIC.replace('./', '')), 'BUILD_PATH')
               || (isCadangan ? 'build/prod/qorestoweb-cad' : 'build/prod/qorestoweb');

const BUILD_DIR = path.join(ROOT, buildPath);

console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log(`║  QORESTOWEB BUILD — ${mode.toUpperCase().padEnd(28)}║`);
console.log('╠══════════════════════════════════════════════════╣');
console.log(`║  Mode      : ${mode.padEnd(36)}║`);
console.log(`║  Env shared: ${ENV_SHARED.padEnd(36)}║`);
console.log(`║  Env mode  : ${ENV_SPECIFIC.padEnd(36)}║`);
console.log(`║  Build out : ${buildPath.padEnd(36)}║`);
console.log(`║  app.cfg   : ${path.basename(APP_CFG_SRC).padEnd(36)}║`);
console.log('╚══════════════════════════════════════════════════╝');
console.log('');

// ── Validasi app.cfg source ada ─────────────────────────────────────────────
if (!fs.existsSync(APP_CFG_SRC)) {
  console.error(`❌  File tidak ditemukan: ${APP_CFG_SRC}`);
  process.exit(1);
}

// ── Step 1: Hapus build lama ─────────────────────────────────────────────────
console.log('🧹  Membersihkan build lama...');
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  console.log(`    ✅  Folder ${buildPath} dihapus.`);
} else {
  console.log('    ℹ️   Tidak ada build lama.');
}

// ── Step 2: Build CRA ────────────────────────────────────────────────────────
// env-cmd -f shared -f specific: specific menimpa nilai yang sama di shared
console.log('');
console.log('⚙️   Menjalankan CRA build...');
console.log('');

try {
  execSync(
    `yarn env-cmd -f ${ENV_SHARED} env-cmd -f ${ENV_SPECIFIC} react-scripts build`,
    { cwd: ROOT, stdio: 'inherit', env: { ...process.env } }
  );
} catch (err) {
  console.error('');
  console.error('❌  Build gagal!');
  process.exit(1);
}

// ── Step 3: Copy app.cfg yang sesuai ─────────────────────────────────────────
console.log('');
console.log(`📋  Menyalin app.cfg (${mode})...`);

if (!fs.existsSync(BUILD_DIR)) {
  console.error(`❌  Folder build tidak ditemukan: ${BUILD_DIR}`);
  process.exit(1);
}

const APP_CFG_DEST = path.join(BUILD_DIR, 'app.cfg');
fs.copyFileSync(APP_CFG_SRC, APP_CFG_DEST);
console.log(`    ✅  ${path.basename(APP_CFG_SRC)} → ${buildPath}/app.cfg`);

// ── Step 4: Tampilkan isi app.cfg yang di-copy ───────────────────────────────
try {
  const cfgContent = JSON.parse(fs.readFileSync(APP_CFG_DEST, 'utf-8'));
  console.log('');
  console.log('    Isi app.cfg yang diterapkan:');
  Object.entries(cfgContent).forEach(([k, v]) => {
    console.log(`      ${k}: ${JSON.stringify(v)}`);
  });
} catch (_) { /* skip */ }

// ── Selesai ──────────────────────────────────────────────────────────────────
console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log(`║  ✅  BUILD ${mode.toUpperCase()} SELESAI!`.padEnd(51) + '║');
console.log(`║  📁  Output: ./${buildPath}/`.padEnd(51) + '║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');
