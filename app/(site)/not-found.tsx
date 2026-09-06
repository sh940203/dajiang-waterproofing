import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-serif text-6xl font-bold text-ink-200">404</p>
      <h1 className="mt-4 text-2xl">找不到這個頁面</h1>
      <p className="mt-2 text-sm text-dim">
        頁面可能已移動或不存在。
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink-800 px-6 py-3 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-700"
      >
        回首頁
      </Link>
    </section>
  );
}
