import { useEffect, useRef, useState } from "react";

export interface Option {
  value: string;
  label: string;
}

interface Props {
  name?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function CustomSelect({
  name,
  options,
  value,
  onChange,
  placeholder = "请选择",
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        (containerRef.current?.querySelector("button") as HTMLElement)?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function select(optValue: string) {
    onChange(optValue);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-left text-sm transition-all hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          open
            ? "border-gray-400 ring-2 ring-indigo-100"
            : selected
              ? "border-gray-300 text-gray-900"
              : "border-gray-200 text-gray-400"
        }`}
      >
        <span className={selected ? "" : ""}>{selected ? selected.label : placeholder}</span>
        <span
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl py-1 animate-scale-in origin-top">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => select(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 8l3.5 3.5L13 5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
