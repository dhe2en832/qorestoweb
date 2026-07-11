#!/usr/bin/env node

/* eslint-env node */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
}

function runSilent(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    return e.stdout || '';
  }
}

/**
 * Baca changelog hari ini dan ekstrak ringkasan untuk commit message.
 * Format changelog: ### Kategori → #### N. file → **Perubahan:** ...
 */
function buildCommitMessage() {
  const today = new Date();
  const y  = today.getFullYear();
  const m  = String(today.getMonth() + 1).padStart(2, '0');
  const d  = String(today.getDate()).padStart(2, '0');
  const changelogPath = path.join(process.cwd(), `docs/changelog/daily/codeChange-${y}${m}${d}.md`);

  let bodyLines = [];

  if (fs.existsSync(changelogPath)) {
    const content = fs.readFileSync(changelogPath, 'utf8');

    // Ambil semua entry per kategori
    const categoryBlocks = [...content.matchAll(/^### (.+?)\n([\s\S]*?)(?=^### |\n## 📊|$)/gm)];

    categoryBlocks.forEach(([, catName, block]) => {
      const entries = [...block.matchAll(/^#### \d+\. (.+?) \[[\d_]+\]\n\*\*Fungsi:\*\* (.+?)\s*\n\*\*Perubahan:\*\* (.+?)\s*\n/gm)];
      if (!entries.length) return;
      bodyLines.push(catName.trim());
      entries.forEach(([, file, , perubahan]) => {
        bodyLines.push(`  • ${path.basename(file)} — ${perubahan}`);
      });
      bodyLines.push('');
    });

    // Fallback ke summary jika tidak ada entry detail
    if (!bodyLines.length) {
      const summaryMatch = content.match(/## 📊 \*\*Summary\*\*([\s\S]*?)$/);
      if (summaryMatch) {
        bodyLines = summaryMatch[1].trim().split('\n')
          .filter(l => l.startsWith('-'))
          .map(l => l.replace(/^- /, '').trim());
      }
    }
  }

  // Fallback: daftar file yang di-stage
  if (!bodyLines.length) {
    const staged = runSilent('git diff --cached --name-only').trim();
    if (staged) bodyLines = staged.split('\n').map(f => `  • ${f}`);
  }

  const dateLabel = today.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const subject = `chore: update ${dateLabel}`;
  const body    = bodyLines.join('\n').trim();

  return body ? `${subject}\n\n${body}` : subject;
}

function main() {
  // 1. Generate changelog dulu
  console.log('🔄 Generating changelog...');
  try {
    run('node generate-changelog.cjs');
  } catch (_) {
    console.warn('⚠️  Changelog generation failed, continuing...');
  }

  // 2. Cek apakah ada perubahan
  const status = runSilent('git status --porcelain').trim();
  if (!status) {
    console.log('✅ Nothing to commit, working tree clean.');
    process.exit(0);
  }

  // 3. Stage semua
  console.log('\n📦 Staging all changes...');
  run('git add -A');

  // 4. Build commit message dari changelog
  const message = buildCommitMessage();
  console.log('\n📝 Commit message:\n');
  console.log('─'.repeat(50));
  console.log(message);
  console.log('─'.repeat(50));

  // 5. Commit via temp file (aman dari karakter spesial)
  const tmpFile = path.join(process.cwd(), '.git', '_commit_msg_tmp');
  fs.writeFileSync(tmpFile, message, 'utf8');

  console.log('\n✍️  Committing...');
  run(`git commit -F "${tmpFile}"`);
  fs.unlinkSync(tmpFile);

  // 6. Push
  console.log('\n🚀 Pushing...');
  run('git push');

  console.log('\n✅ Done!');
}

main();
