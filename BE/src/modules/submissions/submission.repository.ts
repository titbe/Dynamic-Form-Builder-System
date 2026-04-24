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

  list(params: { skip: number; take: number; search?: string }) {
    const where: Prisma.SubmissionWhereInput = {};

    if (params.search) {
      where.answers = {
        path: [],
        string_contains: params.search
      };
    }

    return prisma.$transaction([
      prisma.submission.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          form: {
            include: {
              fields: true
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
      }),
      prisma.submission.count({ where })
    ]);
  }
};
