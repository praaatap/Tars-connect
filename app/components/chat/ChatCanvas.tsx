type ChatCanvasProps = {
  title: string;
  subtitle: string;
  buttonText: string;
  hintText: string;
};

export function ChatCanvas({
  title,
  subtitle,
  buttonText,
  hintText,
}: ChatCanvasProps) {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center bg-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.1)_1px,transparent_0)] bg-size-[24px_24px]" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="mb-8 flex items-end gap-3">
          <div className="h-14 w-14 rounded-2xl border border-zinc-300 bg-white" />
          <div className="h-16 w-20 rounded-2xl bg-indigo-600" />
        </div>
        <h2 className="text-4xl font-bold text-zinc-900">{title}</h2>
        <p className="mt-3 max-w-xl text-zinc-500">{subtitle}</p>
        <button className="mt-8 rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 cursor-pointer">
          {buttonText}
        </button>
        <p className="mt-9 rounded-lg bg-zinc-100 px-4 py-2 text-xs text-zinc-400">
          {hintText}
        </p>
      </div>
    </section>
  );
}