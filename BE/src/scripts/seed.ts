import "dotenv/config";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { FieldType, FormStatus, Prisma, PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const env = {
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@example.com",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
  swEmail: process.env.SW_EMAIL ?? "sw@example.com",
  swPassword: process.env.SW_PASSWORD ?? "sw123456"
};

const createDefaultUsers = async () => {
  const adminHash = await bcrypt.hash(env.adminPassword, 10);
  const swHash = await bcrypt.hash(env.swPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: env.adminEmail },
    update: { passwordHash: adminHash, role: UserRole.ADMIN },
    create: {
      email: env.adminEmail,
      passwordHash: adminHash,
      role: UserRole.ADMIN
    }
  });

  const sw = await prisma.user.upsert({
    where: { email: env.swEmail },
    update: { passwordHash: swHash, role: UserRole.SW },
    create: {
      email: env.swEmail,
      passwordHash: swHash,
      role: UserRole.SW
    }
  });

  return { admin, sw };
};

const main = async () => {
  const { sw } = await createDefaultUsers();

  await prisma.submission.deleteMany();
  await prisma.field.deleteMany();
  await prisma.form.deleteMany();

  const onboarding = await prisma.form.create({
    data: {
      title: "SW Onboarding Form",
      description: "Thong tin co ban khi nhan vien SW bat dau cong viec",
      order: 1,
      status: FormStatus.ACTIVE,
      fields: {
        create: [
          { label: "Ho va ten", type: FieldType.TEXT, order: 1, required: true },
          { label: "So nam kinh nghiem", type: FieldType.NUMBER, order: 2, required: true },
          { label: "Ngay bat dau", type: FieldType.DATE, order: 3, required: true },
          {
            label: "Mau nhan dien uu thich",
            type: FieldType.COLOR,
            order: 4,
            required: false
          },
          {
            label: "Vi tri mong muon",
            type: FieldType.SELECT,
            order: 5,
            required: true,
            options: [
              { label: "Frontend", value: "frontend" },
              { label: "Backend", value: "backend" },
              { label: "Fullstack", value: "fullstack" }
            ]
          }
        ]
      }
    },
    include: {
      fields: {
        orderBy: { order: "asc" }
      }
    }
  });

  const assetRequest = await prisma.form.create({
    data: {
      title: "Asset Request Form",
      description: "Yeu cau cap phat thiet bi lam viec",
      order: 2,
      status: FormStatus.ACTIVE,
      fields: {
        create: [
          { label: "Loai thiet bi", type: FieldType.SELECT, order: 1, required: true, options: [
            { label: "Laptop", value: "laptop" },
            { label: "Man hinh", value: "monitor" },
            { label: "Ban phim", value: "keyboard" }
          ] },
          { label: "Ly do", type: FieldType.TEXT, order: 2, required: true },
          { label: "Ngay can", type: FieldType.DATE, order: 3, required: true }
        ]
      }
    },
    include: {
      fields: {
        orderBy: { order: "asc" }
      }
    }
  });

  await prisma.form.create({
    data: {
      title: "Draft Internal Review",
      description: "Ban nhap cho team admin",
      order: 3,
      status: FormStatus.DRAFT,
      fields: {
        create: [
          { label: "Ghi chu", type: FieldType.TEXT, order: 1, required: false }
        ]
      }
    }
  });

  const onboardingAnswer: Record<string, unknown> = {
    [String(onboarding.fields[0]!.id)]: "Nguyen Van A",
    [String(onboarding.fields[1]!.id)]: 3,
    [String(onboarding.fields[2]!.id)]: dayjs().add(1, "day").toISOString(),
    [String(onboarding.fields[3]!.id)]: "#3366CC",
    [String(onboarding.fields[4]!.id)]: "fullstack"
  };

  const assetAnswer: Record<string, unknown> = {
    [String(assetRequest.fields[0]!.id)]: "laptop",
    [String(assetRequest.fields[1]!.id)]: "Can may moi de lam du an Next.js",
    [String(assetRequest.fields[2]!.id)]: dayjs().add(2, "day").toISOString()
  };

  await prisma.submission.createMany({
    data: [
      {
        formId: onboarding.id,
        userId: sw.id,
        answers: onboardingAnswer as Prisma.InputJsonValue
      },
      {
        formId: assetRequest.id,
        userId: sw.id,
        answers: assetAnswer as Prisma.InputJsonValue
      }
    ]
  });

  // eslint-disable-next-line no-console
  console.log("Seed completed: users, 3 forms, fields and sample submissions were created.");
};

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
