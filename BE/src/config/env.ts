const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required(process.env.DATABASE_URL, "DATABASE_URL"),
  jwtSecret: required(process.env.JWT_SECRET, "JWT_SECRET"),
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@example.com",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
  swEmail: process.env.SW_EMAIL ?? "sw@example.com",
  swPassword: process.env.SW_PASSWORD ?? "sw123456"
};
