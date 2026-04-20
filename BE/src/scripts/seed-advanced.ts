import "dotenv/config";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { FieldType, FormStatus, Prisma, PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const toInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || parsed < 0 ? fallback : parsed;
};

const config = {
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@example.com",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
  swEmail: process.env.SW_EMAIL ?? "sw@example.com",
  swPassword: process.env.SW_PASSWORD ?? "sw123456",
  activeFormCount: toInt(process.env.SEED_ACTIVE_FORMS, 20),
  draftFormCount: toInt(process.env.SEED_DRAFT_FORMS, 8),
  submissionsPerForm: toInt(process.env.SEED_SUBMISSIONS_PER_FORM, 6),
  swUserCount: Math.max(1, toInt(process.env.SEED_SW_USERS, 6))
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomHexColor = () => {
  const chars = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i += 1) {
    color += chars[randomInt(0, chars.length - 1)];
  }
  return color;
};

const makeAnswerByType = (field: {
  id: number;
  type: FieldType;
  required: boolean;
  options: Prisma.JsonValue | null;
}) => {
  if (!field.required && Math.random() < 0.2) {
    return undefined;
  }

  switch (field.type) {
    case FieldType.TEXT:
      return `Noi dung mau ${randomInt(1000, 9999)}`;
    case FieldType.NUMBER:
      return randomInt(0, 100);
    case FieldType.DATE:
      return dayjs().add(randomInt(0, 25), "day").toISOString();
    case FieldType.COLOR:
      return randomHexColor();
    case FieldType.SELECT: {
      const options = (field.options ?? []) as Array<{ label: string; value: string }>;
      if (options.length === 0) return undefined;
      return options[randomInt(0, options.length - 1)]?.value;
    }
    default:
      return undefined;
  }
};

const upsertUsers = async () => {
  const adminHash = await bcrypt.hash(config.adminPassword, 10);
  const swHash = await bcrypt.hash(config.swPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: config.adminEmail },
    update: { passwordHash: adminHash, role: UserRole.ADMIN },
    create: {
      email: config.adminEmail,
      passwordHash: adminHash,
      role: UserRole.ADMIN
    }
  });

  const swUsers = [] as Array<{ id: number; email: string }>;
  for (let i = 1; i <= config.swUserCount; i += 1) {
    const email = i === 1 ? config.swEmail : `sw${i}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: swHash, role: UserRole.SW },
      create: {
        email,
        passwordHash: swHash,
        role: UserRole.SW
      },
      select: {
        id: true,
        email: true
      }
    });
    swUsers.push(user);
  }

  return { admin, swUsers };
};

const makeFieldTemplates = (formIndex: number) => {
  return [
    {
      label: `Nhan vien ${formIndex}`,
      type: FieldType.TEXT,
      order: 1,
      required: true,
      options: undefined
    },
    {
      label: `Do uu tien ${formIndex}`,
      type: FieldType.NUMBER,
      order: 2,
      required: true,
      options: undefined
    },
    {
      label: `Ngay hen ${formIndex}`,
      type: FieldType.DATE,
      order: 3,
      required: true,
      options: undefined
    },
    {
      label: `Mau nhan dien ${formIndex}`,
      type: FieldType.COLOR,
      order: 4,
      required: false,
      options: undefined
    },
    {
      label: `Loai yeu cau ${formIndex}`,
      type: FieldType.SELECT,
      order: 5,
      required: true,
      options: [
        { label: "Feature", value: "feature" },
        { label: "Bug", value: "bug" },
        { label: "Support", value: "support" }
      ]
    },
    {
      label: `Mo ta ${formIndex}`,
      type: FieldType.TEXT,
      order: 6,
      required: false,
      options: undefined
    }
  ];
};

const createForms = async () => {
  const forms = [] as Array<{
    id: number;
    status: FormStatus;
    fields: Array<{ id: number; type: FieldType; required: boolean; options: Prisma.JsonValue | null }>;
  }>;

  let orderCounter = 1;
  const total = config.activeFormCount + config.draftFormCount;

  for (let i = 1; i <= total; i += 1) {
    const status = i <= config.activeFormCount ? FormStatus.ACTIVE : FormStatus.DRAFT;
    const form = await prisma.form.create({
      data: {
        title: `${status === FormStatus.ACTIVE ? "Active" : "Draft"} Form ${i}`,
        description: `Form mau nang cao #${i}`,
        order: orderCounter,
        status,
        fields: {
          create: makeFieldTemplates(i)
        }
      },
      include: {
        fields: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            type: true,
            required: true,
            options: true
          }
        }
      }
    });

    forms.push({
      id: form.id,
      status,
      fields: form.fields
    });
    orderCounter += 1;
  }

  return forms;
};

const createSubmissions = async (
  activeForms: Array<{
    id: number;
    fields: Array<{ id: number; type: FieldType; required: boolean; options: Prisma.JsonValue | null }>;
  }>,
  swUsers: Array<{ id: number; email: string }>
) => {
  for (const form of activeForms) {
    for (let i = 0; i < config.submissionsPerForm; i += 1) {
      const user = swUsers[randomInt(0, swUsers.length - 1)]!;
      const answers = {} as Record<string, unknown>;
      for (const field of form.fields) {
        const value = makeAnswerByType(field);
        if (value !== undefined) {
          answers[String(field.id)] = value;
        }
      }

      await prisma.submission.create({
        data: {
          formId: form.id,
          userId: user.id,
          answers: answers as Prisma.InputJsonValue
        }
      });
    }
  }
};

const main = async () => {
  const { swUsers } = await upsertUsers();

  await prisma.submission.deleteMany();
  await prisma.field.deleteMany();
  await prisma.form.deleteMany();

  const forms = await createForms();
  await createSubmissions(
    forms.filter((form) => form.status === FormStatus.ACTIVE),
    swUsers
  );

  const activeCount = forms.filter((item) => item.status === FormStatus.ACTIVE).length;
  const draftCount = forms.filter((item) => item.status === FormStatus.DRAFT).length;

  // eslint-disable-next-line no-console
  console.log(
    `Advanced seed completed: ${activeCount} active forms, ${draftCount} draft forms, ${swUsers.length} SW users, ${activeCount * config.submissionsPerForm} submissions.`
  );
};

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Advanced seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
