import { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export const authRepository = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  findById: (id: number) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
  },

  upsertUser: (payload: { email: string; passwordHash: string; role: UserRole }) => {
    return prisma.user.upsert({
      where: { email: payload.email },
      create: payload,
      update: {
        passwordHash: payload.passwordHash,
        role: payload.role
      }
    });
  }
};
