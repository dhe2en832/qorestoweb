#!/usr/bin/env node

/* eslint-env node */

/*
  generate-changelog.cjs — QORESTOWEB
  ─────────────────────────────────────
  Generate changelog harian dari git commits hari ini + unstaged changes.
  Output disimpan ke: docs/changelog/daily/codeChange-YYYYMMDD.md

  Usage:
    node generate-changelog.cjs
    node generate-changelog.cjs --date=2026-07-11
*/

const fs      = require('fs');
const path    = require('path');
const { execSync } = require('child_process');

class ChangelogGenerator {
  constructor() {
    this.docsDir = path.join(process.cwd(), 'docs/changelog/daily');

    const dateArg = process.argv.find(a => a.startsWith('--date='));
    this.targetDate = dateArg
      ? dateArg.split('=')[1]
      : new Date().toISOString().split('T')[0];

    console.log(`📅 Generating changelog for: ${this.targetDate}`);
  }

  // ─── Git helpers ────────────────────────────────────────────────────────────

  runSilent(cmd) {
    try {
      return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
      return e.stdout || '';
    }
  }

  getCommits() {
    const cmd = `git log --since="${this.targetDate} 00:00:00" --until="${this.targetDate} 23:59:59" --pretty=format:"%H|%s|%ai" --name-only`;
    const output = this.runSilent(cmd);
    const commits = [];
    let current = null;

    output.split('\n').forEach(line => {
      if (line.includes('|')) {
        if (current) commits.push(current);
        const [hash, message, date] = line.split('|');
        current = { hash: hash.trim(), message: message.trim(), date: date.trim(), files: [] };
      } else if (line.trim() && current) {
        current.files.push(line.trim());
      }
    });
    if (current) commits.push(current);

    // Tambahkan unstaged changes sebagai virtual commit
    const status = this.runSilent('git status --porcelain').trim();
    if (status) {
      const changedFiles = status.split('\n')
        .filter(l => l.trim())
        .map(l => l.substring(3).trim());
      commits.push({
        hash: 'UNSTAGED',
        message: 'chore: perubahan belum di-commit',
        date: new Date().toISOString(),
        files: changedFiles,
      });
    }

    return commits;
  }

  getFileDiff(filePath, commitHash) {
    try {
      const cmd = commitHash === 'UNSTAGED'
        ? `git diff HEAD -- "${filePath}"`
        : `git show ${commitHash} -- "${filePath}"`;
      return this.runSilent(cmd);
    } catch (_) {
      return '';
    }
  }

  // ─── Kategorisasi ───────────────────────────────────────────────────────────

  categorizeFile(filePath, diff, commitMsg) {
    const f = filePath.toLowerCase();
    const m = (commitMsg || '').toLowerCase();

    if (f.includes('.md') || f.includes('readme') || f.includes('docs/') || f.includes('changelog')) return '📖 Documentation';
    if (f.includes('.test.') || f.includes('.spec.') || f.includes('/tests/'))                       return '🧪 Tests';
    if (f.includes('package.json') || f.endsWith('.cjs') || f.includes('.env') || f.includes('vite.config')) return '⚙️ Config';
    if (f.includes('/context/') || f.includes('auth') || f.includes('session') || f.includes('login')) return '🔐 Auth/Session';
    if (f.includes('/routes/') || f.includes('api') || f.endsWith('_api.js'))                        return '🔌 API';
    if (f.includes('/components/') || f.endsWith('.css') || f.endsWith('.scss'))                     return '🎨 UI/UX';
    if (f.includes('/modules/'))                                                                      return '✨ Features';
    if (m.startsWith('fix:') || m.includes('fix') || m.includes('bug'))                              return '🐞 Fixes';
    if (m.startsWith('feat:') || m.includes('add ') || m.includes('new '))                           return '✨ Features';
    return '⚙️ Others';
  }

  // ─── Deskripsi fungsi & perubahan ───────────────────────────────────────────

  extractFunction(filePath, diff) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const f = filePath.toLowerCase();

    const fileDescriptions = {
      'app':         'Entry point aplikasi React',
      'index':       'Entry point / registrasi React',
      'config':      'Konfigurasi aplikasi (base URL, konstanta)',
      'login':       'Halaman & logika login',
      'home':        'Halaman utama / dashboard',
      'menu':        'Halaman daftar menu',
      'detail':      'Halaman detail item',
      'checkout':    'Halaman checkout & submit order',
      'authcontext': 'Context autentikasi global',
      'authroute':   'Guard routing autentikasi',
    };

