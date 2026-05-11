export class ProductionConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProductionConfigError";
  }
}

export function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return { uri: process.env.DATABASE_URL };
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) return null;

  return {
    host,
    port: Number(process.env.DB_PORT || 3306),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
    queueLimit: 0
  };
}

export function assertDatabaseConfig() {
  const config = getDatabaseConfig();
  if (!config) {
    throw new ProductionConfigError(
      "Database production belum dikonfigurasi. Isi DATABASE_URL atau DB_HOST, DB_USER, DB_PASSWORD, DB_NAME."
    );
  }
  return config;
}

export function assertJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "change-this-in-production") {
    throw new ProductionConfigError("JWT_SECRET production wajib diisi dengan secret kuat.");
  }
  return secret;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
}

export function productionStatus() {
  return {
    database: Boolean(getDatabaseConfig()),
    jwt: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET !== "change-this-in-production"),
    midtrans: Boolean(process.env.MIDTRANS_SERVER_KEY && process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY),
    appUrl: getAppUrl()
  };
}
