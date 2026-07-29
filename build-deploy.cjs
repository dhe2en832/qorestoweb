/**
 * build-deploy.cjs
 *
 * Script build otomatis untuk qorestoweb.
 * Dipanggil setelah env sudah di-inject oleh env-cmd.
 *
 * Usage (via package.json):
 *   yarn prod:qorestoweb           → build server utama   (primary)
 *   yarn prod:qorestoweb-cadangan  → build server cadangan
 *
 * Yang dilakukan script ini:
 *   1. Baca BUILD_PATH dan PUBLIC_URL dari env (sudah di-inject env-cmd)
 *   2. Hapus folder BUILD_PATH lama
 *   3. Jalankan CRA build (CRA v5 otomatis pakai BUILD_PATH dari env)
 *   4. Copy app.cfg yang sesuai ke dalam folder hasil build
 *   5. Tampilkan ringkasan
 */

const { execSync } = require('child_process');
const fs           = require('fs');
const path         = require('path');

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
const ROOT      = __dirname;
const BUILD_DIR = path.join(ROOT, process.env.BUILD_PATH || (isCadangan ? 'build/prod/qorestoweb-cad' : 'build/prod/qorestoweb'));
const PUBLIC_DIR = path.join(ROOT, 'public');

const APP_CFG_SRC  = isCadangan
  ? path.join(PUBLIC_DIR, 'app.cfg.cadangan')
  : path.join(PUBLIC_DIR, 'app.cfg');
const APP_CFG_DEST = path.join(BUILD_DIR, 'app.cfg');

const PUBLIC_URL = process.env.PUBLIC_URL || (isCadangan ? '/qorestoweb-cad/' : '/qorestoweb/');

console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log(`║  QORESTOWEB BUILD — ${mode.toUpperCase().padEnd(28)}║`);
console.log('╠══════════════════════════════════════════════════╣');
console.log(`║  Mode       : ${mode.padEnd(35)}║`);
console.log(`║  PUBLIC_URL : ${PUBLIC_URL.padEnd(35)}║`);
console.log(`║  BUILD_PATH : ${path.relative(ROOT, BUILD_DIR).padEnd(35)}║`);
console.log(`║  app.cfg    : ${path.basename(APP_CFG_SRC).padEnd(35)}║`);
console.log('╚══════════════════════════════════════════════════╝');
console.log('');

// ── Validasi app.cfg source ada ─────────────────────────────────────────────
if (!fs.existsSync(APP_CFG_SRC)) {
  console.error(`❌  File tidak ditemukan: ${APP_CFG_SRC}`);
  process.exit(1);
}

// ── Step 1: Hapus build lama ──────────────────────────────────────────────────
console.log('🧹  Membersihkan build lama...');
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  console.log(`    ✅  Folder ${path.relative(ROOT, BUILD_DIR)} dihapus.`);
} else {
  console.log('    ℹ️   Tidak ada build lama.');
}

// ── Step 2: Build CRA ────────────────────────────────────────────────────────
// CRA v5 membaca BUILD_PATH dari env secara otomatis → output langsung ke BUILD_DIR
console.log('');
console.log('⚙️   Menjalankan CRA build...');
console.log('');

try {
  execSync('react-scripts build', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });
} catch {
  console.error('');
  console.error('❌  Build gagal!');
  process.exit(1);
}

// ── Step 3: Copy app.cfg ──────────────────────────────────────────────────────
console.log('');
console.log(`📋  Menyalin app.cfg (${mode})...`);

if (!fs.existsSync(BUILD_DIR)) {
  console.error('❌  Folder build tidak ditemukan setelah build selesai.');
  process.exit(1);
}

fs.copyFileSync(APP_CFG_SRC, APP_CFG_DEST);
console.log(`    ✅  ${path.basename(APP_CFG_SRC)} → ${path.relative(ROOT, APP_CFG_DEST)}`);

// ── Step 4: Tampilkan isi app.cfg ─────────────────────────────────────────────
try {
  const cfg = JSON.parse(fs.readFileSync(APP_CFG_DEST, 'utf-8'));
  console.log('');
  console.log('    Isi app.cfg yang diterapkan:');
  Object.entries(cfg).forEach(([k, v]) => console.log(`      ${k}: ${JSON.stringify(v)}`));
} catch { /* skip */ }

// ── Selesai ───────────────────────────────────────────────────────────────────
console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log(`║  ✅  BUILD ${mode.toUpperCase()} SELESAI!`.padEnd(51) + '║');
console.log(`║  📁  Output: ./${path.relative(ROOT, BUILD_DIR)}/`.padEnd(51) + '║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');
