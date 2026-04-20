import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 px-4 py-8">
      <h1 className="text-center text-4xl font-bold text-brand-800">Form Management Workspace</h1>
      <p className="max-w-2xl text-center text-brand-700">
        Nhanh gọn: vào khu vực admin để quản lý form, hoặc vào khu vực SW để điền form active.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-brand-800 px-4 py-2 font-semibold text-white hover:bg-brand-900"
        >
          Đăng nhập
        </Link>
        <Link
          href="/admin/forms"
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          Đi tới Admin
        </Link>
        <Link
          href="/sw/forms"
          className="rounded-lg border border-brand-500 px-4 py-2 font-semibold text-brand-700 hover:bg-brand-100"
        >
          Đi tới SW
        </Link>
      </div>
    </main>
  );
}
