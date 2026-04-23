import { randomBytes } from "crypto";

export const generateJti = (): string => {
  return randomBytes(16).toString("hex");
};