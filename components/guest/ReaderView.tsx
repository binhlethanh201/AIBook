"use client";

import { Fragment, useState } from "react";
import AdSlot from "../AdSlot";

const THEMES = {
  light: { label: "Sáng", bg: "#ffffff", text: "#1f2937" },
  sepia: { label: "Vàng", bg: "#f6eedb", text: "#3b2f24" },
  dark: { label: "Tối", bg: "#1f2937", text: "#e5e7eb" },
} as const;

type ThemeKey = keyof typeof THEMES;

const MIN_SIZE = 16;
const MAX_SIZE = 32;
const STEP = 2;
const DEFAULT_SIZE = 20;

export default function ReaderView({ paragraphs }: { paragraphs: string[] }) {
  const [theme, setTheme] = useState<ThemeKey>("light");
  const [fontSize, setFontSize] = useState(DEFAULT_SIZE);
  const t = THEMES[theme];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-500">GIAO DIỆN</span>
          {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-label={THEMES[key].label}
              onClick={() => setTheme(key)}
              className={`h-8 w-8 rounded-full border-2 font-bold ${
                theme === key ? "border-blue-600" : "border-neutral-200"
              }`}
              style={{ background: THEMES[key].bg, color: THEMES[key].text }}
            >
              A
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-500">CỠ CHỮ</span>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(MIN_SIZE, s - STEP))}
            className="rounded border px-3 py-1 hover:bg-neutral-100"
          >
            A-
          </button>
          <span className="w-12 text-center">{fontSize}px</span>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(MAX_SIZE, s + STEP))}
            className="rounded border px-3 py-1 hover:bg-neutral-100"
          >
            A+
          </button>
        </div>
      </div>

      <div
        className="rounded-xl p-6 shadow-sm md:p-10"
        style={{ background: t.bg, color: t.text, fontSize, lineHeight: 1.8 }}
      >
        {paragraphs.map((p, i) => (
          <Fragment key={i}>
            <p className="mb-5">{p}</p>
            {i === 2 && <AdSlot id="in-content" />}
          </Fragment>
        ))}
      </div>
    </>
  );
}
