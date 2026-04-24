# Dynamic Form Builder System

Full-stack application for building dynamic forms and collecting submissions from social workers (SW).

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ](#công-nghệ)
- [Cấu trúc](#cấu-trúc)
- [Chạy để phát triển](#chạy-để-phát-triển)
- [Chạy bằng Docker](#chạy-bằng-docker)
- [Thông tin truy cập](#thông-tin-truy-cập)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Validation](#validation)
- [Error Response](#error-response)
- [Test](#test)
- [Seed dữ liệu](#seed-dữ-liệu)

---

##Giới thiệu

Dynamic Form Builder System cho phép:
- **ADMIN**: Tạo, quản lý và chỉnh sửa forms với các trường động (TEXT, NUMBER, DATE, COLOR, SELECT)
- **SW (Social Worker)**: Xem và điền các forms đang active

### Tính năng chính

- ✅ Hybrid JWT + Redis session (access token 15p, refresh token 7d)
- ✅ Auto-refresh token khi bị 401
- ✅ Drag & Drop sắp xếp fields (@dnd-kit)
- ✅ Real-time validation với error messages
- ✅ AutoSave draft form (localStorage)
- ✅ Debounce search (300ms)
- ✅ Confirmation dialogs cho delete

---

## Công nghệ

### Backend

- **Express.js** + TypeScript
- **Prisma** ORM + PostgreSQL
- **Redis** (ioredis) - Session cache
- **JWT** (jsonwebtoken) - Authentication
- **Zod** - Request validation
- **bcryptjs** - Password hashing
- **Swagger UI** - API documentation

### Frontend

- **Next.js 14** (App Router) + TypeScript
- **Mantine UI** + TailwindCSS - UI components
- **TanStack Query** - Data fetching
- **TanStack Table** - Data tables
- **React Hook Form** - Form handling
- **@dnd-kit** - Drag and drop
- **Framer Motion** - Animations
- **Axios** - HTTP client with interceptors

---

## Cấu trúc

```text
.
├── BE/                           # Backend
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── docs/
│   │   └── openapi.yaml         # OpenAPI spec
│   └── src/
│       ├── config/
│       │   └── redis.ts          # Redis configuration
│       ├── modules/
│       │   ├── auth/            # Authentication
│       │   ├── forms/          # Form management
│       │   ├── submissions/    # Submissions
│       │   └── validation/     # Field validation
│       └── shared/
│           ├── services/
│           │   ├── jwt.service.ts    # JWT service
│           │   └── cache.service.ts  # Redis cache
│           ├── middlewares/
│           │   └── auth.middleware.ts
│           └── errors/
│
├── FE/                           # Frontend
│   ├── app/
│   │   ├── admin/
│   │   │   ├── forms/         # Admin forms page
│   │   │   ├── forms/[id]/    # Form detail + fields
│   │   │   └── submissions/   # Submissions list
│   │   └── sw/
│   │       ├── forms/         # Active forms list
│   │       └── forms/[id]/    # Form submission
│   ├── components/
│   │   ├── auth/
│   │   ├── core/
│   │   │   ├── table/data-table.tsx
│   │   │   ├── dialog/base-dialog.tsx
│   │   │   └── page-shell.tsx
│   │   ├── fields/
│   │   │   ├── draggable-field-list.tsx  # @dnd-kit
│   │   │   └── sortable-field-item.tsx
│   │   ├── forms/
│   │   │   ├── dynamic-form-renderer.tsx
│   │   │   ├── field-editor-dialog.tsx
│   │   │   └── form-editor-dialog.tsx
│   │   └── ui/
│   │       ├── confirmation-dialog.tsx
│   │       └── search-input.tsx
│   └── lib/
│       ├── api/
│       │   ├── auth.service.ts
│       │   ├── forms.service.ts
│       │   └── submissions.service.ts
│       └── core/
│           ├── api/client.ts     # Axios + interceptors
│           ├── auth/
│           │   ├── token-manager.ts
│           │   ├── auth-provider.tsx
│           │   └── auth-guard.tsx
│           └── autosave/
│               └── draft-manager.ts
│
└── docker-compose.yml           # Full stack
```

---

## Chạy để phát triển

**Yêu cầu:** Node.js 20+, Yarn 1.x, Docker.

### Bước 1: Khởi động Database & Redis

```bash
docker compose up -d postgres redis
```

### Bước 2: Cài đặt dependency

```bash
yarn install
```

### Bước 3: Cấu hình biến môi trường

Tạo file `BE/.env`:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/form_management?schema=public
REDIS_URL=redis://localhost:6380
JWT_SECRET=5tE++2dkLQnuRlyPje5uCVPY1XoUoXlK37QaakQOh9Y=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
SW_EMAIL=sw@example.com
SW_PASSWORD=sw123456
FRONTEND_URL=http://localhost:3000
ACCESS_TOKEN_EXPIRED=1h
REFRESH_TOKEN_EXPIRED=7d
SEED_ACTIVE_FORMS=20
SEED_DRAFT_FORMS=8
SEED_SW_USERS=6
```

Tạo file `FE/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/
```

Tạo file `.env`:

```env
JWT_SECRET=5tE++2dkLQnuRlyPje5uCVPY1XoUoXlK37QaakQOh9Y=
```

### Bước 4: Khởi tạo database

```bash
cd BE
npx prisma generate
npx prisma db push
yarn seed
```

### Bước 5: Chạy ứng dụng

```bash
yarn dev
```

---

## Chạy bằng Docker (Full Stack)

```bash
docker compose up --build
```

Database sẽ tự động được migrate và seed dữ liệu.

---

## Thông tin truy cập

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Swagger UI:** http://localhost:4000/api/docs

### Tài khoản mặc định

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@example.com | admin123 |
| SW | sw@example.com | sw123456 |

---

## API Reference

### Authentication

| Method | Endpoint | Mô tả | Auth |
|--------|---------|-------|------|
| POST | `/api/auth/login` | Login, nhận access + refresh token | ❌ |
| POST | `/api/auth/refresh` | Refresh tokens (silent) | Refresh Token |
| POST | `/api/auth/logout` | Logout + xóa session | Access Token |
| GET | `/api/auth/me` | Get current user | Access Token |

### Form Management

| Method | Endpoint | Mô tả | Auth |
|--------|---------|-------|------|
| GET | `/api/forms` | List all forms (pagination, search, filter) | ADMIN |
| POST | `/api/forms` | Create form | ADMIN |
| GET | `/api/forms/:id` | Get form details | ADMIN/SW |
| PUT | `/api/forms/:id` | Update form | ADMIN |
| DELETE | `/api/forms/:id` | Delete form | ADMIN |
| PUT | `/api/forms/reorder` | Reorder forms | ADMIN |
| GET | `/api/forms/active` | List active forms | SW/ADMIN |

### Field Management

| Method | Endpoint | Mô tả | Auth |
|--------|---------|-------|------|
| POST | `/api/forms/:id/fields` | Add field | ADMIN |
| PUT | `/api/forms/:id/fields/:fieldId` | Update field | ADMIN |
| DELETE | `/api/forms/:id/fields/:fieldId` | Delete field | ADMIN |
| PUT | `/api/forms/:id/fields/reorder` | Reorder fields (Drag & Drop) | ADMIN |

### Submissions

| Method | Endpoint | Mô tả | Auth |
|--------|---------|-------|------|
| POST | `/api/forms/:id/submit` | Submit form | ADMIN/SW |
| GET | `/api/submission` | List submissions (admin) | ADMIN |

---

## Authentication

### Hybrid JWT + Redis Session

```
Access Token: 15 phút (lưu localStorage + httpOnly cookie)
Refresh Token: 7 ngày (lưu localStorage)
Redis Session: 7 ngày (quản lý trạng thái, revoke được)
```

### Auth Flow

1. **Login** → `POST /api/auth/login` → Nhận access + refresh token + session lưu Redis
2. **API Call** → Gửi access token → Backend verify + check Redis
3. **Token hết hạn (401)** → Axios interceptor auto gọi `/auth/refresh` → Nhận tokens mới
4. **Logout** → `POST /auth/logout` → Xóa session Redis

### Phân quyền

| Role | Permissions |
|------|-------------|
| ADMIN | Toàn bộ CRUD form/field, reorder, xem submissions |
| SW | Xem form active, xem chi tiết form active, submit form |

---

## Validation

### Field Types & Rules

| Field Type | Rules | Error Message (FE) |
|-----------|-------|------------------|
| TEXT | max 200 ký tự | "Văn bản không được vượt quá 200 ký tự" |
| NUMBER | 0-100 | "Số phải nằm trong khoảng 0-100" |
| DATE | không quá khứ | "Ngày không được trong quá khứ" |
| COLOR | #RRGGBB | "Mã màu phải dạng #RRGGBB (Ví dụ: #FF0000)" |
| SELECT | phải chọn option | "Vui lòng chọn một lựa chọn" |
| REQUIRED | bắt buộc | "Trường này bắt buộc" |

### Validation Flow

```
FE: Nhập liệu → Validate real-time → Hiện error dưới field
    ↓ submit
BE: Validate lại → Trả error chi tiết nếu fail
    ↓ success
Database: Lưu submission
```

---

## Error Response

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "SUBMISSION_VALIDATION_FAILED",
    "message": "Vui lòng kiểm tra lại các trường sau:\n- Tên: Trường này bắt buộc",
    "details": [
      { "fieldId": 1, "label": "Tên", "message": "Trường này bắt buộc" }
    ]
  }
}
```

### Success Format

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

---

## Test

```bash
yarn workspace be test
```

---

## Seed dữ liệu

### Seed cơ bản

```bash
yarn workspace be seed
```

### Seed nâng cao (nhiều form + submission để test)

```bash
yarn workspace be seed:advanced
```

### Tùy chỉnh số lượng

| Variable | Default | Description |
|----------|---------|-------------|
| SEED_ACTIVE_FORMS | 20 | Số form active |
| SEED_DRAFT_FORMS | 8 | Số form draft |
| SEED_SUBMISSIONS_PER_FORM | 6 | Submissions mỗi form |
| SEED_SW_USERS | 6 | Số user SW |

```bash
SEED_ACTIVE_FORMS=50 yarn workspace be seed:advanced
```
