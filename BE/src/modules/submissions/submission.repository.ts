import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export const submissionRepository = {
  create(formId: number, answers: Record<string, unknown>, userId: number) {
    return prisma.submission.create({
      data: {
        formId,
        userId,
        answers: answers as Prisma.InputJsonValue
      }
    });
  },

  list() {
    return prisma.submission.findMany({
      include: {
        form: {
          select: {
            id: true,
            title: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: [{ createdAt: "desc" }]
    });
  }
};
