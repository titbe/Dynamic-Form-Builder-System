import { FieldType, FormStatus, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateFieldInput, CreateFormInput, UpdateFieldInput, UpdateFormInput } from "./form.types";

export const formRepository = {
  findMany: (params: {
    skip: number;
    take: number;
    search?: string;
    status?: FormStatus;
  }) => {
    const where: Prisma.FormWhereInput = {
      status: params.status,
      title: params.search
        ? {
            contains: params.search,
            mode: "insensitive"
          }
        : undefined
    };

    return prisma.$transaction([
      prisma.form.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ order: "asc" }, { id: "asc" }],
        include: {
          fields: {
            orderBy: [{ order: "asc" }, { id: "asc" }]
          }
        }
      }),
      prisma.form.count({ where })
    ]);
  },

  findById: (id: number) => {
    return prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: [{ order: "asc" }, { id: "asc" }]
        }
      }
    });
  },

  create: (payload: CreateFormInput) => {
    return prisma.form.create({ data: payload });
  },

  update: (id: number, payload: UpdateFormInput) => {
    return prisma.form.update({
      where: { id },
      data: payload
    });
  },

  remove: (id: number) => {
    return prisma.form.delete({ where: { id } });
  },

  addField: (formId: number, payload: CreateFieldInput) => {
    return prisma.field.create({
      data: {
        formId,
        label: payload.label,
        type: payload.type as FieldType,
        order: payload.order,
        required: payload.required,
        options: payload.options ?? Prisma.JsonNull
      }
    });
  },

  updateField: (formId: number, fieldId: number, payload: UpdateFieldInput) => {
    return prisma.$transaction(async (tx) => {
      const target = await tx.field.findFirst({ where: { id: fieldId, formId } });
      if (!target) {
        return null;
      }

      return tx.field.update({
        where: { id: target.id },
        data: {
          ...payload,
          options:
            payload.options === undefined
              ? undefined
              : payload.options.length === 0
                ? Prisma.JsonNull
                : payload.options
        }
      });
    });
  },

  deleteField: (formId: number, fieldId: number) => {
    return prisma.field.deleteMany({
      where: {
        id: fieldId,
        formId
      }
    });
  },

  findActiveForms: () => {
    return prisma.form.findMany({
      where: { status: FormStatus.ACTIVE },
      orderBy: [{ order: "asc" }, { id: "asc" }],
      include: {
        fields: {
          orderBy: [{ order: "asc" }, { id: "asc" }]
        }
      }
    });
  },

  reorderForms: async (items: Array<{ id: number; order: number }>) => {
    await prisma.$transaction(
      items.map((item) =>
        prisma.form.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    );
  },

  reorderFields: async (formId: number, items: Array<{ id: number; order: number }>) => {
    const result = await prisma.$transaction(
      items.map((item) =>
        prisma.field.updateMany({
          where: { id: item.id, formId },
          data: { order: item.order }
        })
      )
    );

    return result.reduce((acc, item) => acc + item.count, 0);
  }
};
