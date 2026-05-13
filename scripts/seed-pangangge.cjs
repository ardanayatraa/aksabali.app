// Seed Pangangge Suara (sandangan vokal aksara Bali) ke tabel `aksara`.
//
// Tidak ada hardcode karakter aksara di file ini — char di-construct dari
// codepoint Unicode (Balinese block U+1B00..U+1B7F) menggunakan
// String.fromCodePoint(). Rendering glyph runtime via Noto Sans Balinese
// (bundled di mobile/, dipakai juga via web font).
//
// Usage:
//   npm run db:seed-pangangge
//
// Idempotent — boleh dijalankan berulang. Pakai ON DUPLICATE KEY UPDATE.

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Konfigurasi metadata (codepoint + nama + transliterasi).
// Sumber codepoint: standar Unicode Balinese block.
// Lihat https://www.unicode.org/charts/PDF/U1B00.pdf
const DOTTED_CIRCLE = 0x25cc; // U+25CC — placeholder visual untuk diacritic standalone.

const PANGANGGE = [
  {
    slug: 'ulu',
    codepoint: 0x1b36,
    name: 'Ulu',
    latin: 'i',
    order: 1,
    notes: 'Sandangan vokal /i/. Ditulis di atas konsonan dasar. Contoh: ka + ulu = ki.'
  },
  {
    slug: 'suku',
    codepoint: 0x1b38,
    name: 'Suku',
    latin: 'u',
    order: 2,
    notes: 'Sandangan vokal /u/. Ditulis di bawah konsonan dasar. Contoh: ka + suku = ku.'
  },
  {
    slug: 'taleng',
    codepoint: 0x1b3e,
    name: 'Taleng',
    latin: 'é',
    order: 3,
    notes: 'Sandangan vokal /é/. Ditulis di depan konsonan dasar. Contoh: ka + taleng = ké.'
  },
  {
    slug: 'pepet',
    codepoint: 0x1b42,
    name: 'Pepet',
    latin: 'ě',
    order: 4,
    notes: 'Sandangan vokal /ě/ (schwa). Ditulis di atas konsonan dasar.'
  },
  {
    slug: 'tedung',
    codepoint: 0x1b35,
    name: 'Tedung',
    latin: 'aa',
    order: 5,
    notes: 'Tanda pemanjang vokal /aa/. Ditulis setelah konsonan dasar. Contoh: ka + tedung = kaa.'
  },
  {
    slug: 'taleng-tedung',
    codepoint: 0x1b40,
    name: 'Taleng Tedung',
    latin: 'o',
    order: 6,
    notes: 'Sandangan vokal /o/. Kombinasi mengapit konsonan dasar. Contoh: ka + taleng tedung = ko.'
  }
];

// Build glyph dengan dotted-circle placeholder + diacritic codepoint.
// Hasil: U+25CC + U+1B36 = "◌ᬶ" untuk Ulu, dst.
function buildGlyph(codepoint) {
  return String.fromCodePoint(DOTTED_CIRCLE) + String.fromCodePoint(codepoint);
}

function buildId(slug, codepoint) {
  return `swara-${slug}-${codepoint.toString(16).toUpperCase()}`;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function loadEnv() {
  for (const fileName of ['.env.local', '.env']) {
    loadEnvFile(path.join(process.cwd(), fileName));
  }
}

function databaseConfig() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, ''))
    };
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
}

async function main() {
  loadEnv();
  const connection = await mysql.createConnection(databaseConfig());

  try {
    // Pastikan kategori 'swara' ada (sudah di-seed via schema.sql, tapi safe untuk ulang).
    await connection.query(
      `INSERT INTO categories (id, name, description, \`order\`, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), updated_at = NOW()`,
      [
        'swara',
        'Pangangge Suara',
        'Sandangan vokal: ulu, suku, taleng, pepet, tedung, taleng tedung.',
        20
      ]
    );

    // Bersihin legacy Aksara Swara mandiri (akara/ikara/ukara/ekara/okara) — diganti pangangge.
    const legacyIds = ['swara-akara-1B05', 'swara-ikara-1B07', 'swara-ukara-1B09', 'swara-ekara-1B0F', 'swara-okara-1B11'];
    await connection.query(
      `DELETE FROM aksara WHERE id IN (${legacyIds.map(() => '?').join(',')})`,
      legacyIds
    );

    let inserted = 0;
    for (const item of PANGANGGE) {
      const id = buildId(item.slug, item.codepoint);
      const glyph = buildGlyph(item.codepoint);
      await connection.query(
        `INSERT INTO aksara
          (id, name, \`char\`, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'swara', ?, FALSE, NULL, NULL, 1, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           \`char\` = VALUES(\`char\`),
           latin = VALUES(latin),
           category = VALUES(category),
           \`order\` = VALUES(\`order\`),
           notes = VALUES(notes),
           updated_at = NOW()`,
        [id, item.name, glyph, item.latin, item.order, item.notes]
      );
      console.log(`✓ ${id.padEnd(32)} U+${item.codepoint.toString(16).toUpperCase().padStart(4, '0')}  ${item.latin}`);
      inserted += 1;
    }

    console.log('');
    console.log(`✓ Done. ${inserted} pangangge suara di-seed.`);
    console.log('  Glyph di-construct dari codepoint Unicode via String.fromCodePoint().');
    console.log('  Tidak ada character literal aksara di code.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('✗ Seed pangangge gagal:', error.message);
  process.exit(1);
});
