import React, { useState } from "react";
import { C, FONT } from "./theme";
import { Check, Copy } from "lucide-react";

/* =========================================================
   THÀNH PHẦN DÙNG CHUNG
   ========================================================= */
function Card({ children, className = "", title, icon: Icon, right }) {
  return (
    <div className={`rounded-2xl border border-[#E4E4E2] bg-white p-5 ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-[#2E2E2E]" />}
            <h3 className="text-base font-bold text-[#2E2E2E]">{title}</h3>
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function Title({ n, title }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="rounded-lg bg-[#2E2E2E] px-2.5 py-1 text-xs font-bold text-white">{n}</span>
      <h2 className="text-2xl font-extrabold tracking-tight text-[#2E2E2E]">{title}</h2>
    </div>
  );
}

function Stat({ label, value, sub, tone = "default", icon: Icon }) {
  const tones = {
    default: "bg-white text-[#2E2E2E] border-[#E4E4E2]",
    good: "bg-[#DFEEE6] text-[#2F6B3A] border-[#BFDCCB]",
    warn: "bg-[#FFF6E5] text-[#7A4B00] border-[#F0DDB5]",
    bad: "bg-[#FBE3E7] text-[#B4232F] border-[#F4C3CD]",
    brand: "bg-[#2E2E2E] text-white border-[#2E2E2E]",
  };
  return (
    <div className={`rounded-xl border p-3.5 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <div className={`text-xs font-semibold ${tone === "brand" ? "text-white/80" : "opacity-75"}`}>{label}</div>
        {Icon && <Icon className="h-4 w-4 shrink-0 opacity-60" />}
      </div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums tracking-tight">{value}</div>
      {sub && <div className={`mt-0.5 text-xs ${tone === "brand" ? "text-white/80" : "opacity-70"}`}>{sub}</div>}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, fmt = (v) => v }) {
  return (
    <div className="py-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-[13px] text-[#2E2E2E]">{label}</label>
        <span className="text-[13px] font-bold tabular-nums text-[#2E2E2E]">{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full cursor-pointer" style={{ accentColor: C.burgundy }} />
    </div>
  );
}

function Pill({ children, color = C.burgundy }) {
  return <span className="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: `${color}1F`, color }}>{children}</span>;
}

function Dot({ color }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />;
}

function CopyBtn({ text, label = "Chép" }) {
  const [state, setState] = useState("idle");
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
    } catch (e) {
      setState("fail");
    }
    setTimeout(() => setState("idle"), 1800);
  };
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 rounded-lg border border-[#E4E4E2] bg-white px-2.5 py-1 text-xs font-semibold text-[#2E2E2E] hover:bg-[#F5F5F4]">
      {state === "ok" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {state === "ok" ? "Đã chép" : state === "fail" ? "Bôi đen để chép" : label}
    </button>
  );
}

const tip = {
  contentStyle: { background: "#fff", border: `1px solid ${C.sand}`, borderRadius: 12, fontSize: 12, fontFamily: FONT },
  labelStyle: { color: C.ink, fontWeight: 700 },
};
const axis = { fontSize: 11, fill: C.muted, fontFamily: FONT };

function BookCover({ title, sub, spine, bg, fg, accent, motif = "lines", size = "a5" }) {
  const w = size === "sq" ? 124 : 108;
  const h = size === "sq" ? 124 : 152;
  return (
    <div className="flex items-end justify-center py-3" style={{ perspective: 700 }}>
      <div className="flex" style={{ transform: "rotateY(-18deg)", transformStyle: "preserve-3d" }}>
        <div className="flex items-center justify-center" style={{ width: 16, height: h, background: accent, color: bg, boxShadow: "inset -3px 0 6px rgba(0,0,0,.25)" }}>
          <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 7.5, letterSpacing: 1, fontWeight: 700 }}>{spine}</span>
        </div>
        <div className="relative overflow-hidden" style={{ width: w, height: h, background: bg, color: fg, boxShadow: "6px 8px 18px rgba(43,34,36,.25)" }}>
          {motif === "lines" && <div className="absolute inset-3 border" style={{ borderColor: `${fg}55` }} />}
          {motif === "strip" && (
            <div className="absolute left-1/2 top-3 flex flex-col gap-0.5 bg-white p-1" style={{ transform: "translateX(-50%) rotate(-4deg)" }}>
              {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 30, height: 15, background: i % 2 ? `${accent}cc` : `${fg}44` }} />)}
            </div>
          )}
          {motif === "stamp" && (
            <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border-2 text-[7px] font-bold" style={{ borderColor: accent, color: accent, transform: "rotate(-12deg)" }}>VN ✈</div>
          )}
          {motif === "big" && <div className="absolute inset-x-0 top-5 text-center text-5xl font-extrabold" style={{ color: accent }}>365</div>}
          {motif === "masthead" && <div className="absolute inset-x-0 top-2 text-center text-2xl font-extrabold tracking-tight" style={{ color: accent }}>ĐÔI TA</div>}
          {motif === "letter" && (
            <div className="absolute inset-x-4 top-6 space-y-1.5">
              {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ height: 1, background: `${fg}66`, width: `${90 - i * 9}%` }} />)}
            </div>
          )}
          <div className="absolute inset-x-2 bottom-3 text-center">
            <div className="text-[12px] font-bold leading-tight">{title}</div>
            <div className="mt-0.5 text-[7.5px] font-semibold uppercase tracking-wider opacity-80">{sub}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Title, Pill, Card, Slider, Stat, axis, tip, Dot, BookCover, CopyBtn };
