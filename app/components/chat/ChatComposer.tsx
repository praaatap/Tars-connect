type ChatComposerProps = {
  placeholder: string;
  disabled?: boolean;
};

export function ChatComposer({ placeholder, disabled }: ChatComposerProps) {
  return (
    <div className="border-t border-zinc-200 bg-white px-5 py-4">
      <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2.5">
        <button className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-sm text-zinc-600" disabled={disabled}>
          +
        </button>
        <input
          className="flex-1 bg-transparent text-sm text-zinc-700 outline-none disabled:text-zinc-400"
          placeholder={placeholder}
          disabled={disabled}
        />
        <button className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs text-white disabled:bg-zinc-300" disabled={disabled}>
          ➤
        </button>
      </div>
    </div>
  );
}