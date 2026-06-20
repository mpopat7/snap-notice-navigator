import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            SN
          </span>
          <span className="text-sm font-semibold tracking-tight text-stone-800">
            SNAP Notice Navigator
          </span>
        </Link>
        <span className="hidden rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500 sm:inline">
          Preview · Phase 1
        </span>
      </div>
    </header>
  );
}
