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

function buildCommitMessage() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const subject = `chore: update ${dateLabel}`;

  // Daftar file yang di-stage sebagai body
  const staged = runSilent('git diff --cached --name-only').trim();
  const bodyLines = staged
    ? staged.split('\n').map((f) => `  • ${f}`)
    : [];

  const body = bodyLines.join('\n').trim();
  return body ? `${subject}\n\n${body}` : subject;
}

function main() {
  // Cek apakah ada perubahan
  const status = runSilent('git status --porcelain').trim();
  if (!status) {
    console.log('✅ Nothing to commit, working tree clean.');
    process.exit(0);
  }

  console.log('\n📦 Staging all changes...');
  run('git add -A');

  const message = buildCommitMessage();
  console.log('\n📝 Commit message:\n');
  console.log('─'.repeat(50));
  console.log(message);
  console.log('─'.repeat(50));

  // Tulis message ke temp file agar aman dari karakter spesial
  const tmpFile = path.join(process.cwd(), '.git', '_commit_msg_tmp');
  fs.writeFileSync(tmpFile, message, 'utf8');

  console.log('\n✍️  Committing...');
  run(`git commit -F "${tmpFile}"`);
  fs.unlinkSync(tmpFile);

  console.log('\n🚀 Pushing...');
  run('git push');

  console.log('\n✅ Done!');
}

main();
