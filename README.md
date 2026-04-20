# Form Management System (FE + BE)

Kiến trúc tách rõ 2 folder:

- `BE`: Express + TypeScript + Prisma + PostgreSQL
- `FE`: Next.js (App Router) + TypeScript + Tailwind + Mantine + TanStack

## 1) Tech stack

### Backend

- ExpressJS + TypeScript
- Prisma ORM + PostgreSQL
- Zod (validate request)
- Validation module tách riêng (`src/modules/validation/field-validation.ts`)
- Error response format thống nhất
- Pagination cho `GET /api/forms`
- JWT authentication + role-based authorization (`ADMIN`, `SW`)
- Unit test (Vitest) cho validation logic
- Swagger UI tại `GET /api/docs`
- OpenAPI yaml tại `GET /api/docs/openapi.yaml`

### Frontend

- Next.js 14 + TypeScript
- Mantine UI + TailwindCSS
- TanStack Query (data fetching)
- TanStack Table (bảng tái sử dụng)
- Framer Motion (animation)
- Core component dùng lại:
  - `DataTable` (search, filter, pagination, rowActions)
  - `BaseDialog`
  - `PageShell`
  - `DynamicFormRenderer`

## 2) Cấu trúc thư mục

```text
.
├── BE
│   ├── prisma/schema.prisma
│   ├── docs/openapi.yaml
│   └── src
│       ├── modules
│       │   ├── forms
│       │   ├── submissions
│       │   └── validation
│       └── shared
├── FE
│   ├── app
│   │   ├── admin/forms
│   │   └── sw/forms
│   ├── components/core
│   └── lib
└── docker-compose.yml
```

## 3) Chạy local bằng Yarn

Yêu cầu:

- Node.js 20+
- Yarn 1.x
- PostgreSQL đang chạy local

### Bước 1: Cài dependency

```bash
yarn install
```

### Bước 2: Setup biến môi trường

Copy file env mẫu:

- `BE/.env.example` -> `BE/.env`
- `FE/.env.example` -> `FE/.env.local`

### Bước 3: Tạo schema DB

```bash
yarn workspace be prisma:generate
yarn workspace be prisma:push
```

### Bước 4: Chạy FE + BE cùng lúc

```bash
yarn dev
```

Truy cập:

- FE: `http://localhost:3000`
- BE: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/api/docs`
- OpenAPI yaml: `http://localhost:4000/api/docs/openapi.yaml`

Tài khoản mặc định (tạo tự động khi BE boot):

- Admin: `admin@example.com` / `admin123`
- SW: `sw@example.com` / `sw123456`

## 4) Chạy bằng Docker Compose

```bash
docker compose up --build
```

Services:

- FE: `http://localhost:3000`
- BE: `http://localhost:4000`
- PostgreSQL: `localhost:5432`

## 5) API đã implement

### Form Management

- `GET /api/forms` (hỗ trợ `page`, `limit`, `search`, `status`)
- `POST /api/forms`
- `PUT /api/forms/reorder` (reorder nhanh nhiều form)
- `GET /api/forms/:formId`
- `PUT /api/forms/:formId`
- `DELETE /api/forms/:formId`

### Field Management

- `POST /api/forms/:formId/fields`
- `PUT /api/forms/:formId/fields/reorder` (reorder nhanh nhiều field)
- `PUT /api/forms/:formId/fields/:fieldId`
- `DELETE /api/forms/:formId/fields/:fieldId`

### Submission

- `GET /api/forms/active`
- `POST /api/forms/:formId/submit`
- `GET /api/submission` (hỗ trợ `page`, `limit`)

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

Phân quyền:

- `ADMIN`: toàn bộ CRUD form/field, reorder, xem submissions
- `SW`: xem form active, xem detail form active, submit form

## 6) Validation rules

- `text`: chuỗi, tối đa 200 ký tự
- `number`: từ 0 -> 100
- `date`: không cho ngày quá khứ
- `color`: HEX hợp lệ `#RRGGBB`
- `select`: bắt buộc nằm trong danh sách option
- `required`: kiểm tra bắt buộc theo cấu hình từng field

## 7) Error response format thống nhất

```json
{
  "success": false,
  "error": {
    "code": "SUBMISSION_VALIDATION_FAILED",
    "message": "Submission is invalid",
    "details": []
  }
}
```

Success format:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

## 8) Test

```bash
yarn workspace be test
```

## 9) Seed du lieu mau

Seed co ban:

```bash
yarn workspace be seed
```

Seed nang cao (nhieu form + submission de test pagination/filter/reorder):

```bash
yarn workspace be seed:advanced
```

Co the tuy chinh quy mo qua env truoc khi chay `seed:advanced`:

- `SEED_ACTIVE_FORMS` (mac dinh: 20)
- `SEED_DRAFT_FORMS` (mac dinh: 8)
- `SEED_SUBMISSIONS_PER_FORM` (mac dinh: 6)
- `SEED_SW_USERS` (mac dinh: 6)
