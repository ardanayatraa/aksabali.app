const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const categoryMap = [
  {
    match: ["01-bentuk", "01-aksara", "01-wyanjana", "01-wresastra"],
    id: "wresastra",
    name: "Aksara Wresastra",
    description: "Bentuk dasar anacaraka dari sample Noto Sans Balinese.",
    order: 10,
  },
  {
    match: ["01-bentuk", "01-aksara", "02-swara"],
    id: "swara",
    name: "Aksara Swara",
    description: "Aksara suara a, i, u, e, dan o dari sample Noto Sans Balinese.",
    order: 20,
  },
  {
    match: ["01-bentuk", "03-gantungan", "01-wresastra"],
    id: "gantungan-wresastra",
    name: "Gantungan Wresastra",
    description: "Bentuk gantungan aksara wresastra dari sample Noto Sans Balinese.",
    order: 30,
  },
  {
    match: ["01-bentuk", "04-angka"],
    id: "angka",
    name: "Angka Bali",
    description: "Angka Bali 0 sampai 9 dari sample Noto Sans Balinese.",
    order: 40,
  },
  {
    match: ["01-bentuk", "05-tanda-baca"],
    id: "tanda-baca",
    name: "Tanda Baca",
    description: "Tanda baca aksara Bali dari sample Noto Sans Balinese.",
    order: 50,
  },
  {
    match: ["02-kombinasi", "01-wresastra-a-i-u-e-o"],
    id: "gabungan-vokal",
    name: "Gabungan Wresastra dan Vokal",
    description: "Gabungan aksara wresastra dengan pangangge suara a, i, u, e, dan o.",
    order: 60,
  },
];

const digitLatin = {
  "digit-zero": "0",
  "digit-one": "1",
  "digit-two": "2",
  "digit-three": "3",
  "digit-four": "4",
  "digit-five": "5",
  "digit-six": "6",
  "digit-seven": "7",
  "digit-eight": "8",
  "digit-nine": "9",
};

const swaraLatin = {
  akara: "a",
  ikara: "i",
  ukara: "u",
  ekara: "e",
  okara: "o",
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function loadEnv() {
  for (const fileName of [".env.local", ".env"]) {
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
      database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    };
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

async function ensureColumn(connection, table, column, definition) {
  const [rows] = await connection.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  if (rows.length) return;
  await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(absolute);
    return [absolute];
  });
}

function categoryFor(relativeParts) {
  return categoryMap.find((category) =>
    category.match.every((segment, index) => relativeParts[index] === segment)
  );
}

function parseBase(fileName) {
  return fileName.replace(/\.noto\.png$/i, "").replace(/\.svg$/i, "");
}

function parseCodepoints(base) {
  const match = base.match(/-((?:[0-9A-F]{4,5}-?)+)$/i);
  if (!match) return [];
  return match[1].split("-").filter(Boolean);
}

function stripCodepoints(base) {
  return base.replace(/-(?:[0-9A-F]{4,5})(?:-[0-9A-F]{4,5})*$/i, "");
}

function glyphFromCodepoints(codepoints) {
  return codepoints.map((codepoint) => String.fromCodePoint(parseInt(codepoint, 16))).join("");
}

function loadStrokeGuide(root) {
  const guidePath = path.join(root, "balinese-goresan.md");
  const guide = new Map();
  if (!fs.existsSync(guidePath)) return guide;

  const content = fs.readFileSync(guidePath, "utf8");
  const rowPattern = /\|\s*U\+([0-9A-F]{4,5})\s*\|[^|\n]*\|[^|\n]*\|\s*(\d+)\s*\|/gi;
  for (const match of content.matchAll(rowPattern)) {
    guide.set(match[1].toUpperCase(), Number(match[2]));
  }
  return guide;
}

function strokeCountFor(codepoints, guide) {
  return codepoints.reduce((total, codepoint) => total + Number(guide.get(codepoint.toUpperCase()) || 0), 0);
}

