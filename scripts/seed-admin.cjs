// Seed atau promote akun admin Aksa Bali.
//
// Usage:
//   npm run db:seed-admin -- user@gmail.com
//     → kalau user sudah ada (mis. dari Google login), promote role-nya jadi admin.
//
//   npm run db:seed-admin -- new@admin.com --create
//     → bikin akun admin baru dengan password auto-generate (dicetak ke console).
//
//   npm run db:seed-admin -- new@admin.com --create --name="Nama Admin" --password=Rahasia123
//     → bikin akun admin baru dengan nama + password yang ditentukan.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function loadEnv() {
  for (const fileName of ['.env.local', '.env']) {
    loadEnvFile(path.join(process.cwd(), fileName));
  }
}

function databaseFromUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  const database = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!database) throw new Error('DATABASE_URL wajib menyertakan nama database.');
  const ssl = url.searchParams.get('ssl') === 'true' ? {} : undefined;
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    ssl,
  };
}

function databaseFromEnv() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('Isi DATABASE_URL atau DB_HOST, DB_USER, DB_PASSWORD, DB_NAME di .env.local.');
  }
  return {
    host: DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  };
}

function getConnectionConfig() {
  if (process.env.DATABASE_URL) return databaseFromUrl(process.env.DATABASE_URL);
  return databaseFromEnv();
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {};
  let positional = null;

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq > -1) {
        const key = arg.slice(2, eq);
        const value = arg.slice(eq + 1).replace(/^["']|["']$/g, '');
        flags[key] = value;
      } else {
        flags[arg.slice(2)] = true;
      }
    } else if (!positional) {
      positional = arg;
    }
  }

  return {
    email: positional,
    create: Boolean(flags.create),
    name: typeof flags.name === 'string' ? flags.name : null,
    password: typeof flags.password === 'string' ? flags.password : null,
  };
}

function generatePassword(length = 16) {
  return crypto
    .randomBytes(length * 2)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .slice(0, length);
}

function printUsageAndExit(code = 1) {
  console.error('Usage:');
  console.error('  npm run db:seed-admin -- <email>                    (promote existing user)');
  console.error('  npm run db:seed-admin -- <email> --create           (bikin admin baru, password auto)');
  console.error('  npm run db:seed-admin -- <email> --create --name="Nama" --password=Rahasia123');
  process.exit(code);
}

async function main() {
  loadEnv();
  const { email, create, name, password } = parseArgs();

  if (!email || !email.includes('@')) {
    console.error('✗ Email tidak valid atau tidak diberikan.\n');
    printUsageAndExit();
  }

  const normalizedEmail = email.trim().toLowerCase();
  const connection = await mysql.createConnection(getConnectionConfig());

  try {
    const [existing] = await connection.query(
      'SELECT id, email, display_name, role FROM profiles WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existing.length > 0) {
      const user = existing[0];
      if (user.role === 'admin') {
        console.log(`✓ ${normalizedEmail} sudah admin. Tidak ada perubahan.`);
        console.log(`  Display name: ${user.display_name}`);
        return;
      }
      await connection.query(
        'UPDATE profiles SET role = ?, updated_at = NOW() WHERE email = ?',
        ['admin', normalizedEmail]
      );
      console.log(`✓ Promoted: ${normalizedEmail}`);
      console.log(`  Display name: ${user.display_name}`);
      console.log(`  Role: ${user.role} → admin`);
      console.log('');
      console.log('  Login pakai akun Google yang sudah ada. Setelah login, otomatis');
      console.log('  diarahkan ke /admin.');
      return;
    }

    if (!create) {
      console.error(`✗ User dengan email "${normalizedEmail}" belum ada di database.`);
      console.error('');
      console.error('Pilihan:');
      console.error('  1. Login Google dulu di /login pakai email itu, lalu run lagi.');
      console.error('  2. Pakai flag --create untuk bikin akun admin baru dengan password.');
      process.exit(1);
    }

    const id = crypto.randomUUID();
    const displayName = name || normalizedEmail.split('@')[0];
    const finalPassword = password || generatePassword();
    const passwordHash = await bcrypt.hash(finalPassword, 10);

    await connection.query(
      `INSERT INTO profiles
        (id, email, display_name, role, tier, email_verified_at, created_at, updated_at)
       VALUES (?, ?, ?, 'admin', 'free', NOW(), NOW(), NOW())`,
      [id, normalizedEmail, displayName]
    );
    await connection.query(
      `INSERT INTO user_credentials (user_id, password_hash, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [id, passwordHash]
    );

    console.log('✓ Akun admin baru dibuat:');
    console.log(`  Email:    ${normalizedEmail}`);
    console.log(`  Name:     ${displayName}`);
    console.log(`  Password: ${finalPassword}`);
    console.log('');
    console.log('  ⚠ Simpan password sekarang — tidak akan ditampilkan ulang.');
    console.log('  ℹ /login UI sekarang Google-only. Login pakai email+password ini lewat');
    console.log('    POST /api/auth/login (curl/Postman) untuk dapat cookie admin.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('✗ Seed admin gagal:', error.message);
  process.exit(1);
});
