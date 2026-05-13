const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

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

function quoteIdentifier(identifier) {
  if (!identifier || !/^[A-Za-z0-9_$-]+$/.test(identifier)) {
    throw new Error(`DB_NAME tidak valid: ${identifier || '(kosong)'}`);
  }
  return `\`${identifier.replace(/`/g, '``')}\``;
}

function databaseFromUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  const database = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!database) throw new Error('DATABASE_URL wajib menyertakan nama database.');

  const ssl = url.searchParams.get('ssl') === 'true' ? {} : undefined;
  const baseConfig = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl,
  };

  return {
    database,
    serverConfig: baseConfig,
    databaseConfig: {
      ...baseConfig,
      database,
      multipleStatements: true,
    },
  };
}

function databaseFromEnv() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('Isi DATABASE_URL atau DB_HOST, DB_USER, DB_PASSWORD, DB_NAME sebelum migrasi.');
  }

  const baseConfig = {
    host: DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD,
  };

  return {
    database: DB_NAME,
    serverConfig: baseConfig,
    databaseConfig: {
      ...baseConfig,
      database: DB_NAME,
      multipleStatements: true,
    },
  };
}

function resolveDbConfig() {
  return process.env.DATABASE_URL
    ? databaseFromUrl(process.env.DATABASE_URL)
    : databaseFromEnv();
}

async function ensureDatabaseExists({ database, serverConfig }) {
  if (process.env.DB_AUTO_CREATE === 'false') {
    console.log(`DB_AUTO_CREATE=false, skip create database ${database}.`);
    return;
  }

  const connection = await mysql.createConnection(serverConfig);
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Database ready: ${database}`);
  } finally {
    await connection.end();
  }
}

async function ensureColumn(connection, table, column, definition) {
  const [rows] = await connection.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  if (rows.length) return;
  await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  console.log(`Column ready: ${table}.${column}`);
}

async function normalizeKiUluSeed(connection) {
  await connection.query(
    `INSERT INTO aksara
      (id, name, \`char\`, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, audio_url, notes, created_at, updated_at)
     VALUES (
      'gabungan-vokal-ki-1B13-1B36',
      'Ki',
      CONVERT(UNHEX('E1AC93E1ACB6') USING utf8mb4),
      'ki',
      'gabungan-vokal',
      0,
      0,
      '/aksara/strokes/gabungan-vokal/ki-1B13-1B36.svg',
      '/aksara/cards/gabungan-vokal/ki-1B13-1B36.noto.png',
      2,
      NULL,
      'Materi Ki. Ulu memakai U+1B36, sehingga bacaan yang benar adalah ki.',
      NOW(),
      NOW()
     )
     ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      \`char\` = VALUES(\`char\`),
      latin = VALUES(latin),
      svg_url = VALUES(svg_url),
      image_url = VALUES(image_url),
      target_stroke_count = VALUES(target_stroke_count),
      notes = VALUES(notes),
      updated_at = NOW()`
  );

  await connection.query("UPDATE progress SET aksara_id = 'gabungan-vokal-ki-1B13-1B36' WHERE aksara_id IN ('ki-1B13-1B35', 'ki-1B13-1B36')");
  await connection.query("UPDATE stroke_attempts SET aksara_id = 'gabungan-vokal-ki-1B13-1B36' WHERE aksara_id IN ('ki-1B13-1B35', 'ki-1B13-1B36')");
  await connection.query("DELETE FROM aksara WHERE id IN ('ki-1B13-1B35', 'ki-1B13-1B36')");
  console.log('Legacy Ki seed normalized.');
}

async function main() {
  loadEnv();

  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const config = resolveDbConfig();

  await ensureDatabaseExists(config);

  const connection = await mysql.createConnection(config.databaseConfig);
  try {
    const seedMarker = 'INSERT INTO categories';
    const seedIndex = schema.indexOf(seedMarker);
    const ddl = seedIndex >= 0 ? schema.slice(0, seedIndex) : schema;
    const seed = seedIndex >= 0 ? schema.slice(seedIndex) : '';

    await connection.query(ddl);
    await ensureColumn(connection, 'aksara', 'image_url', 'TEXT NULL AFTER svg_url');
    await ensureColumn(connection, 'aksara', 'target_stroke_count', 'INT NOT NULL DEFAULT 0 AFTER image_url');
    await ensureColumn(connection, 'profiles', 'status', "ENUM('active','suspended') NOT NULL DEFAULT 'active' AFTER tier");
    if (seed.trim()) {
      await connection.query(seed);
    }
    await normalizeKiUluSeed(connection);
    console.log('Database schema migrated.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