function titleCase(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function latinFor(slug, categoryId) {
  if (digitLatin[slug]) return digitLatin[slug];
  if (swaraLatin[slug]) return swaraLatin[slug];
  if (categoryId === "tanda-baca") return titleCase(slug);
  if (slug.startsWith("gantungan-")) return slug.replace("gantungan-", "");
  return slug;
}

function nameFor(slug, categoryId) {
  if (digitLatin[slug]) return `Angka ${digitLatin[slug]}`;
  if (swaraLatin[slug]) return titleCase(slug);
  if (categoryId === "gantungan-wresastra") return `Gantungan ${titleCase(slug.replace("gantungan-", ""))}`;
  return titleCase(slug);
}

function copyAsset(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

async function main() {
  loadEnv();
  const root = process.cwd();
  const sampleRoot = path.join(root, "sample", "glyphs");
  const publicRoot = path.join(root, "public", "aksara");
  const files = walkFiles(sampleRoot).filter((file) => file.toLowerCase().endsWith(".noto.png"));
  const strokeGuide = loadStrokeGuide(root);

  const connection = await mysql.createConnection(databaseConfig());
  try {
    await ensureColumn(connection, "aksara", "image_url", "TEXT NULL AFTER svg_url");
    await ensureColumn(connection, "aksara", "target_stroke_count", "INT NOT NULL DEFAULT 0 AFTER image_url");

    for (const category of categoryMap) {
      await connection.query(
        `INSERT INTO categories (id, name, description, \`order\`, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), \`order\` = VALUES(\`order\`), updated_at = NOW()`,
        [category.id, category.name, category.description, category.order]
      );
    }

    let imported = 0;
    const sortedFiles = files.sort((a, b) => a.localeCompare(b));
    const orderByCategory = new Map();

    for (const file of sortedFiles) {
      const relative = path.relative(sampleRoot, file);
      const parts = relative.split(path.sep);
      const category = categoryFor(parts);
      if (!category) continue;

      const fileName = path.basename(file);
      const base = parseBase(fileName);
      const slug = stripCodepoints(base);
      const codepoints = parseCodepoints(base);
      const glyph = glyphFromCodepoints(codepoints);
      if (!glyph) continue;
      const targetStrokeCount = strokeCountFor(codepoints, strokeGuide);

      const order = (orderByCategory.get(category.id) || 0) + 1;
      orderByCategory.set(category.id, order);

      const imageTarget = path.join(publicRoot, "cards", category.id, fileName);
      copyAsset(file, imageTarget);
      const imageUrl = `/aksara/cards/${category.id}/${fileName}`;

      let svgUrl = null;
      const siblingSvg = file.replace(/\.noto\.png$/i, ".svg");
      const topLevelSvg = path.join(root, "sample", `${base}.svg`);
      const svgSource = fs.existsSync(siblingSvg) ? siblingSvg : fs.existsSync(topLevelSvg) ? topLevelSvg : null;
      if (svgSource) {
        const svgFileName = `${base}.svg`;
        const svgTarget = path.join(publicRoot, "strokes", category.id, svgFileName);
        copyAsset(svgSource, svgTarget);
        svgUrl = `/aksara/strokes/${category.id}/${svgFileName}`;
      }

      await connection.query(
        `INSERT INTO aksara
          (id, name, \`char\`, latin, category, \`order\`, is_premium, svg_url, image_url, target_stroke_count, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           \`char\` = VALUES(\`char\`),
           latin = VALUES(latin),
           category = VALUES(category),
           \`order\` = VALUES(\`order\`),
           svg_url = COALESCE(VALUES(svg_url), svg_url),
           image_url = VALUES(image_url),
           target_stroke_count = VALUES(target_stroke_count),
           notes = VALUES(notes),
           updated_at = NOW()`,
        [
          `${category.id}-${base}`.slice(0, 64),
          nameFor(slug, category.id),
          glyph,
          latinFor(slug, category.id),
          category.id,
          order,
          svgUrl,
          imageUrl,
          targetStrokeCount,
          "Asset kartu aksara dari sample Noto Sans Balinese.",
        ]
      );
      imported += 1;
    }

    console.log(`Imported ${imported} glyph PNG assets from sample/glyphs.`);
    console.log("Public card assets: public/aksara/cards/<kategori>/*.png");
    console.log("Public stroke SVG assets: public/aksara/strokes/<kategori>/*.svg");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
