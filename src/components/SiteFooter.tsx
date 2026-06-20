export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-6">
        <p className="text-xs leading-relaxed text-stone-500">
          <strong className="font-semibold text-stone-600">Not an official government service.</strong>{" "}
          SNAP Notice Navigator helps you understand a notice and possible next
          steps. It does not decide whether you qualify and does not give legal
          advice. Your state SNAP agency makes all final decisions. For anything
          urgent, contact your local office or a benefits advocate.
        </p>
        <p className="mt-2 text-xs text-stone-400">
          Built for the USAII Global AI Hackathon · Benefits Navigator · demo
          content uses synthetic, non-personal sample notices.
        </p>
      </div>
    </footer>
  );
}
