import { Copy, Check, ChevronDown, Film, Wand2, Camera, Clock, Sparkles, Type, ShieldCheck, Users } from "lucide-react";
import React, { useState, useMemo } from "react";
import { PHASES, FORMAT_COLORS, SC, PERSONA, scriptText, aiText, SCRIPTS, STYLE_PROMPT } from "../marketing/scripts";

function SCopyBtn({ text, label, icon: Icon = Copy, solid }) {
  const [st, setSt] = useState("idle");
  const go = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setSt("ok");
    } catch (err) {
      setSt("fail");
    }
    setTimeout(() => setSt("idle"), 1800);
  };
  return (
    <button onClick={go} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${solid ? "bg-[#2E2E2E] text-white hover:bg-[#111111]" : "border border-[#E4E4E2] bg-white text-[#2E2E2E] hover:bg-[#F5F5F4]"}`}>
      {st === "ok" ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
      {st === "ok" ? "Đã chép" : st === "fail" ? "Không chép được" : label}
    </button>
  );
}

function SPill({ children, color }) {
  return <span className="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: `${color}1F`, color }}>{children}</span>;
}

function ScriptCard({ s, open, toggle }) {
  const phase = PHASES[s.phase - 1];
  const nAI = s.shots.filter((x) => x.k === "AI").length;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E4E2] bg-white" style={{ borderTop: `4px solid ${phase.color}` }}>
      <button onClick={toggle} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ background: phase.color }}>{s.day}</span>
            <div>
              <div className="text-[15px] font-extrabold leading-tight text-[#2E2E2E]">{s.title}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <SPill color={FORMAT_COLORS[s.format] || SC.muted}>{s.format}</SPill>
                <SPill color={PERSONA[s.persona][1]}>{PERSONA[s.persona][0]}</SPill>
                <SPill color={SC.slate}>{nAI ? `${nAI} cảnh AI` : "Quay thật 100%"}</SPill>
              </div>
            </div>
          </div>
          <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-[#DDA543] transition ${open ? "rotate-180" : ""}`} />
        </div>
        <div className="mt-3 rounded-xl bg-[#F5F5F4] px-3 py-2 text-[13px] font-bold text-[#2E2E2E]">“{s.hook}”</div>
        <div className="mt-2 text-xs text-[#6B6B69]"><b className="text-[#2E2E2E]">Insight:</b> {s.insight}</div>
      </button>
      {open && (
        <div className="border-t border-[#EFEFEE] p-4">
          <div className="space-y-1.5">
            {s.shots.map((x, i) => (
              <div key={i} className="grid grid-cols-[52px_72px_1fr] items-start gap-2 text-[13px]">
                <span className="font-bold tabular-nums text-[#6B6B69]">{x.t}</span>
                <span className={`whitespace-nowrap rounded-md px-1.5 py-0.5 text-center text-[10px] font-bold ${x.k === "AI" ? "bg-[#EEF0F3] text-[#9A88C8]" : "bg-[#FBE3E7] text-[#B4232F]"}`}>{x.k === "AI" ? "AI dựng" : "Quay thật"}</span>
                <span>{x.d}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 text-[13px] sm:grid-cols-2">
            <div className="rounded-lg bg-[#F5F5F4] p-2"><div className="text-[11px] font-bold text-[#6B6B69]">Lời / chữ</div>{s.vo}</div>
            <div className="rounded-lg bg-[#F5F5F4] p-2"><div className="text-[11px] font-bold text-[#6B6B69]">Âm thanh</div>{s.audio}</div>
            <div className="rounded-lg bg-[#DFEEE6] p-2"><div className="text-[11px] font-bold text-[#6E9A52]">CTA</div><b>{s.cta}</b></div>
            <div className="rounded-lg bg-[#F5F5F4] p-2"><div className="text-[11px] font-bold text-[#6B6B69]">Caption</div>{s.caption}</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <SCopyBtn text={scriptText(s)} label="Chép kịch bản" icon={Film} solid />
            <SCopyBtn text={aiText(s)} label="Chép prompt AI video" icon={Wand2} />
          </div>
        </div>
      )}
    </div>
  );
}

function ScriptsTab() {
  const [phase, setPhase] = useState(0);
  const [persona, setPersona] = useState("");
  const [open, setOpen] = useState({ 1: true });
  const list = useMemo(() => SCRIPTS.filter((s) => (!phase || s.phase === phase) && (!persona || s.persona === persona)), [phase, persona]);
  const totalAI = SCRIPTS.reduce((n, s) => n + s.shots.filter((x) => x.k === "AI").length, 0);
  const totalShots = SCRIPTS.reduce((n, s) => n + s.shots.length, 0);
  const allText = [`STYLE CHUNG CHO AI VIDEO:\n${STYLE_PROMPT}`, ...SCRIPTS.map(scriptText)].join("\n\n────────\n\n");
  const allAI = SCRIPTS.map(aiText).join("\n\n────────\n\n");
  const chip = (active, color) => (active ? { background: color, borderColor: color, color: "#fff" } : { borderColor: "#E4E4E2", color: SC.ink, background: "#fff" });

  return (
    <div className="space-y-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-[#2E2E2E] px-2.5 py-1 text-xs font-bold text-white">08</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#2E2E2E]">30 kịch bản video cặp đôi</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <SCopyBtn text={allText} label="Chép cả 30 kịch bản" icon={Film} solid />
          <SCopyBtn text={allAI} label="Chép tất cả prompt AI" icon={Wand2} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Video", "30", "30 insight không trùng", Film],
          ["Cảnh AI dựng", `${totalAI}`, "Bối cảnh, cảm xúc", Wand2],
          ["Cảnh quay thật", `${totalShots - totalAI}`, "Mọi cảnh có cuốn sách", Camera],
          ["Thời lượng", "15–20s", "Khung dọc 9:16", Clock],
        ].map(([l, v, sub, I]) => (
          <div key={l} className="rounded-xl border border-[#E4E4E2] bg-white p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B6B69]">{l}<I className="h-4 w-4 opacity-60" /></div>
            <div className="mt-1 text-2xl font-extrabold">{v}</div>
            <div className="text-xs text-[#6B6B69]">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-[#E4E4E2] bg-white p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-[#2E2E2E]" />Style chung — dán trước mọi prompt AI</span>
            <SCopyBtn text={STYLE_PROMPT} label="Chép style" />
          </div>
          <div className="rounded-xl bg-[#F5F5F4] p-3 text-xs leading-relaxed">{STYLE_PROMPT}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            [Camera, "Cuốn sách luôn quay thật", "AI không dựng sản phẩm"],
            [Type, "Chữ Việt chèn bằng CapCut", "AI viết chữ Việt dễ lỗi"],
            [ShieldCheck, "Bật nhãn “AI-generated”", "Khi dùng cảnh AI như thật"],
            [Users, "Reaction cần đồng ý", "Xin phép bằng tin nhắn"],
          ].map(([I, t, d]) => (
            <div key={t} className="flex gap-2 rounded-xl bg-[#F5F5F4] p-3">
              <I className="mt-0.5 h-4 w-4 shrink-0 text-[#2E2E2E]" />
              <div><div className="text-[13px] font-bold">{t}</div><div className="text-[11px] text-[#6B6B69]">{d}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setPhase(0)} className="rounded-xl border-2 px-3 py-1.5 text-xs font-bold" style={chip(phase === 0, SC.ink)}>Tất cả</button>
        {PHASES.map((p) => (
          <button key={p.id} onClick={() => setPhase(p.id)} className="rounded-xl border-2 px-3 py-1.5 text-xs font-bold" style={chip(phase === p.id, p.color)}>{p.range} · {p.name}</button>
        ))}
        <span className="mx-1 h-5 w-px bg-[#E4E4E2]" />
        <button onClick={() => setPersona("")} className="rounded-xl border-2 px-3 py-1.5 text-xs font-bold" style={chip(persona === "", SC.ink)}>Mọi tệp</button>
        {Object.entries(PERSONA).filter(([id]) => id !== "all").map(([id, [n, col]]) => (
          <button key={id} onClick={() => setPersona(id)} className="rounded-xl border-2 px-3 py-1.5 text-xs font-bold" style={chip(persona === id, col)}>{n}</button>
        ))}
        <button onClick={() => setOpen(list.length && list.every((s) => open[s.day]) ? {} : Object.fromEntries(list.map((s) => [s.day, true])))} className="ml-auto text-xs font-bold text-[#2E2E2E] underline">
          {list.length && list.every((s) => open[s.day]) ? "Thu gọn tất cả" : "Mở tất cả"}
        </button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {list.map((s) => <ScriptCard key={s.day} s={s} open={!!open[s.day]} toggle={() => setOpen((o) => ({ ...o, [s.day]: !o[s.day] }))} />)}
      </div>
      {!list.length && <div className="rounded-xl bg-white p-6 text-center text-sm text-[#6B6B69]">Không có kịch bản phù hợp bộ lọc.</div>}
    </div>
  );
}

export { ScriptsTab };