    const lowerName = fileName.toLowerCase();
    for (const [key, desc] of Object.entries(fileDescriptions)) {
      if (lowerName.includes(key)) return desc;
    }

    if (f.includes('/components/')) return `Komponen UI: ${fileName}`;
    if (f.includes('/hooks/'))      return `Custom hook: ${fileName}`;
    if (f.includes('/utils/'))      return `Utility: ${fileName}`;
    if (f.includes('/routes/'))     return `Route: ${fileName}`;
    if (f.includes('/context/'))    return `Context: ${fileName}`;
    if (f.includes('/modules/'))    return `Modul: ${fileName}`;

    // Cari nama fungsi dari diff
    const fnMatch = diff.match(/^\+\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/m);
    if (fnMatch) return `Fungsi: ${fnMatch[1]}`;
    const arrowMatch = diff.match(/^\+\s*(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(/m);
    if (arrowMatch) return `Fungsi: ${arrowMatch[1]}`;

    return `Implementasi: ${fileName}`;
  }

  extractChanges(filePath, diff) {
    const changes = new Set();
    const f = filePath.toLowerCase();
    const lines = (diff || '').split('\n');

    // Pola spesifik qorestoweb
    if (f.includes('/context/')) {
      if (diff.includes('localStorage'))   changes.add('Ubah pengelolaan localStorage');
      if (diff.includes('fetch('))         changes.add('Ubah HTTP request ke API');
      if (diff.includes('useState'))       changes.add('Ubah state management context');
    }
    if (f.includes('package.json')) {
      if (diff.includes('"scripts"'))      changes.add('Tambah/ubah npm script');
      if (diff.includes('"dependencies"')) changes.add('Tambah/ubah dependency');
      if (diff.includes('"version"'))      changes.add('Update versi aplikasi');
    }
    if (f.includes('.env') || f.includes('env-cmdrc')) {
      changes.add('Ubah konfigurasi environment / API endpoint');
    }

    // Pola generik React
    lines.forEach(line => {
      const isAdd = line.startsWith('+') && !line.startsWith('+++');
      const isDel = line.startsWith('-') && !line.startsWith('---');
      if (!isAdd && !isDel) return;
      const c = line.substring(1).trim();

      if (isAdd) {
        if (c.match(/^(export\s+)?(async\s+)?function\s+\w+/))             changes.add(`Tambah fungsi: ${(c.match(/function\s+(\w+)/) || [])[1] || ''}`);
        if (c.match(/^(export\s+)?(const|let)\s+\w+\s*=\s*(async\s*)?\(/)) changes.add(`Tambah fungsi: ${(c.match(/(const|let)\s+(\w+)/) || [])[2] || ''}`);
        if (c.match(/^import\s+.+from\s+['"]/)) {
          const mod = (c.match(/from\s+['"](.+?)['"]/) || [])[1];
          if (mod) changes.add(`Import: ${path.basename(mod)}`);
        }
        if (c.includes('useState'))         changes.add('Tambah state management');
        if (c.includes('useEffect'))        changes.add('Tambah side effect');
        if (c.includes('useContext'))       changes.add('Gunakan context');
        if (c.includes('fetch('))           changes.add('Tambah HTTP request');
        if (c.includes('localStorage'))     changes.add('Akses localStorage');
        if (c.includes('navigate('))        changes.add('Tambah navigasi halaman');
        if (c.includes('try {') || c.includes('catch('))  changes.add('Tambah error handling');
        if (c.includes('return ('))         changes.add('Ubah render/return JSX');
      }
      if (isDel) {
        if (c.includes('console.log'))      changes.add('Hapus debug log');
      }
    });

    const result = [...changes]
      .map(s => s.replace(/:\s*$/, '').trim())
      .filter(s => s.length > 3);

    return result.length > 0 ? result.join('; ') : 'Pembaruan kode';
  }

  // ─── Line numbers ────────────────────────────────────────────────────────────

  extractLineNumbers(diff) {
    const nums = [];
    let cur = 0;
    (diff || '').split('\n').forEach(line => {
      if (line.startsWith('@@')) {
        const m = line.match(/@@ -\d+(?:,\d+)?\s+\+(\d+)/);
        if (m) cur = parseInt(m[1]);
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        if (cur > 0) { nums.push(cur); cur++; }
      } else if (!line.startsWith('-') && !line.startsWith('@@') && cur > 0) {
        cur++;
      }
    });
    if (!nums.length) return 'N/A';
    const ranges = [];
    let s = nums[0], e = nums[0];
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === e + 1) { e = nums[i]; }
      else { ranges.push(s === e ? `${s}` : `${s}-${e}`); s = nums[i]; e = nums[i]; }
    }
    ranges.push(s === e ? `${s}` : `${s}-${e}`);
    return ranges.join(', ');
  }

  // ─── Format diff snippet ─────────────────────────────────────────────────────

  formatDiff(diff) {
    if (!diff || diff.length < 10) return null;
    const lines = diff.split('\n');
    const out = [];
    let inBlock = false;

    lines.forEach(line => {
      if (line.startsWith('@@')) {
        const m = line.match(/@@ -\d+(?:,\d+)?\s+\+(\d+)/);
        if (m) { out.push(`// Line ${m[1]}:`); inBlock = true; }
      } else if (inBlock && line.startsWith('+') && !line.startsWith('+++')) {
        out.push(`+ ${line.substring(1)}`);
      } else if (inBlock && line.startsWith('-') && !line.startsWith('---')) {
        out.push(`- ${line.substring(1)}`);
      }
    });

    if (!out.length) return null;
    if (out.length > 50) out.splice(25, out.length - 50, '  // ... (truncated)');
    return out.join('\n');
  }

  // ─── Timestamp helper ────────────────────────────────────────────────────────

  formatTimestamp(dateStr) {
    const d = new Date(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  // ─── Markdown output ─────────────────────────────────────────────────────────

  formatMarkdown(categories) {
    const dateStr = new Date(this.targetDate + 'T12:00:00')
      .toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    let md = `# Code Changes Summary\n\n## ${dateStr}\n\n`;
    let total = 0;
    const counts = {};

    Object.entries(categories).forEach(([cat, entries]) => {
      if (!entries.length) return;
      total += entries.length;
      counts[cat] = entries.length;
      md += `### ${cat}\n\n`;

      entries.forEach((entry, i) => {
        md += `#### ${i + 1}. ${entry.file} [${entry.timestamp}]\n`;
        md += `**Fungsi:** ${entry.fungsi}  \n`;
        md += `**Perubahan:** ${entry.perubahan}  \n`;
        if (entry.lines !== 'N/A') md += `**Lines:** ${entry.lines}\n`;
        if (entry.diff) {
          md += '\n```javascript\n';
          md += entry.diff;
          md += '\n```\n';
        }
        md += '\n---\n\n';
      });
    });

    md += '## 📊 **Summary**\n';
    Object.entries(counts).forEach(([cat, n]) => {
      md += `- **${cat}:** ${n} item${n > 1 ? 's' : ''}\n`;
    });
    md += `- **Total Files Modified:** ${total}\n`;

    const main = Object.entries(counts).sort(([,a],[,b]) => b - a)[0];
    if (main) md += `- **Main Focus:** ${main[0].replace(/[\u2700-\u27BF]\s/, '')}\n`;

    return md;
  }

  // ─── Main ────────────────────────────────────────────────────────────────────

  generate() {
    const commits = this.getCommits();
    if (!commits.length) {
      console.log('ℹ️  Tidak ada commit hari ini.');
      return null;
    }

    const categories = {
      '✨ Features':      [],
      '🐞 Fixes':         [],
      '📖 Documentation': [],
      '🧪 Tests':         [],
      '🎨 UI/UX':         [],
      '🔐 Auth/Session':  [],
      '🔌 API':           [],
      '⚙️ Config':        [],
      '⚙️ Others':        [],
    };

    const seen = new Set();

    commits.forEach(commit => {
      commit.files.forEach(filePath => {
        const key = `${filePath}-${commit.hash}`;
        if (seen.has(key)) return;
        seen.add(key);

        const diff      = this.getFileDiff(filePath, commit.hash);
        const cat       = this.categorizeFile(filePath, diff, commit.message);
        const fungsi    = this.extractFunction(filePath, diff);
        const perubahan = this.extractChanges(filePath, diff);
        const lines     = this.extractLineNumbers(diff);
        const diffFmt   = this.formatDiff(diff);
        const timestamp = this.formatTimestamp(commit.date);

        categories[cat].push({ file: filePath, timestamp, fungsi, perubahan, lines, diff: diffFmt });
      });
    });

    return this.formatMarkdown(categories);
  }

  save(content) {
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
    }
    const [y, m, d] = this.targetDate.split('-');
    const file = path.join(this.docsDir, `codeChange-${y}${m}${d}.md`);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Changelog saved: ${file}`);
    return file;
  }

  run() {
    try {
      const content = this.generate();
      if (content) this.save(content);
      else console.log('ℹ️  Tidak ada perubahan untuk didokumentasikan.');
    } catch (err) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  new ChangelogGenerator().run();
}

module.exports = ChangelogGenerator;
