/**
 * build-deploy.cjs
 *
 * Script build otomatis untuk qorestoweb.
 * Menggantikan fungsi vite.config.js di webcsa-v2 (trenly) untuk CRA.
 *
 * Usage:
 *   node build-deploy.cjs --mode=primary    → build server utama
 *   node build-deploy.cjs --mode=cadangan   → build server cadangan
 *
 * Yang dilakukan script ini:
 *   1. Set env vars dari .env-cmdrc sesuai environment
 *   2. Jalankan CRA build
 *   3. Copy app.cfg.primary atau app.cfg.cadangan → build/app.cfg
 *   4. Tampilkan ringkasan hasil build
 */

const { execSync }   = require('child_process');
const fs             = require('fs');
const path           = require('path');

// ── Parse args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const modeArg = args.find((a) => a.startsWith('--mode='));
const mode = modeArg ? modeArg.split('=')[1].trim().toLowerCase() : 'primary';

if (!['primary', 'cadangan'].includes(mode)) {
  console.error('❌  Mode tidak valid. Gunakan: --mode=primary atau --mode=cadangan');
  process.exit(1);
}

const isCadangan = mode === 'cadangan';

// ── Paths ───────────────────────────────────────────────────────────────────
const ROOT       = __dirname;
const BUILD_DIR  = path.join(ROOT, isCadangan ? 'build-cadangan' : 'build');
const PUBLIC_DIR = path.join(ROOT, 'public');

const APP_CFG_SRC = isCadangan
  ? path.join(PUBLIC_DIR, 'app.cfg.cadangan')
  : path.join(PUBLIC_DIR, 'app.cfg');          // app.cfg di public = versi primary

const APP_CFG_DEST = path.join(BUILD_DIR, 'app.cfg');

// ── Pilih environment dari .env-cmdrc ────────────────────────────────────────
// primary   → production
// cadangan  → staging  (IP server .85 sebagai utama, .13 sebagai fallback)
const ENV_KEY = isCadangan ? 'staging' : 'production';

console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log(`║  QORESTOWEB BUILD — ${mode.toUpperCase().padEnd(28)}║`);
console.log('╠══════════════════════════════════════════════════╣');
console.log(`║  Mode      : ${mode.padEnd(36)}║`);
console.log(`║  Env key   : ${ENV_KEY.padEnd(36)}║`);
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
  console.log('    ✅  Folder build dihapus.');
} else {
  console.log('    ℹ️   Tidak ada build lama.');
}

// ── Step 2: Build CRA ────────────────────────────────────────────────────────
console.log('');
console.log(`⚙️   Menjalankan CRA build (env: ${ENV_KEY})...`);
console.log('');

try {
  execSync(`yarn env-cmd -e ${ENV_KEY} react-scripts build`, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });
} catch (err) {
  console.error('');
  console.error('❌  Build gagal!');
  process.exit(1);
}

// ── Step 2b: Pindahkan output CRA ke folder tujuan (khusus cadangan) ─────────
// CRA selalu output ke ./build/, jadi perlu di-rename ke BUILD_DIR jika cadangan.
if (isCadangan) {
  const CRA_DEFAULT_DIR = path.join(ROOT, 'build');
  console.log('');
  console.log(`📦  Memindahkan ./build/ → ./build-cadangan/...`);
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  }
  fs.renameSync(CRA_DEFAULT_DIR, BUILD_DIR);
  console.log('    ✅  Selesai dipindahkan.');
}

// ── Step 3: Copy app.cfg yang sesuai ─────────────────────────────────────────
console.log('');
console.log(`📋  Menyalin app.cfg (${mode})...`);

if (!fs.existsSync(BUILD_DIR)) {
  console.error('❌  Folder build tidak ditemukan setelah build selesai.');
  process.exit(1);
}

fs.copyFileSync(APP_CFG_SRC, APP_CFG_DEST);
console.log(`    ✅  ${path.basename(APP_CFG_SRC)} → ${path.relative(ROOT, APP_CFG_DEST)}`);

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
console.log(`║  📁  Output: ./${isCadangan ? 'build-cadangan' : 'build'}/`.padEnd(51) + '║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');
