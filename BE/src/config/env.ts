import { randomBytes } from "crypto";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/form_management?schema=public",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6380",

  // JWT secret (for HS256/HS512 symmetric signing)
  jwtPrivateKey: process.env.JWT_SECRET ?? "your-super-secret-key-change-in-production",
  jwtPublicKey: process.env.JWT_SECRET ?? "your-super-secret-key-change-in-production",

  // Token expiry times
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",

  // Default users
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@example.com",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
  swEmail: process.env.SW_EMAIL ?? "sw@example.com",
  swPassword: process.env.SW_PASSWORD ?? "sw123456",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
};

export const generateJti = (): string => {
  return randomBytes(16).toString("hex");
};