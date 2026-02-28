type ChatComposerProps = {
  placeholder: string;
};

export function ChatComposer({ placeholder }: ChatComposerProps) {
  return (
    <div className="border-t border-zinc-200 bg-white px-5 py-4">
      <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2.5">
        <button className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-sm text-zinc-600">
          +
        </button>
        <input
          className="flex-1 bg-transparent text-sm text-zinc-700 outline-none"
          placeholder={placeholder}
        />
        <button className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
          ➤
        </button>
      </div>
    </div>
  );
}