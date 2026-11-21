import React, { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer, ComposedChart, Area, Line, LineChart, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ReferenceLine, ReferenceArea, PieChart, Pie, Cell, ScatterChart, Scatter,
  ZAxis, LabelList,
} from "recharts";
import {
  Wallet, TrendingUp, Users, Package, Megaphone, CheckSquare, BookOpen, Heart, Plane, Gift, Clock,
  Printer, Camera, Sparkles, Target, AlertTriangle, ShieldCheck, Calendar, Copy, Check, RotateCcw,
  Layers, ArrowRight, Coins, PiggyBank, Truck, MessageCircle, Briefcase as Handshake, Film, Wand2, Shield,
  Lock, Unlock, TrendingDown, Ban, Tag, Boxes, Radio, Settings2, ChevronDown, Type,
} from "lucide-react";

/* =========================================================
   MÀU & ĐỊNH DẠNG
   ========================================================= */
const C = {
  red: "#C9443A", lav: "#9A88C8", water: "#7FC1B9",
  cream: "#F5F5F4", beige: "#EFEFEE", sand: "#E4E4E2", burgundy: "#2E2E2E", wine: "#111111",
  rose: "#E8798A", gold: "#DDA543", ink: "#2E2E2E", muted: "#6B6B69", sage: "#6E9A52", navy: "#5FA8A2",
};
const CHART = ["#2E2E2E", "#F3C35F", "#E8798A", "#6E9A52", "#7FC1B9", "#9A88C8", "#C08A68"];
const FONT = "'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

const vnd = (n) => `${Math.round(n).toLocaleString("vi-VN")}đ`;
const tr = (n) => {
  const v = n / 1e6;
  const s = Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1);
  return `${s.replace(".", ",")}tr`;
};
const k = (n) => `${Math.round(n / 1000).toLocaleString("vi-VN")}k`;
const pct = (n, d = 1) => `${n.toFixed(d).replace(".", ",")}%`;

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

/* =========================================================
   MÔ HÌNH TÀI CHÍNH — 3 KỊCH BẢN
   ========================================================= */
const CAPITAL = 20000000;
const DAYS = 360;
const MONTHS = 12;
/* Mở bán 12/2026 → chỉ số mùa vụ từng tháng (100 = trung bình) */
const MONTH_LABELS = ["12/26", "1/27", "2/27", "3/27", "4/27", "5/27", "6/27", "7/27", "8/27", "9/27", "10/27", "11/27"];
const SEASON_IDX = [150, 70, 165, 120, 70, 85, 80, 80, 100, 85, 135, 95];
const SOLO_CAP = 120;
const CTV_COST = 15000;

const ALLOCS = {
  base: [
    { key: "sample", name: "In mẫu", amount: 3000000, detail: "3 gói × 3 mẫu + in thử giấy 150/200gsm" },
    { key: "pack", name: "Bao bì & quà", amount: 2000000, detail: "50 hộp cứng, 100 bộ giấy/ruy băng/thiệp" },
    { key: "props", name: "Đạo cụ quay", amount: 2000000, detail: "Đèn, tripod, mic, phông, đạo cụ" },
    { key: "tools", name: "Công cụ AI/Canva", amount: 1500000, detail: "Canva Pro, CapCut Pro, AI trả phí" },
    { key: "legal", name: "Pháp lý & nhận diện", amount: 1500000, detail: "Hộ kinh doanh, QR, thẻ cảm ơn" },
    { key: "seed", name: "Seeding & test Ads", amount: 3000000, detail: "5 cuốn tặng KOC + boost video" },
    { key: "reserve", name: "Quỹ dự phòng", amount: 7000000, detail: "Không chạm nếu không có sự cố" },
  ],
  safe: [
    { key: "sample", name: "In mẫu", amount: 2000000, detail: "3 gói × 2 mẫu (24/32/40 trang)" },
    { key: "pack", name: "Bao bì & quà", amount: 1000000, detail: "Chỉ 20 hộp, đặt thêm theo đơn" },
    { key: "props", name: "Đạo cụ quay", amount: 1000000, detail: "Đèn + tripod, tận dụng đồ có sẵn" },
    { key: "tools", name: "Công cụ AI/Canva", amount: 500000, detail: "Dùng bản miễn phí là chính" },
    { key: "legal", name: "Pháp lý & nhận diện", amount: 1000000, detail: "Hộ kinh doanh, QR" },
    { key: "seed", name: "Seeding & test Ads", amount: 1500000, detail: "3 cuốn tặng, chưa chạy Ads" },
    { key: "reserve", name: "Quỹ dự phòng", amount: 13000000, detail: "Chỉ mở theo cổng giải ngân" },
  ],
};
const allocInfo = (id) => {
  const a = ALLOCS[id];
  const setup = a.filter((x) => ["sample", "pack", "props", "tools", "legal"].includes(x.key)).reduce((s, x) => s + x.amount, 0);
  const seed = a.find((x) => x.key === "seed").amount;
  return { list: a, setup, seed };
};

const PRESETS = {
  /* Giá vốn tính theo B5 nhỡ: 1 tờ A3+ in 2 mặt = 4 trang (có tràn lề) → 24/32/40 trang = 6/8/10 tờ.
     pack = túi chống ẩm + carton chống gãy góc + thiệp + tờ sticker (+ túi giấy gói 32, + hộp cứng nắp rời gói 40).
     ship = phần shop tự chịu sau khi khách trả 20k (Hà Nội) / 30k (tỉnh); đơn trả đủ 100% được miễn ship.
     cac = quảng cáo + chi phí KOC (giảm 10% cho khách + hoa hồng 10–15%) chia đều trên mọi đơn. */
  safe: {
    alloc: "safe", orders: 15, growth: 5, pr1: 259000, pr2: 299000, pr3: 349000, mix1: 40, mix3: 15,
    attach: 0, addonPrice: 60000, addonCost: 20000, sheetPrice: 6000, cover: 50000, pack1: 15000, pack2: 20000, pack3: 48000,
    cac: 75000, ship: 13000, feePct: 0.5, taxPct: 1.5, designCost: 0, fixed: 3000000, reprint: 5,
    deposit: 55, credit: 0, batchDays: 7, cap: 120, season: true,
  },
  likely: {
    alloc: "safe", orders: 30, growth: 12, pr1: 259000, pr2: 299000, pr3: 349000, mix1: 30, mix3: 20,
    attach: 0, addonPrice: 60000, addonCost: 18000, sheetPrice: 4500, cover: 42000, pack1: 13000, pack2: 17000, pack3: 38000,
    cac: 55000, ship: 10000, feePct: 0.5, taxPct: 0, designCost: 0, fixed: 2500000, reprint: 3,
    deposit: 60, credit: 7, batchDays: 7, cap: 150, season: true,
  },
  base: {
    alloc: "base", orders: 60, growth: 18, pr1: 259000, pr2: 299000, pr3: 349000, mix1: 25, mix3: 25,
    attach: 15, addonPrice: 60000, addonCost: 18000, sheetPrice: 4000, cover: 38000, pack1: 12000, pack2: 15000, pack3: 34000,
    cac: 45000, ship: 8000, feePct: 0.5, taxPct: 0, designCost: 0, fixed: 2500000, reprint: 2,
    deposit: 65, credit: 15, batchDays: 7, cap: 250, season: true,
  },
  opt: {
    alloc: "base", orders: 100, growth: 25, pr1: 259000, pr2: 299000, pr3: 349000, mix1: 20, mix3: 30,
    attach: 25, addonPrice: 60000, addonCost: 18000, sheetPrice: 3500, cover: 35000, pack1: 11000, pack2: 14000, pack3: 30000,
    cac: 35000, ship: 6000, feePct: 0.5, taxPct: 0, designCost: 0, fixed: 2500000, reprint: 1,
    deposit: 70, credit: 30, batchDays: 7, cap: 400, season: true,
  },
};
/* 3 gói bìa cứng · B5 nhỡ 16,5×23,5 cm · giấy mỹ thuật 200gsm · 1 tờ A3+ in 2 mặt = 4 trang (có tràn lề 3 mm) */
const TIERS = [
  { name: "Gói 24 trang", short: "24 trang", pages: 24, sheets: 6, photos: "Tối đa 24 ảnh", incl: "Thiệp + tờ sticker", role: "Mồi tiết kiệm" },
  { name: "Gói 32 trang", short: "32 trang", pages: 32, sheets: 8, photos: "Tối đa 32 ảnh", incl: "Túi giấy + thiệp + tờ sticker", role: "Chủ lực", hero: true },
  { name: "Gói 40 trang", short: "40 trang", pages: 40, sheets: 10, photos: "Tối đa 40 ảnh", incl: "Hộp cứng nắp rời + thiệp + tờ sticker", role: "Neo cao cấp" },
];
function tierCalc(p) {
  let m1 = p.mix1 / 100;
  let m3 = p.mix3 / 100;
  if (m1 + m3 > 1) {
    const t = m1 + m3;
    m1 /= t;
    m3 /= t;
  }
  const mix = [m1, 1 - m1 - m3, m3];
  return TIERS.map((t, i) => {
    const price = p["pr" + (i + 1)];
    const print = t.sheets * p.sheetPrice;
    const pack = p["pack" + (i + 1)];
    const cogs = (print + p.cover + pack) * (1 + p.reprint / 100);
    const contrib = price - cogs - p.cac - p.ship - price * ((p.feePct + p.taxPct) / 100) - p.designCost;
    return { ...t, price, print, pack, cogs, gm: ((price - cogs) / price) * 100, contrib, mix: mix[i] };
  });
}
const SCEN = [
  { id: "safe", name: "Thận trọng tối đa", color: C.burgundy, icon: Shield },
  { id: "likely", name: "Khả dĩ nhất", color: C.navy, icon: Sparkles },
  { id: "base", name: "Cơ sở", color: C.gold, icon: Target },
  { id: "opt", name: "Lạc quan", color: C.sage, icon: TrendingUp },
];

function computeUnit(p) {
  const tiers = tierCalc(p);
  const a = p.attach / 100;
  const book = tiers.reduce((x, t) => x + t.mix * t.price, 0);
  const aov = book + a * p.addonPrice;
  const inner = tiers.reduce((x, t) => x + t.mix * t.print, 0);
  const cover = p.cover;
  const pack = tiers.reduce((x, t) => x + t.mix * t.pack, 0);
  const addonCost = a * p.addonCost;
  const reprintCost = (inner + cover + pack) * (p.reprint / 100);
  const cogs = inner + cover + pack + addonCost + reprintCost;
  const gp = aov - cogs;
  const fee = aov * (p.feePct / 100);
  const tax = aov * (p.taxPct / 100);
  const contrib = gp - p.cac - p.ship - fee - tax - p.designCost;
  return { aov, inner, cover, pack, addonCost, reprintCost, cogs, gp, gm: (gp / aov) * 100, fee, tax, contrib, tiers };
}

const monthOrders = (p, m) =>
  Math.min(p.orders * Math.pow(1 + p.growth / 100, m) * (p.season ? SEASON_IDX[m] / 100 : 1) * (p.mult ? p.mult[m] : 1), p.cap || 1e9);
const ctvPerOrder = (n) => (n > SOLO_CAP ? (CTV_COST * (n - SOLO_CAP)) / n : 0);

function simulate(p, unit, every = 1) {
  const { setup, seed } = allocInfo(p.alloc);
  const dep = p.deposit / 100;
  const credit = Math.round(p.credit);
  const lagDeliver = Math.round(p.batchDays / 2 + 7);
  const lagCOD = lagDeliver + 2;
  const od = [];
  const ctv = [];
  for (let d = 1; d <= DAYS; d++) {
    const n = monthOrders(p, Math.floor((d - 1) / 30));
    od[d] = n / 30;
    ctv[d] = ctvPerOrder(n);
  }
  const due = {};
  let cash = CAPITAL - setup;
  let payable = 0;
  let minCash = cash;
  let minDay = 0;
  let peakPayable = 0;
  let paybackDay = null;
  const rows = [{ day: 0, cash, payable: 0 }];
  const keep = 1 - (p.feePct + p.taxPct) / 100;
  for (let d = 1; d <= DAYS; d++) {
    let inflow = od[d] * unit.aov * dep * keep;
    if (d - lagCOD >= 1) inflow += od[d - lagCOD] * unit.aov * (1 - dep) * keep;
    let out = od[d] * (p.cac + p.designCost + ctv[d]);
    if (d - lagDeliver >= 1) out += od[d - lagDeliver] * p.ship;
    if (d <= 30) out += seed / 30;
    if ((d - 1) % 30 === 0) out += p.fixed;
    if (d % p.batchDays === 0) {
      let b = 0;
      for (let j = d - p.batchDays + 1; j <= d; j++) b += od[j];
      const amt = b * unit.cogs;
      due[d + credit] = (due[d + credit] || 0) + amt;
      payable += amt;
    }
    if (due[d]) {
      out += due[d];
      payable -= due[d];
    }
    cash += inflow - out;
    if (cash < minCash) {
      minCash = cash;
      minDay = d;
    }
    if (paybackDay === null && cash >= CAPITAL) paybackDay = d;
    peakPayable = Math.max(peakPayable, payable);
    if (d % every === 0) rows.push({ day: d, cash: Math.round(cash), payable: Math.round(payable) });
  }
  const months = Array.from({ length: MONTHS }, (_, m) => {
    const n = monthOrders(p, m);
    return { m: MONTH_LABELS[m], orders: Math.round(n), rev: n * unit.aov, gp: n * unit.gp, net: n * (unit.contrib - ctvPerOrder(n)) - p.fixed - (m === 0 ? seed : 0) };
  });
  const cum = months.reduce((s, x) => s + x.net, 0);
  let run = 0;
  const beMonthIdx = months.findIndex((x) => (run += x.net) >= 0);
  const be = unit.contrib > 0 ? Math.ceil(p.fixed / unit.contrib) : null;
  const ccc = (1 - dep) * lagCOD - ((p.batchDays - 1) / 2 + credit);
  return {
    rows, minCash, minDay, endCash: cash, peakPayable, months, cum, be, ccc, setup, seed,
    beMonth: beMonthIdx === -1 ? null : beMonthIdx + 1,
    payback: paybackDay === null ? null : Math.ceil(paybackDay / 30),
  };
}

function runScenario(p) {
  const unit = computeUnit(p);
  return { unit, sim: simulate(p, unit) };
}

/* =========================================================
   TAB 1 — SIMULATOR TÀI CHÍNH
   ========================================================= */
function FinanceTab() {
  const [preset, setPreset] = useState("likely");
  const [p, setP] = useState(PRESETS.likely);
  const [open, setOpen] = useState(true);
  const set = (key) => (v) => {
    setP((s) => ({ ...s, [key]: v }));
    setPreset("custom");
  };
  const pick = (id) => {
    setP(PRESETS[id]);
    setPreset(id);
  };
  const { unit, sim } = useMemo(() => runScenario(p), [p]);
  const noLev = useMemo(() => simulate({ ...p, deposit: 0, credit: 0 }, unit), [p, unit]);
  const N = p.orders;
  const rev = N * unit.aov;
  const net = sim.months[0].net + sim.seed;
  const alloc = allocInfo(p.alloc).list;
  const safe = sim.minCash >= 0;

  const cashData = sim.rows.map((r, i) => ({
    day: r.day,
    "Có chiếm dụng vốn": r.cash,
    "Không cọc + trả nhà in ngay": noLev.rows[i].cash,
    "Nợ nhà in": r.payable,
  }));

  const unitBars = [
    { name: "In ruột", v: unit.inner, t: "c" },
    { name: "Bìa cứng", v: unit.cover, t: "c" },
    { name: "Bao bì, quà", v: unit.pack, t: "c" },
    { name: "Món thêm", v: unit.addonCost, t: "c" },
    { name: "In lại lỗi", v: unit.reprintCost, t: "c" },
    { name: "CAC", v: p.cac, t: "s" },
    { name: "Ship", v: p.ship, t: "s" },
    { name: "Phí TT", v: unit.fee, t: "s" },
    { name: "Thuế", v: unit.tax, t: "s" },
    { name: "Dàn trang", v: p.designCost, t: "s" },
    { name: "LÃI / ĐƠN", v: unit.contrib, t: "p" },
  ].filter((x) => x.v > 0 || x.t === "p");

  const beMax = Math.min(1000, Math.max(200, Math.ceil((Math.max(N, sim.be || 0) * 2) / 50) * 50));
  const beData = [];
  for (let n = 0; n <= beMax; n += Math.max(5, beMax / 40)) beData.push({ n, v: Math.round(n * unit.contrib - p.fixed) });

  const sens = [-30000, 0, 30000].map((d) => {
    const row = { price: `${k(p.pr1 + d)} · ${k(p.pr2 + d)} · ${k(p.pr3 + d)}` };
    [30000, 55000, 80000].forEach((cac) => {
      row[cac] = N * computeUnit({ ...p, pr1: p.pr1 + d, pr2: p.pr2 + d, pr3: p.pr3 + d, cac }).contrib - p.fixed;
    });
    return row;
  });

  return (
    <div>
      <Title n="01" title="Tài chính & Dòng tiền" />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {SCEN.map((s) => (
          <button key={s.id} onClick={() => pick(s.id)} className="flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold transition" style={preset === s.id ? { background: s.color, borderColor: s.color, color: "#fff" } : { borderColor: C.sand, color: C.ink, background: "#fff" }}>
            <s.icon className="h-4 w-4" />
            {s.name}
          </button>
        ))}
        {preset === "custom" && <Pill color={C.muted}>Tùy chỉnh</Pill>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded-xl border border-[#E4E4E2] bg-white px-4 py-2.5 text-sm font-bold lg:hidden">
            <span className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-[#2E2E2E]" />Thông số</span>
            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
          </button>
          <div className={`space-y-4 ${open ? "" : "hidden lg:block"}`}>
            <Card title="Doanh số" icon={TrendingUp}>
              <Slider label="Đơn/tháng (mức TB, tháng đầu)" value={p.orders} min={10} max={1000} step={10} onChange={set("orders")} fmt={(v) => `${v} đơn`} />
              <Slider label="Tăng trưởng/tháng" value={p.growth} min={0} max={60} step={5} onChange={set("growth")} fmt={(v) => `${v}%`} />
              <Slider label="Giá gói 24 trang" value={p.pr1} min={199000} max={299000} step={10000} onChange={set("pr1")} fmt={k} />
              <Slider label="Giá gói 32 trang ⭐" value={p.pr2} min={249000} max={399000} step={10000} onChange={set("pr2")} fmt={k} />
              <Slider label="Giá gói 40 trang" value={p.pr3} min={299000} max={499000} step={10000} onChange={set("pr3")} fmt={k} />
              <Slider label="Tỷ trọng gói 24 trang" value={p.mix1} min={0} max={70} step={5} onChange={set("mix1")} fmt={(v) => `${v}%`} />
              <Slider label="Tỷ trọng gói 40 trang" value={p.mix3} min={0} max={60} step={5} onChange={set("mix3")} fmt={(v) => `${v}%`} />
              <div className="flex justify-between py-1 text-[13px] text-[#6B6B69]"><span>→ Gói 32 trang</span><b className="text-[#2E2E2E]">{Math.round(unit.tiers[1].mix * 100)}%</b></div>
              <Slider label="Khách mua món thêm (chưa bán)" value={p.attach} min={0} max={70} step={5} onChange={set("attach")} fmt={(v) => `${v}%`} />
              <Slider label="Giá món thêm TB" value={p.addonPrice} min={30000} max={130000} step={5000} onChange={set("addonPrice")} fmt={k} />
              <label className="flex cursor-pointer items-center justify-between py-1.5 text-[13px]">
                <span>Tính mùa vụ (Noel, Valentine, 20/10…)</span>
                <input type="checkbox" checked={!!p.season} onChange={(e) => set("season")(e.target.checked)} className="h-4 w-4" style={{ accentColor: C.burgundy }} />
              </label>
              <Slider label="Trần năng lực / tháng" value={p.cap} min={50} max={1000} step={10} onChange={set("cap")} fmt={(v) => `${v} đơn`} />
            </Card>
            <Card title="Giá vốn" icon={Printer}>
              <Slider label="In 1 tờ A3+ (mỹ thuật 200gsm, 2 mặt)" value={p.sheetPrice} min={3000} max={9000} step={250} onChange={set("sheetPrice")} fmt={vnd} />
              <Slider label="Bìa cứng + đóng cuốn" value={p.cover} min={25000} max={80000} step={1000} onChange={set("cover")} fmt={k} />
              <Slider label="Bao bì + quà gói 24 trang" value={p.pack1} min={0} max={20000} step={1000} onChange={set("pack1")} fmt={k} />
              <Slider label="Bao bì + quà gói 32 trang" value={p.pack2} min={5000} max={35000} step={1000} onChange={set("pack2")} fmt={k} />
              <Slider label="Bao bì + hộp quà gói 40 trang" value={p.pack3} min={15000} max={70000} step={1000} onChange={set("pack3")} fmt={k} />
              <Slider label="Giá vốn món thêm" value={p.addonCost} min={0} max={40000} step={1000} onChange={set("addonCost")} fmt={k} />
              <Slider label="In lại do lỗi / hoàn tiền" value={p.reprint} min={0} max={10} step={1} onChange={set("reprint")} fmt={(v) => `${v}%`} />
            </Card>
            <Card title="Bán hàng" icon={Megaphone}>
              <Slider label="CAC / đơn" value={p.cac} min={0} max={120000} step={5000} onChange={set("cac")} fmt={k} />
              <Slider label="Ship shop tự chịu / đơn (khách trả 20k HN · 30k tỉnh)" value={p.ship} min={0} max={25000} step={1000} onChange={set("ship")} fmt={k} />
              <Slider label="Phí thu hộ COD / chuyển khoản" value={p.feePct} min={0} max={20} step={0.5} onChange={set("feePct")} fmt={(v) => `${v}%`} />
              <Slider label="Thuế (0% nếu doanh thu ≤ 500tr/năm)" value={p.taxPct} min={0} max={5} step={0.5} onChange={set("taxPct")} fmt={(v) => `${v}%`} />
              <Slider label="Dàn trang CTV / đơn" value={p.designCost} min={0} max={30000} step={1000} onChange={set("designCost")} fmt={k} />
              <Slider label="Định phí / tháng" value={p.fixed} min={0} max={15000000} step={250000} onChange={set("fixed")} fmt={tr} />
            </Card>
            <Card title="Vốn lưu động" icon={Handshake}>
              <Slider label="Khách trả trước" value={p.deposit} min={0} max={100} step={5} onChange={set("deposit")} fmt={(v) => `${v}%`} />
              <Slider label="Công nợ nhà in" value={p.credit} min={0} max={30} step={1} onChange={set("credit")} fmt={(v) => `${v} ngày`} />
              <Slider label="Gom lô in" value={p.batchDays} min={2} max={14} step={1} onChange={set("batchDays")} fmt={(v) => `${v} ngày`} />
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat label="Doanh thu T1" value={tr(rev)} sub={`AOV ${k(unit.aov)}`} icon={Coins} tone="brand" />
            <Stat label="Biên gộp" value={pct(unit.gm)} sub={`Giá vốn TB ${k(unit.cogs)}/đơn`} icon={TrendingUp} tone={unit.gm >= 65 ? "good" : unit.gm >= 55 ? "warn" : "bad"} />
            <Stat label="Lãi / đơn" value={k(unit.contrib)} sub="Sau mọi chi phí biến đổi" icon={Wallet} tone={unit.contrib >= 80000 ? "good" : unit.contrib > 0 ? "warn" : "bad"} />
            <Stat label="Lãi ròng T1" value={tr(net)} sub="Chưa trừ seeding" icon={PiggyBank} tone={net >= 0 ? "good" : "bad"} />
            <Stat label="Hòa vốn" value={sim.be !== null ? `${sim.be} đơn` : "—"} sub={sim.beMonth ? `Hòa vốn lũy kế ${MONTH_LABELS[sim.beMonth - 1]}` : "Chưa hòa vốn lũy kế trong 12T"} icon={Target} tone={sim.beMonth === 1 ? "good" : sim.beMonth ? "warn" : "bad"} />
            <Stat label="Lãi lũy kế 12T" value={tr(sim.cum)} sub={`ROI ${pct((sim.cum / CAPITAL) * 100, 0)} · ${sim.payback ? `hoàn vốn ${MONTH_LABELS[sim.payback - 1]}` : "chưa hoàn vốn"}`} icon={Coins} tone={sim.cum >= 0 ? "good" : "bad"} />
            <Stat label="Tiền mặt thấp nhất" value={tr(sim.minCash)} sub={`Ngày ${sim.minDay}`} icon={ShieldCheck} tone={sim.minCash >= 5000000 ? "good" : sim.minCash >= 0 ? "warn" : "bad"} />
            <Stat label="Chu kỳ tiền (CCC)" value={`${Math.round(sim.ccc)} ngày`} sub={sim.ccc < 0 ? "Âm = được tài trợ" : "Dương = tự ứng vốn"} icon={Clock} tone={sim.ccc < 0 ? "good" : "bad"} />
          </div>

          <Card title="3 gói bìa cứng" icon={BookOpen} right={<Pill color={C.muted}>B5 nhỡ · giấy mỹ thuật 200gsm</Pill>}>
            <div className="grid gap-3 md:grid-cols-3">
              {unit.tiers.map((t) => (
                <div key={t.name} className={`rounded-xl border-2 p-3 ${t.hero ? "border-[#2E2E2E] bg-[#F5F5F4]" : "border-[#E4E4E2]"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{t.name}</span>
                    <Pill color={t.hero ? C.burgundy : C.muted}>{t.role}</Pill>
                  </div>
                  <div className="mt-1 text-2xl font-extrabold tabular-nums text-[#2E2E2E]">{k(t.price)}</div>
                  <div className="text-xs text-[#6B6B69]">{t.photos} · {t.incl}</div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[11px]">
                    <div className="rounded-lg bg-white p-1.5"><div className="text-[#6B6B69]">Giá vốn</div><b className="tabular-nums">{k(t.cogs)}</b></div>
                    <div className="rounded-lg bg-white p-1.5"><div className="text-[#6B6B69]">Biên gộp</div><b className="tabular-nums">{pct(t.gm, 0)}</b></div>
                    <div className="rounded-lg bg-white p-1.5"><div className="text-[#6B6B69]">Lãi/đơn</div><b className={`tabular-nums ${t.contrib >= 0 ? "text-[#2F6B3A]" : "text-[#B4232F]"}`}>{k(t.contrib)}</b></div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#EFEFEE]"><div className="h-1.5 rounded-full bg-[#2E2E2E]" style={{ width: `${t.mix * 100}%` }} /></div>
                  <div className="mt-1 text-[11px] text-[#6B6B69]">Tỷ trọng đơn {pct(t.mix * 100, 0)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Dòng tiền 12 tháng" icon={Wallet} right={<Pill color={safe ? C.sage : C.red}>{safe ? "Không âm vốn" : "Âm vốn"}</Pill>}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.burgundy} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={C.burgundy} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#EFEFEE" vertical={false} />
                  <XAxis dataKey="day" tick={axis} ticks={[0, 60, 120, 180, 240, 300, 360]} tickFormatter={(d) => (d ? MONTH_LABELS[d / 30 - 1] : "Mở bán")} />
                  <YAxis tick={axis} tickFormatter={tr} width={52} />
                  <Tooltip {...tip} labelFormatter={(d) => `Ngày ${d}`} formatter={(v) => vnd(v)} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT }} />
                  <ReferenceLine y={0} stroke={C.ink} />
                  <ReferenceLine y={CAPITAL} stroke={C.gold} strokeDasharray="5 4" label={{ value: "Vốn gốc 20tr", position: "insideTopLeft", fontSize: 11, fill: C.gold }} />
                  <Area isAnimationActive={false} type="monotone" dataKey="Có chiếm dụng vốn" stroke={C.burgundy} strokeWidth={2.5} fill="url(#gCash)" />
                  <Line isAnimationActive={false} type="monotone" dataKey="Không cọc + trả nhà in ngay" stroke={C.muted} strokeDasharray="6 4" dot={false} strokeWidth={1.5} />
                  <Line isAnimationActive={false} type="monotone" dataKey="Nợ nhà in" stroke={C.gold} dot={false} strokeWidth={1.5} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Stat label="Tiền mặt khi mở bán" value={tr(CAPITAL - sim.setup)} />
              <Stat label="Nhà in tài trợ tối đa" value={tr(sim.peakPayable)} tone={sim.peakPayable > 0 ? "good" : "default"} />
              <Stat label="Lợi ích chiếm dụng vốn" value={`+${tr(Math.max(0, sim.minCash - noLev.minCash))}`} sub="Tiền mặt đáy cao hơn" tone="good" />
            </div>
          </Card>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card title="1 đơn đi đâu?" icon={Layers}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitBars} layout="vertical" margin={{ left: 0, right: 44 }}>
                    <CartesianGrid stroke="#EFEFEE" horizontal={false} />
                    <XAxis type="number" tick={axis} tickFormatter={k} />
                    <YAxis type="category" dataKey="name" width={78} tick={{ ...axis, fill: C.ink }} />
                    <Tooltip {...tip} formatter={(v) => vnd(v)} />
                    <Bar isAnimationActive={false} dataKey="v" name="Giá trị" radius={[0, 6, 6, 0]}>
                      {unitBars.map((b, i) => <Cell key={i} fill={b.t === "p" ? (b.v >= 0 ? C.sage : C.red) : b.t === "c" ? C.burgundy : C.gold} fillOpacity={b.t === "p" ? 1 : 0.8} />)}
                      <LabelList dataKey="v" position="right" formatter={k} style={{ fontSize: 11, fill: C.ink, fontFamily: FONT }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#6B6B69]">
                <span className="flex items-center gap-1.5"><Dot color={C.burgundy} />Giá vốn</span>
                <span className="flex items-center gap-1.5"><Dot color={C.gold} />Chi phí bán</span>
                <span className="flex items-center gap-1.5"><Dot color={C.sage} />Lãi</span>
                <span className="ml-auto font-semibold text-[#2E2E2E]">Giá TB {k(unit.aov)}</span>
              </div>
            </Card>

            <Card title="Điểm hòa vốn" icon={Target}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={beData} margin={{ top: 16, right: 16, left: 0 }}>
                    <CartesianGrid stroke="#EFEFEE" vertical={false} />
                    <XAxis dataKey="n" type="number" domain={[0, beMax]} tick={axis} />
                    <YAxis tick={axis} tickFormatter={tr} width={52} />
                    <Tooltip {...tip} labelFormatter={(v) => `${Math.round(v)} đơn/tháng`} formatter={(v) => [vnd(v), "Lãi ròng/tháng"]} />
                    <ReferenceArea y1={0} y2={Math.max(1, beMax * unit.contrib)} fill={C.sage} fillOpacity={0.06} />
                    <ReferenceLine y={0} stroke={C.ink} />
                    <ReferenceLine x={N} stroke={C.burgundy} strokeDasharray="4 4" label={{ value: `Hiện tại ${N}`, fontSize: 11, fill: C.burgundy, position: "top" }} />
                    {sim.be !== null && sim.be <= beMax && <ReferenceLine x={sim.be} stroke={C.sage} strokeWidth={2} label={{ value: `Hòa vốn ${sim.be}`, fontSize: 11, fill: C.sage, position: "insideBottomRight" }} />}
                    <Line isAnimationActive={false} type="monotone" dataKey="v" stroke={C.burgundy} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card title="Lãi ròng theo tháng" icon={Calendar}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={sim.months} margin={{ top: 10, right: 10, left: 0 }}>
                    <CartesianGrid stroke="#EFEFEE" vertical={false} />
                    <XAxis dataKey="m" tick={axis} />
                    <YAxis tick={axis} tickFormatter={tr} width={52} />
                    <Tooltip {...tip} formatter={(v, n) => [n === "Đơn" ? v : vnd(v), n]} />
                    <ReferenceLine y={0} stroke={C.ink} />
                    <Bar isAnimationActive={false} dataKey="net" name="Lãi ròng" radius={[6, 6, 0, 0]}>
                      {sim.months.map((m) => <Cell key={m.m} fill={m.net >= 0 ? C.sage : C.red} />)}
                      <LabelList dataKey="net" position="top" formatter={tr} style={{ fontSize: 11, fill: C.ink, fontFamily: FONT }} />
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-12 gap-0.5 text-center text-[10px] text-[#6B6B69]">
                {sim.months.map((m) => <div key={m.m}><b className="text-[#2E2E2E]">{m.orders}</b></div>)}
              </div>
            </Card>

            <Card title="Lãi ròng T1: Bảng giá × CAC" icon={Sparkles}>
              <table className="w-full text-center text-sm tabular-nums">
                <thead>
                  <tr className="text-xs text-[#6B6B69]">
                    <th className="py-2 text-left">Bảng giá ↓ / CAC →</th><th>30k</th><th>55k</th><th>80k</th>
                  </tr>
                </thead>
                <tbody>
                  {sens.map((r) => (
                    <tr key={r.price} className="border-t border-[#EFEFEE]">
                      <td className="py-3 text-left text-xs font-bold">{r.price}</td>
                      {[30000, 55000, 80000].map((c) => (
                        <td key={c}>
                          <span className={`inline-block min-w-[64px] rounded-lg px-2 py-1.5 text-xs font-bold ${r[c] >= 0 ? "bg-[#DFEEE6] text-[#2F6B3A]" : "bg-[#FBE3E7] text-[#B4232F]"}`}>{tr(r[c])}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-xs text-[#6B6B69]">Với {N} đơn/tháng</div>
            </Card>
          </div>

          <Card title="Phân bổ 20 triệu" icon={PiggyBank} right={<Pill color={p.alloc === "safe" ? C.burgundy : C.gold}>{p.alloc === "safe" ? "Phương án thận trọng" : "Phương án cơ sở"}</Pill>}>
            <div className="grid gap-5 md:grid-cols-[200px_1fr]">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie isAnimationActive={false} data={alloc} dataKey="amount" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                      {alloc.map((a, i) => <Cell key={a.key} fill={CHART[i % CHART.length]} />)}
                    </Pie>
                    <Tooltip {...tip} formatter={(v) => vnd(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {alloc.map((a, i) => (
                  <div key={a.key}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 font-semibold"><Dot color={CHART[i % CHART.length]} />{a.name}</span>
                      <span className="tabular-nums font-bold">{tr(a.amount)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-[#EFEFEE]"><div className="h-1.5 rounded-full" style={{ width: `${(a.amount / CAPITAL) * 100}%`, background: CHART[i % CHART.length] }} /></div>
                      <span className="w-40 shrink-0 truncate text-[11px] text-[#6B6B69]" title={a.detail}>{a.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <details className="rounded-2xl border border-[#E4E4E2] bg-white p-4 text-sm">
            <summary className="cursor-pointer font-bold text-[#2E2E2E]">Giả định mô hình</summary>
            <ul className="mt-3 grid gap-1.5 text-[13px] text-[#2E2E2E] md:grid-cols-2">
              <li>• Đơn rải đều mỗi ngày, tăng theo tháng</li>
              <li>• Phần trả trước về ngay; phần còn lại về sau {Math.round(p.batchDays / 2 + 7) + 2} ngày</li>
              <li>• Gom lô {p.batchDays} ngày; in 4 ngày; giao 3 ngày</li>
              <li>• Trả nhà in sau {p.credit} ngày kể từ ngày gửi lô</li>
              <li>• Định phí trả đầu mỗi tháng; seeding rải 30 ngày đầu</li>
              <li>• 1 tờ A3+ in 2 mặt = 4 trang B5 nhỡ có tràn lề; món thêm đang để 0% vì chưa bán trên web; thuế 0% nếu doanh thu năm ≤ 500 triệu (Luật thuế TNCN sửa đổi, áp dụng từ 2026 — cần kiểm chứng với cơ quan thuế)</li><li>• Cọc 50%; đơn trả đủ 100% làm tỷ lệ trả trước trung bình lên ~60%; COD về sau khi giao</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TAB 2 — KỊCH BẢN THẬN TRỌNG TỐI ĐA
   ========================================================= */
const SHOCKS = [
  { name: "Đơn ít hơn 40%", f: (p) => ({ ...p, orders: p.orders * 0.6 }) },
  { name: "CAC gấp đôi", f: (p) => ({ ...p, cac: p.cac * 2 }) },
  { name: "Giá in & bìa +40%", f: (p) => ({ ...p, sheetPrice: p.sheetPrice * 1.4, cover: p.cover * 1.4 }) },
  { name: "Phải giảm giá 30k", f: (p) => ({ ...p, pr1: p.pr1 - 30000, pr2: p.pr2 - 30000, pr3: p.pr3 - 30000 }) },
  { name: "Khách dồn về gói 24 trang", f: (p) => ({ ...p, mix1: 60, mix3: 10 }) },
  { name: "Ít ai mua món thêm", f: (p) => ({ ...p, attach: 5 }) },
  { name: "Tăng trưởng = 0", f: (p) => ({ ...p, growth: 0 }) },
  { name: "Nhà in không cho nợ", f: (p) => ({ ...p, credit: 0 }) },
  { name: "Khách chỉ cọc 30%", f: (p) => ({ ...p, deposit: 30 }) },
  { name: "Lỗi in 8%", f: (p) => ({ ...p, reprint: 8 }) },
  { name: "Định phí +2tr", f: (p) => ({ ...p, fixed: p.fixed + 2000000 }) },
];

const GATES = [
  { icon: Printer, name: "Cổng 0 · Sản phẩm", time: "Tuần 1–2", spend: 5500000, pass: ["Giá vốn gói 32 trang ≤ 85k", "1 xưởng đạt màu da", "3 cuốn mẫu 24/32/40 trang"] },
  { icon: Users, name: "Cổng 1 · Nhu cầu", time: "Tuần 3–6", spend: 1500000, pass: ["≥ 20 đơn trả trước", "≥ 3 video > 10k view", "Tỷ lệ chốt DM ≥ 25%"] },
  { icon: Radio, name: "Cổng 2 · Kênh", time: "Tháng 2–3", spend: 3000000, pass: ["≥ 40 đơn/tháng", "CAC thực ≤ 60k", "Biên gộp ≥ 50%"] },
  { icon: TrendingUp, name: "Cổng 3 · Mở rộng", time: "Tháng 4+", spend: 0, pass: ["≥ 80 đơn/tháng × 2 tháng", "Công nợ in ≥ 15 ngày", "Tự chi bằng lãi, không dùng vốn gốc"] },
];

const KILL = [
  { m: "Đơn / tháng (từ T2)", g: "≥ 60", y: "30–59", r: "< 30", act: "Chỉ bán theo đợt lễ" },
  { m: "CAC thực", g: "≤ 40k", y: "40–70k", r: "> 70k", act: "Tắt Ads" },
  { m: "Biên gộp", g: "≥ 70%", y: "60–70%", r: "< 60%", act: "Đổi xưởng / tăng giá gói 40" },
  { m: "Tỷ trọng gói 24 trang", g: "≤ 30%", y: "30–45%", r: "> 45%", act: "Bớt quà gói 24, đẩy gói 32" },
  { m: "Tỷ lệ trả trước", g: "≥ 60%", y: "50–60%", r: "< 50%", act: "Đẩy ưu đãi trả đủ 100% miễn ship" },
  { m: "Lỗi in", g: "≤ 2%", y: "2–5%", r: "> 5%", act: "Chuyển xưởng dự phòng" },
  { m: "Tiền mặt", g: "≥ 10tr", y: "5–10tr", r: "< 5tr", act: "Dừng mọi chi không bắt buộc" },
];

const DEFENSE = [
  { icon: Package, t: "Sản phẩm", d: "3 gói bìa cứng", x: "1 chất liệu, khác số trang & quà" },
  { icon: Tag, t: "Giá", d: "259 · 299 · 349k", x: "Tặng thêm, không giảm giá" },
  { icon: Boxes, t: "Tồn kho", d: "0 sách tồn", x: "Hộp quà ≤ 20 cái" },
  { icon: Lock, t: "Thanh toán", d: "Cọc ≥ 50%", x: "100% với bìa cứng & đơn gấp" },
  { icon: Radio, t: "Kênh", d: "Organic trước", x: "Ads ≤ 20% lãi gộp tháng trước" },
  { icon: Users, t: "Nhân sự", d: "1 người", x: "CTV khi > 100 đơn" },
  { icon: Printer, t: "Xưởng in", d: "1 chính + 1 dự phòng", x: "Trả đúng hẹn để xin nợ" },
  { icon: Calendar, t: "Mùa vụ", d: "Dồn lực Noel, Valentine", x: "Thấp điểm: chỉ làm content" },
];

function SafeTab() {
  const res = useMemo(() => {
    const out = {};
    SCEN.forEach((s) => {
      out[s.id] = runScenario(PRESETS[s.id]);
    });
    return out;
  }, []);
  const baseEnd = res.safe.sim.endCash;
  const sp = res.safe.sim;
  const tornado = SHOCKS.map((s) => {
    const r = runScenario(s.f(PRESETS.safe));
    return { name: s.name, delta: r.sim.endCash - baseEnd, min: r.sim.minCash };
  }).sort((a, b) => a.delta - b.delta);

  const worst = useMemo(() => {
    let q = PRESETS.safe;
    SHOCKS.slice(0, 3).forEach((s) => {
      q = s.f(q);
    });
    return runScenario(q);
  }, []);
  const cashData = res.safe.sim.rows.map((r, i) => ({
    day: r.day,
    "Thận trọng tối đa": r.cash,
    "Bão kép": worst.sim.rows[i].cash,
  }));


  const capitalAtRisk = GATES.reduce((s, g) => s + g.spend, 0);
  let acc = 0;
  const gateBars = GATES.map((g) => {
    acc += g.spend;
    return { name: g.name.split(" · ")[0], "Đã giải ngân": acc, "Giữ lại": CAPITAL - acc };
  });

  return (
    <div className="space-y-5">
      <Title n="02" title="Kịch bản thận trọng tối đa" />

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Tiền mặt thấp nhất" value={tr(sp.minCash)} sub={`Ngày ${sp.minDay}`} icon={ShieldCheck} tone={sp.minCash >= 5000000 ? "good" : "warn"} />
        <Stat label="Lỗ / lãi lũy kế 12 tháng" value={tr(sp.cum)} sub={`${pct((Math.abs(Math.min(0, sp.cum)) / CAPITAL) * 100, 0)} vốn gốc`} icon={TrendingDown} tone={sp.cum >= 0 ? "good" : "warn"} />
        <Stat label="Hòa vốn" value={sp.beMonth ? MONTH_LABELS[sp.beMonth - 1] : "Sau 11/27"} sub={`${sp.be} đơn/tháng`} icon={Target} tone="warn" />
        <Stat label="Bão kép: đơn −40%, CAC ×2, in +40%" value={tr(worst.sim.minCash)} sub="Tiền mặt thấp nhất" icon={AlertTriangle} tone={worst.sim.minCash >= 0 ? "warn" : "bad"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Tiền mặt 12 tháng" icon={Wallet}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashData} margin={{ top: 10, right: 10, left: 0 }}>
                <defs>
                  <linearGradient id="gSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.burgundy} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={C.burgundy} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="day" tick={axis} ticks={[0, 60, 120, 180, 240, 300, 360]} tickFormatter={(d) => (d ? MONTH_LABELS[d / 30 - 1] : "Mở bán")} />
                <YAxis tick={axis} tickFormatter={tr} width={52} />
                <Tooltip {...tip} labelFormatter={(d) => `Ngày ${d}`} formatter={(v) => vnd(v)} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT }} />
                <ReferenceArea y1={0} y2={5000000} fill={C.gold} fillOpacity={0.1} />
                <ReferenceLine y={5000000} stroke={C.gold} strokeDasharray="4 4" label={{ value: "Sàn an toàn 5tr", position: "insideTopRight", fontSize: 11, fill: C.gold }} />
                <ReferenceLine y={0} stroke={C.ink} strokeWidth={1.5} />
                <Area isAnimationActive={false} type="monotone" dataKey="Thận trọng tối đa" stroke={C.burgundy} strokeWidth={2.5} fill="url(#gSafe)" />
                <Line isAnimationActive={false} type="monotone" dataKey="Bão kép" stroke={C.wine} strokeDasharray="6 4" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Lãi ròng mỗi tháng" icon={Calendar}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sp.months} margin={{ top: 20, right: 6, left: 0 }}>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="m" tick={axis} />
                <YAxis tick={axis} tickFormatter={tr} width={52} />
                <Tooltip {...tip} formatter={(v) => [vnd(v), "Lãi ròng"]} />
                <ReferenceLine y={0} stroke={C.ink} />
                <Bar isAnimationActive={false} dataKey="net" radius={[4, 4, 4, 4]}>
                  {sp.months.map((m) => <Cell key={m.m} fill={m.net >= 0 ? C.sage : C.red} />)}
                  <LabelList dataKey="net" position="top" formatter={tr} style={{ fontSize: 11, fill: C.ink, fontFamily: FONT }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-12 text-center text-[10px] text-[#6B6B69]">{sp.months.map((m) => <div key={m.m}><b className="text-[#2E2E2E]">{m.orders}</b></div>)}</div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Rủi ro nào đau nhất? (trên kịch bản thận trọng)" icon={AlertTriangle}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tornado} layout="vertical" margin={{ left: 0, right: 50 }}>
                <CartesianGrid stroke="#EFEFEE" horizontal={false} />
                <XAxis type="number" tick={axis} tickFormatter={tr} />
                <YAxis type="category" dataKey="name" width={130} tick={{ ...axis, fill: C.ink }} />
                <Tooltip {...tip} formatter={(v, n, it) => [`${vnd(v)} (đáy tiền mặt ${tr(it.payload.min)})`, "Tiền mặt cuối T12 thay đổi"]} />
                <ReferenceLine x={0} stroke={C.ink} />
                <Bar isAnimationActive={false} dataKey="delta" radius={[6, 6, 6, 6]}>
                  {tornado.map((t) => <Cell key={t.name} fill={t.min < 0 ? C.wine : t.delta < -3000000 ? C.burgundy : C.rose} />)}
                  <LabelList dataKey="delta" position="right" formatter={tr} style={{ fontSize: 11, fill: C.ink, fontFamily: FONT }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#6B6B69]">
            <span className="flex items-center gap-1.5"><Dot color={C.wine} />Làm âm tiền mặt</span>
            <span className="flex items-center gap-1.5"><Dot color={C.burgundy} />Mất &gt; 3tr</span>
            <span className="flex items-center gap-1.5"><Dot color={C.rose} />Chịu được</span>
          </div>
        </Card>

        <Card title="Giải ngân vốn theo cổng" icon={Unlock} right={<Pill color={C.sage}>Rủi ro tối đa {tr(capitalAtRisk)}</Pill>}>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gateBars} layout="vertical" margin={{ left: 0, right: 10 }} stackOffset="none">
                <XAxis type="number" domain={[0, CAPITAL]} tick={axis} tickFormatter={tr} />
                <YAxis type="category" dataKey="name" width={60} tick={{ ...axis, fill: C.ink }} />
                <Tooltip {...tip} formatter={(v) => vnd(v)} />
                <Bar isAnimationActive={false} dataKey="Đã giải ngân" stackId="a" fill={C.burgundy} />
                <Bar isAnimationActive={false} dataKey="Giữ lại" stackId="a" fill={C.beige} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {GATES.map((g, i) => (
              <div key={g.name} className="rounded-xl border border-[#E4E4E2] p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-[#2E2E2E]"><g.icon className="h-4 w-4" />{g.name}</span>
                  <span className="text-xs font-bold tabular-nums">{g.spend ? tr(g.spend) : "Tự chi"}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-[#6B6B69]">{g.time}</div>
                <ul className="mt-1.5 space-y-0.5 text-xs">
                  {g.pass.map((x) => <li key={x} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-[#6E9A52]" />{x}</li>)}
                </ul>
                {i < GATES.length - 1 && <div className="mt-1.5 text-[11px] font-semibold text-[#DDA543]">Không đạt → không mở cổng sau</div>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Đèn tín hiệu dừng lỗ" icon={Ban}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs text-[#6B6B69]">
                <th className="py-2 text-left">Chỉ số</th>
                <th><span className="inline-flex items-center gap-1.5"><Dot color={C.sage} />Tiếp tục</span></th>
                <th><span className="inline-flex items-center gap-1.5"><Dot color={C.gold} />Theo dõi</span></th>
                <th><span className="inline-flex items-center gap-1.5"><Dot color={C.burgundy} />Dừng</span></th>
                <th className="text-left">Hành động khi đỏ</th>
              </tr>
            </thead>
            <tbody>
              {KILL.map((r) => (
                <tr key={r.m} className="border-t border-[#EFEFEE]">
                  <td className="py-2.5 font-semibold">{r.m}</td>
                  <td className="text-center"><span className="rounded-md bg-[#DFEEE6] px-2 py-1 text-xs font-bold text-[#2F6B3A]">{r.g}</span></td>
                  <td className="text-center"><span className="rounded-md bg-[#FFF6E5] px-2 py-1 text-xs font-bold text-[#7A4B00]">{r.y}</span></td>
                  <td className="text-center"><span className="rounded-md bg-[#F8E6E6] px-2 py-1 text-xs font-bold text-[#2E2E2E]">{r.r}</span></td>
                  <td className="text-[13px]">{r.act}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Chiến lược kinh doanh phòng thủ" icon={Shield}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {DEFENSE.map((d) => (
            <div key={d.t} className="flex gap-3 rounded-xl bg-[#F5F5F4] p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2E2E2E] text-white"><d.icon className="h-4 w-4" /></span>
              <div>
                <div className="text-[11px] font-semibold text-[#6B6B69]">{d.t}</div>
                <div className="text-sm font-bold">{d.d}</div>
                <div className="text-xs text-[#6B6B69]">{d.x}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   TAB 3 — XÁC SUẤT & HÒA VỐN (MONTE CARLO)
   ========================================================= */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const tri = (r, a, m, b) => {
  const u = r();
  const c = (m - a) / (b - a);
  return u < c ? a + Math.sqrt(u * (b - a) * (m - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - m));
};
const DIST = [
  { key: "orders", name: "Đơn/tháng (TB, tháng đầu)", a: 8, m: 30, b: 90, f: (v) => `${Math.round(v)}` },
  { key: "growth", name: "Tăng trưởng/tháng", a: -5, m: 10, b: 25, f: (v) => `${Math.round(v)}%` },
  { key: "cac", name: "CAC (quảng cáo + KOC)", a: 30000, m: 55000, b: 110000, f: k },
  { key: "mix1", name: "Tỷ trọng gói 24 trang", a: 15, m: 30, b: 55, f: (v) => `${Math.round(v)}%` },
  { key: "attach", name: "Khách mua món thêm", a: 0, m: 0, b: 20, f: (v) => `${Math.round(v)}%` },
  { key: "disc", name: "Giảm giá thực tế", a: 0, m: 0, b: 30000, f: k },
  { key: "sheetPrice", name: "In 1 tờ A3+ mỹ thuật 200", a: 3500, m: 4500, b: 7000, f: (v) => `${(v / 1000).toFixed(1).replace(".", ",")}k` },
  { key: "cover", name: "Bìa cứng + đóng", a: 32000, m: 42000, b: 60000, f: k },
  { key: "ship", name: "Ship shop tự chịu", a: 4000, m: 10000, b: 18000, f: k },
  { key: "reprint", name: "Lỗi in", a: 1, m: 3, b: 8, f: (v) => `${Math.round(v)}%` },
  { key: "credit", name: "Công nợ nhà in", a: 0, m: 7, b: 15, f: (v) => `${Math.round(v)} ngày` },
  { key: "fixed", name: "Định phí / tháng", a: 1800000, m: 2500000, b: 4000000, f: tr },
];
const N_RUNS = 1000;
const pctl = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))];

function runMC(seed) {
  const r = mulberry32(seed);
  const runs = [];
  for (let i = 0; i < N_RUNS; i++) {
    const q = { ...PRESETS.likely };
    const x = {};
    DIST.forEach((d) => {
      x[d.key] = tri(r, d.a, d.m, d.b);
      q[d.key] = x[d.key];
    });
    q.pr1 -= x.disc;
    q.pr2 -= x.disc;
    q.pr3 -= x.disc;
    q.mult = Array.from({ length: MONTHS }, () => 0.75 + r() * 0.5);
    const unit = computeUnit(q);
    const sim = simulate(q, unit, 10);
    runs.push({ x, cum: sim.cum, beMonth: sim.beMonth, minCash: sim.minCash, payback: sim.payback, path: sim.rows.map((row) => row.cash) });
  }
  return runs;
}

function ProbTab() {
  const [seed, setSeed] = useState(2026);
  const scen = useMemo(() => {
    const o = {};
    SCEN.forEach((s) => {
      o[s.id] = runScenario(PRESETS[s.id]);
    });
    return o;
  }, []);
  const mc = useMemo(() => {
    const runs = runMC(seed);
    const n = runs.length;
    const cums = runs.map((x) => x.cum).sort((a, b) => a - b);
    const share = (f) => (runs.filter(f).length / n) * 100;
    const fan = runs[0].path.map((_, i) => {
      const v = runs.map((x) => x.path[i]).sort((a, b) => a - b);
      return { day: i * 10, b90: [pctl(v, 0.1), pctl(v, 0.9)], b50: [pctl(v, 0.25), pctl(v, 0.75)], p50: pctl(v, 0.5) };
    });
    let acc = 0;
    const beHist = [...Array.from({ length: MONTHS }, (_, i) => i + 1), null].map((m) => {
      const c = share((x) => x.beMonth === m);
      acc += c;
      return { m: m ? MONTH_LABELS[m - 1] : "Chưa", p: c, cum: m ? acc : null };
    });
    const lo = pctl(cums, 0.01);
    const hi = pctl(cums, 0.99);
    const step = Math.max(1000000, Math.ceil((hi - lo) / 14 / 1000000) * 1000000);
    const start = Math.floor(lo / step) * step;
    const hist = [];
    for (let b = start; b < hi + step; b += step) {
      hist.push({ from: b, label: tr(b), p: share((x) => x.cum >= b && x.cum < b + step) });
    }
    const mean = cums.reduce((s, v) => s + v, 0) / n;
    const corr = DIST.map((d) => {
      const xs = runs.map((x) => x.x[d.key]);
      const mx = xs.reduce((s, v) => s + v, 0) / n;
      let sxy = 0;
      let sxx = 0;
      let syy = 0;
      runs.forEach((x, i) => {
        sxy += (xs[i] - mx) * (x.cum - mean);
        sxx += (xs[i] - mx) ** 2;
        syy += (x.cum - mean) ** 2;
      });
      return { name: d.name, r: sxy / Math.sqrt(sxx * syy) };
    }).sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
    const cuts = ["safe", "likely", "base", "opt"].map((id) => scen[id].sim.cum);
    const zones = [
      { name: "Tệ hơn Thận trọng", p: share((x) => x.cum < cuts[0]), color: C.wine },
      { name: "Thận trọng → Khả dĩ", p: share((x) => x.cum >= cuts[0] && x.cum < cuts[1]), color: C.burgundy },
      { name: "Khả dĩ → Cơ sở", p: share((x) => x.cum >= cuts[1] && x.cum < cuts[2]), color: C.navy },
      { name: "Cơ sở → Lạc quan", p: share((x) => x.cum >= cuts[2] && x.cum < cuts[3]), color: C.gold },
      { name: "Hơn Lạc quan", p: share((x) => x.cum >= cuts[3]), color: C.sage },
    ];
    return {
      fan, beHist, hist, corr, zones, mean,
      p10: pctl(cums, 0.1), p50: pctl(cums, 0.5), p90: pctl(cums, 0.9),
      pProfit: share((x) => x.cum >= 0),
      pBE6: share((x) => x.beMonth && x.beMonth <= 6),
      pPay: share((x) => x.payback !== null),
      pNeg: share((x) => x.minCash < 0),
      pFloor: share((x) => x.minCash < 5000000),
      beat: (v) => share((x) => x.cum >= v),
    };
  }, [seed, scen]);

  const rows = [
    ["Đơn tháng 1", (s) => `${PRESETS[s].orders}`],
    ["Giá trị đơn TB", (s) => k(scen[s].unit.aov)],
    ["Giá vốn / cuốn", (s) => k(scen[s].unit.cogs)],
    ["Biên gộp", (s) => pct(scen[s].unit.gm, 0)],
    ["Lãi / đơn", (s) => k(scen[s].unit.contrib)],
    ["Hòa vốn (đơn/tháng)", (s) => (scen[s].sim.be ? `${scen[s].sim.be} đơn` : "—")],
    ["Doanh thu hòa vốn/tháng", (s) => (scen[s].sim.be ? tr(scen[s].sim.be * scen[s].unit.aov) : "—")],
    ["Hòa vốn lũy kế", (s) => (scen[s].sim.beMonth ? MONTH_LABELS[scen[s].sim.beMonth - 1] : "Sau 11/27")],
    ["Hoàn vốn 20tr", (s) => (scen[s].sim.payback ? MONTH_LABELS[scen[s].sim.payback - 1] : "Sau 11/27")],
    ["Lãi lũy kế 12T", (s) => tr(scen[s].sim.cum)],
    ["Tiền mặt thấp nhất", (s) => tr(scen[s].sim.minCash)],
    ["Xác suất đạt hoặc vượt", (s) => pct(mc.beat(scen[s].sim.cum), 0)],
  ];
  const tone = (v, g, w) => (v >= g ? "good" : v >= w ? "warn" : "bad");

  return (
    <div className="space-y-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-[#2E2E2E] px-2.5 py-1 text-xs font-bold text-white">03</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#2E2E2E]">Xác suất & Hòa vốn</h2>
        </div>
        <button onClick={() => setSeed((x) => x + 1)} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4E4E2] bg-white px-3 py-2 text-xs font-bold text-[#2E2E2E] hover:bg-[#F5F5F4]">
          <RotateCcw className="h-3.5 w-3.5" /> Chạy lại {N_RUNS.toLocaleString("vi-VN")} mô phỏng
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <Stat label="Lãi 12T dễ xảy ra nhất" value={tr(mc.p50)} sub={`80% nằm trong ${tr(mc.p10)} → ${tr(mc.p90)}`} icon={Target} tone="brand" />
        <Stat label="Xác suất có lãi sau 12T" value={pct(mc.pProfit, 0)} sub={`Kỳ vọng ${tr(mc.mean)}`} icon={Coins} tone={tone(mc.pProfit, 70, 50)} />
        <Stat label="Hòa vốn lũy kế trong 6T" value={pct(mc.pBE6, 0)} icon={Calendar} tone={tone(mc.pBE6, 70, 50)} />
        <Stat label="Hoàn vốn 20tr trong 12T" value={pct(mc.pPay, 0)} icon={PiggyBank} tone={tone(mc.pPay, 60, 35)} />
        <Stat label="Có lúc âm tiền mặt" value={pct(mc.pNeg, 0)} sub={`Chạm sàn 5tr: ${pct(mc.pFloor, 0)}`} icon={AlertTriangle} tone={mc.pNeg <= 5 ? "good" : mc.pNeg <= 15 ? "warn" : "bad"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Tiền mặt 12 tháng — dải xác suất" icon={Wallet}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mc.fan} margin={{ top: 10, right: 10, left: 0 }}>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="day" tick={axis} ticks={[0, 60, 120, 180, 240, 300, 360]} tickFormatter={(d) => (d ? MONTH_LABELS[d / 30 - 1] : "Mở bán")} />
                <YAxis tick={axis} tickFormatter={tr} width={52} />
                <Tooltip {...tip} labelFormatter={(d) => `Ngày ${d}`} formatter={(v, n) => [Array.isArray(v) ? `${tr(v[0])} → ${tr(v[1])}` : tr(v), n]} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: FONT }} />
                <ReferenceLine y={0} stroke={C.ink} />
                <ReferenceLine y={5000000} stroke={C.gold} strokeDasharray="4 4" label={{ value: "Sàn 5tr", position: "insideBottomRight", fontSize: 11, fill: C.gold }} />
                <ReferenceLine y={CAPITAL} stroke={C.sage} strokeDasharray="5 4" label={{ value: "Hoàn vốn 20tr", position: "insideTopLeft", fontSize: 11, fill: C.sage }} />
                <Area isAnimationActive={false} dataKey="b90" name="80% khả năng" stroke="none" fill={C.navy} fillOpacity={0.12} />
                <Area isAnimationActive={false} dataKey="b50" name="50% khả năng" stroke="none" fill={C.navy} fillOpacity={0.25} />
                <Line isAnimationActive={false} dataKey="p50" name="Dễ xảy ra nhất" stroke={C.navy} strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Hòa vốn lũy kế ở tháng nào?" icon={Calendar}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mc.beHist} margin={{ top: 16, right: 6, left: -10 }}>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="m" tick={axis} interval={0} />
                <YAxis tick={axis} tickFormatter={(v) => `${v}%`} width={40} domain={[0, 100]} />
                <Tooltip {...tip} formatter={(v, n) => [pct(v, 0), n]} />
                <Bar isAnimationActive={false} dataKey="p" name="Xác suất" radius={[4, 4, 0, 0]}>
                  {mc.beHist.map((b) => <Cell key={b.m} fill={b.m === "Chưa" ? C.burgundy : C.navy} />)}
                </Bar>
                <Line isAnimationActive={false} dataKey="cum" name="Cộng dồn" stroke={C.gold} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Kết quả rơi vào vùng nào? (lãi lũy kế 12T)" icon={Layers}>
          <div className="flex h-10 overflow-hidden rounded-xl">
            {mc.zones.map((z) => (
              <div key={z.name} className="flex items-center justify-center text-xs font-bold text-white" style={{ width: `${z.p}%`, background: z.color }} title={z.name}>{z.p >= 6 ? pct(z.p, 0) : ""}</div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            {mc.zones.map((z) => (
              <div key={z.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Dot color={z.color} />{z.name}</span>
                <b className="tabular-nums">{pct(z.p, 0)}</b>
              </div>
            ))}
          </div>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mc.hist} margin={{ top: 6, right: 6, left: -10 }}>
                <XAxis dataKey="label" tick={{ ...axis, fontSize: 9 }} interval={1} />
                <YAxis tick={axis} tickFormatter={(v) => `${v}%`} width={40} />
                <Tooltip {...tip} labelFormatter={(l) => `Từ ${l}`} formatter={(v) => [pct(v, 1), "Xác suất"]} />
                <Bar isAnimationActive={false} dataKey="p" radius={[3, 3, 0, 0]}>
                  {mc.hist.map((h) => <Cell key={h.from} fill={h.from >= 0 ? C.sage : C.red} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Yếu tố quyết định lãi/lỗ" icon={Target}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mc.corr} layout="vertical" margin={{ left: 0, right: 40 }}>
                <XAxis type="number" domain={[-1, 1]} tick={axis} tickFormatter={(v) => v.toFixed(1)} />
                <YAxis type="category" dataKey="name" width={120} tick={{ ...axis, fill: C.ink }} />
                <Tooltip {...tip} formatter={(v) => [v.toFixed(2), "Tương quan với lãi 12T"]} />
                <ReferenceLine x={0} stroke={C.ink} />
                <Bar isAnimationActive={false} dataKey="r" radius={[4, 4, 4, 4]}>
                  {mc.corr.map((c) => <Cell key={c.name} fill={c.r >= 0 ? C.sage : C.red} />)}
                  <LabelList dataKey="r" position="right" formatter={(v) => v.toFixed(2)} style={{ fontSize: 10, fill: C.ink, fontFamily: FONT }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex gap-3 text-xs text-[#6B6B69]">
            <span className="flex items-center gap-1.5"><Dot color={C.sage} />Tăng → lãi tăng</span>
            <span className="flex items-center gap-1.5"><Dot color={C.burgundy} />Tăng → lãi giảm</span>
          </div>
        </Card>
      </div>

      <Card title="Hòa vốn & hoàn vốn theo kịch bản" icon={Target}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm tabular-nums">
            <thead>
              <tr>
                <th className="py-2 text-left text-xs text-[#6B6B69]">Chỉ số</th>
                {SCEN.map((s) => (
                  <th key={s.id} className="px-2 py-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ background: s.color }}><s.icon className="h-3.5 w-3.5" />{s.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, f], i) => (
                <tr key={label} className={`border-t border-[#EFEFEE] ${i === rows.length - 1 ? "bg-[#F5F5F4]" : ""}`}>
                  <td className="py-2.5 font-semibold">{label}</td>
                  {SCEN.map((s) => <td key={s.id} className={`text-center ${s.id === "likely" ? "font-bold text-[#5FA8A2]" : ""}`}>{f(s.id)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-2 text-xs md:grid-cols-2 xl:grid-cols-4">
          {[
            ["safe", ["15 đơn, +5%/tháng", "Mix 40/45/15%, chưa bán món thêm", "In 6k/tờ, bìa 50k, lỗi 5%", "CAC 75k, thuế 1,5%", "Trả trước 55%, không nợ"]],
            ["likely", ["30 đơn, +12%/tháng", "Mix 30/50/20%, chưa bán món thêm", "In 4,5k/tờ, bìa 42k, lỗi 3%", "CAC 55k, định phí 2,5tr", "Trả trước 60%, nợ 7 ngày"]],
            ["base", ["60 đơn, +18%/tháng", "Mix 25/50/25%, món thêm 15%", "In 4k/tờ, bìa 38k", "CAC 45k", "Trả trước 65%, nợ 15 ngày"]],
            ["opt", ["100 đơn, +25%/tháng", "Mix 20/50/30%, món thêm 25%", "In 3,5k/tờ, bìa 35k", "CAC 35k", "Trả trước 70%, nợ 30 ngày"]],
          ].map(([id, list]) => {
            const s = SCEN.find((x) => x.id === id);
            return (
              <div key={id} className="rounded-xl border p-3" style={{ borderColor: `${s.color}55` }}>
                <div className="mb-1.5 font-bold" style={{ color: s.color }}>{s.name}</div>
                <div className="flex flex-wrap gap-1.5">{list.map((x) => <Pill key={x} color={s.color}>{x}</Pill>)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <details className="rounded-2xl border border-[#E4E4E2] bg-white p-4 text-sm">
        <summary className="cursor-pointer font-bold text-[#2E2E2E]">Giả định phân phối (thấp nhất / dễ xảy ra nhất / cao nhất)</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13px] tabular-nums">
            <thead><tr className="text-xs text-[#6B6B69]"><th className="py-1 text-left">Yếu tố</th><th>Thấp</th><th>Dễ xảy ra nhất</th><th>Cao</th></tr></thead>
            <tbody>
              {DIST.map((d) => (
                <tr key={d.key} className="border-t border-[#EFEFEE]"><td className="py-1.5 font-semibold">{d.name}</td><td className="text-center">{d.f(d.a)}</td><td className="text-center font-bold text-[#5FA8A2]">{d.f(d.m)}</td><td className="text-center">{d.f(d.b)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-[#6B6B69]">Phân phối tam giác, {N_RUNS.toLocaleString("vi-VN")} lần chạy, 12 tháng. Mỗi tháng thêm nhiễu nhu cầu ±25% và mùa vụ. Giá 3 gói 259/299/349k trừ đi mức giảm giá ngẫu nhiên. Cố định: trả trước 60% (cọc 50% + một phần khách trả đủ), phân bổ vốn thận trọng, trần 150 đơn/tháng, trên 120 đơn/tháng tốn thêm 15k/đơn thuê CTV. Chưa tính lương của bạn. Đây là giả định để ra quyết định — cập nhật bằng số thật sau 4–6 tuần bán.</div>
        </div>
      </details>
    </div>
  );
}

/* =========================================================
   TAB 3 — THỊ TRƯỜNG & ĐỐI THỦ
   ========================================================= */
const FUNNEL = [
  { name: "Dân số VN", v: "~101 triệu", w: 100 },
  { name: "18–30 tuổi", v: "~19 triệu", w: 72 },
  { name: "Đang yêu", v: "~3,8 triệu cặp", w: 52 },
  { name: "Đô thị, mua online, chi ≥ 300k (SAM)", v: "~1,3 triệu cặp", w: 36 },
  { name: "Mục tiêu năm 1 (SOM)", v: "~1.800 cuốn", w: 12 },
];

const SEASON = [
  { m: "T1", v: 70, e: "Trước Tết" }, { m: "T2", v: 165, e: "Valentine" }, { m: "T3", v: 120, e: "8/3, 14/3" },
  { m: "T4", v: 70, e: "Thấp điểm" }, { m: "T5", v: 85, e: "Sau 30/4" }, { m: "T6", v: 80, e: "Tốt nghiệp" },
  { m: "T7", v: 80, e: "Du lịch hè" }, { m: "T8", v: 100, e: "Thất Tịch" }, { m: "T9", v: 85, e: "Sau hè" },
  { m: "T10", v: 135, e: "20/10" }, { m: "T11", v: 95, e: "Chuẩn bị Noel" }, { m: "T12", v: 150, e: "Noel" },
];

const COMPETITORS = [
  { key: "me", short: "Our Archive", name: "Our Archive", price: "259 · 299 · 349k", x: 300, y: 8.6, look: 5, personal: 5, speed: 4, service: 5, gift: 5, weak: "Chưa có thương hiệu" },
  { key: "trad", short: "Truyền thống", name: "Photobook truyền thống (Artclick, Colorbook…)", price: "~400–500k (20×20); studio HN 469–670k (20 trang)", x: 520, y: 5.5, look: 3, personal: 3, speed: 3, service: 2, gift: 2, weak: "Giống album gia đình" },
  { key: "genz", short: "Báo Gen Z", name: "Báo/ảnh kỷ niệm Gen Z (IG, Shopee)", price: "~79–199k", x: 140, y: 4.2, look: 2, personal: 4, speed: 5, service: 3, gift: 1, weak: "Rẻ, mỏng, không giữ lâu" },
  { key: "hand", short: "Handmade", name: "Quà handmade / scrapbook", price: "~250–600k", x: 420, y: 7.0, look: 3, personal: 5, speed: 2, service: 4, gift: 4, weak: "Không mở rộng được" },
  { key: "pixory", short: "Pixory", name: "Pixory (nước ngoài)", price: "> 1 triệu + ship quốc tế", x: 1100, y: 9.2, look: 5, personal: 4, speed: 1, service: 2, gift: 4, weak: "Đắt, ship lâu" },
];
const CRIT = [["look", "Thẩm mỹ"], ["personal", "Cá nhân hóa"], ["speed", "Tốc độ"], ["service", "Làm hộ A–Z"], ["gift", "Bao bì quà"]];

function Rating({ v, hl }) {
  return (
    <div className="flex justify-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: i <= v ? (hl ? C.burgundy : C.gold) : C.beige }} />)}
    </div>
  );
}

function MarketTab() {
  const scatter = COMPETITORS.map((c) => ({ ...c, x: Math.min(c.x, 1200) }));
  return (
    <div className="space-y-5">
      <Title n="04" title="Thị trường & Đối thủ" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Quy mô thị trường (ước tính)" icon={Target}>
          <div className="space-y-2.5">
            {FUNNEL.map((f, i) => (
              <div key={f.name} className="flex items-center gap-3">
                <div className="w-44 shrink-0 text-[13px] font-semibold">{f.name}</div>
                <div className="flex-1">
                  <div className="flex h-7 items-center rounded-lg px-2 text-xs font-bold text-white" style={{ width: `${f.w}%`, minWidth: 92, background: i === 4 ? C.gold : C.burgundy, opacity: 1 - i * 0.12 }}>{f.v}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="SAM / năm" value="~390 tỷ" />
            <Stat label="SOM năm 1" value="~0,6 tỷ" />
            <Stat label="Thị phần cần" value="0,14%" tone="good" />
          </div>
        </Card>

        <Card title="Mùa vụ (100 = tháng trung bình)" icon={Calendar}>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SEASON} margin={{ top: 22, right: 6, left: -18 }}>
                <CartesianGrid stroke="#EFEFEE" vertical={false} />
                <XAxis dataKey="m" tick={axis} />
                <YAxis tick={axis} />
                <Tooltip {...tip} formatter={(v, n, it) => [`${v} · ${it.payload.e}`, "Chỉ số"]} />
                <ReferenceLine y={100} stroke={C.gold} strokeDasharray="4 4" />
                <Bar isAnimationActive={false} dataKey="v" radius={[6, 6, 0, 0]}>
                  {SEASON.map((s) => <Cell key={s.m} fill={s.v >= 120 ? C.burgundy : C.rose} />)}
                  <LabelList dataKey="e" position="top" style={{ fontSize: 9, fill: C.muted, fontFamily: FONT }} formatter={(v) => (["Valentine", "20/10", "Noel", "8/3, 14/3"].includes(v) ? v : "")} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#F8E6E6] p-2.5 text-[13px] font-semibold text-[#2E2E2E]">
            <AlertTriangle className="h-4 w-4 shrink-0" />Tết 6/2/2027 → Valentine chỉ cách 8 ngày → chốt lô trước 25/1
          </div>
        </Card>
      </div>

      <Card title="Dịch chuyển hành vi" icon={ArrowRight}>
        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="grid grid-cols-2 gap-2">
            {[["Album cưới 30×30", "2–4kg"], ["Vài triệu đồng", "1 lần trong đời"], ["Ảnh studio", "Ít câu chuyện"], ["Cất trong tủ", "Không khoe"]].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-[#F5F5F4] p-3 text-center"><div className="text-sm font-bold text-[#6B6B69]">{a}</div><div className="text-xs text-[#6B6B69]">{b}</div></div>
            ))}
          </div>
          <ArrowRight className="mx-auto h-8 w-8 rotate-90 text-[#DDA543] md:rotate-0" />
          <div className="grid grid-cols-2 gap-2">
            {[["Sách A5 / 15×15", "Nhỏ, xinh"], ["250–400k", "Nhiều dịp/năm"], ["Ảnh điện thoại", "Photobooth, film"], ["Unboxing", "Lên story"]].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-[#2E2E2E] p-3 text-center text-white"><div className="text-sm font-bold">{a}</div><div className="text-xs text-white/75">{b}</div></div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Bản đồ định vị" icon={Sparkles}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 24, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#EFEFEE" />
                <XAxis type="number" dataKey="x" domain={[0, 1200]} tick={axis} tickFormatter={(v) => `${v}k`} label={{ value: "Giá", position: "insideBottom", offset: -10, fontSize: 11, fill: C.muted }} />
                <YAxis type="number" dataKey="y" domain={[0, 10]} tick={axis} width={30} label={{ value: "Thẩm mỹ", angle: -90, position: "insideLeft", fontSize: 11, fill: C.muted }} />
                <ZAxis range={[220, 220]} />
                <ReferenceArea x1={250} x2={400} y1={7.5} y2={10} fill={C.gold} fillOpacity={0.18} stroke={C.gold} strokeDasharray="4 4" label={{ value: "Blue Ocean", position: "insideBottom", fontSize: 11, fill: C.gold, fontWeight: 700 }} />
                <Tooltip {...tip} content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return <div className="rounded-xl border border-[#E4E4E2] bg-white p-2 text-xs"><b>{d.name}</b><div>{d.price}</div></div>;
                }} />
                <Scatter isAnimationActive={false} data={scatter}>
                  {scatter.map((c) => <Cell key={c.key} fill={c.key === "me" ? C.burgundy : C.muted} />)}
                  <LabelList dataKey="short" position="top" style={{ fontSize: 11, fill: C.ink, fontWeight: 600, fontFamily: FONT }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Khoảng trống ở mức 300k" icon={Target}>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Loại bỏ", "Phần mềm phức tạp, khổ lớn", C.muted],
              ["Giảm", "Số trang, kích thước, thời gian chờ", C.rose],
              ["Tăng", "Typography tạp chí, chữ gáy, bao bì", C.gold],
              ["Tạo mới", "Mẫu theo lễ VN, gói 72h, series", C.burgundy],
            ].map(([a, b, col]) => (
              <div key={a} className="rounded-xl p-3" style={{ background: `${col}18` }}>
                <div className="text-sm font-extrabold" style={{ color: col }}>{a}</div>
                <div className="mt-1 text-xs">{b}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-[#2E2E2E] p-3 text-center text-sm font-bold text-white">
            Thẩm mỹ Pixory × Tốc độ tiệm Gen Z × Làm hộ như handmade = giá một bó hoa
          </div>
        </Card>
      </div>

      <Card title="So sánh đối thủ" icon={Layers}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b-2 border-[#E4E4E2]">
                <th className="w-40 py-2 text-left text-xs text-[#6B6B69]">Tiêu chí</th>
                {COMPETITORS.map((c) => <th key={c.key} className={`px-2 py-2 text-[13px] font-bold ${c.key === "me" ? "rounded-t-lg bg-[#2E2E2E] text-white" : ""}`}>{c.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#EFEFEE]">
                <td className="py-2.5 font-semibold">Giá</td>
                {COMPETITORS.map((c) => <td key={c.key} className={`px-2 text-center text-[13px] font-bold ${c.key === "me" ? "bg-[#F5F5F4] text-[#2E2E2E]" : ""}`}>{c.price}</td>)}
              </tr>
              {CRIT.map(([f, label]) => (
                <tr key={f} className="border-b border-[#EFEFEE]">
                  <td className="py-2.5 font-semibold">{label}</td>
                  {COMPETITORS.map((c) => <td key={c.key} className={c.key === "me" ? "bg-[#F5F5F4]" : ""}><Rating v={c[f]} hl={c.key === "me"} /></td>)}
                </tr>
              ))}
              <tr>
                <td className="py-2.5 font-semibold">Điểm yếu</td>
                {COMPETITORS.map((c) => <td key={c.key} className={`px-2 text-center text-xs ${c.key === "me" ? "bg-[#F5F5F4]" : "text-[#6B6B69]"}`}>{c.weak}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[11px] text-[#6B6B69]">Giá Artclick theo artclick.vn; studio Hà Nội theo bảng giá công bố (14×14 469k, 20×20 670k, 20 trang); các mức còn lại và điểm chấm là ước tính — kiểm chứng bằng cách hỏi giá trong Tuần 1.</div>
      </Card>
    </div>
  );
}

/* =========================================================
   TAB 4 — KHÁCH HÀNG
   ========================================================= */
const PERSONAS = [
  {
    icon: Heart, name: "Gen Z mới yêu", tag: "Yêu 6 tháng – 2 năm", share: 45, aov: "259–299k", color: C.burgundy,
    quote: "Tình yêu tụi mình cũng xứng được lên tạp chí",
    pains: ["Ảnh rải rác, strip photobooth dễ mất", "Quà cũ đã tặng hết", "Ngân sách 200–400k"],
    triggers: ["100 ngày / 1 năm", "Valentine, 20/10", "Xem video unboxing"],
    product: "Gói 24 hoặc 32 trang",
    upsell: [["Thêm 4 trang thư tay", "+39k"], ["Kẹp strip photobooth", "+19k"], ["Lên gói 32 trang", "+50k"]],
    channel: ["TikTok", "Reels", "Threads"],
  },
  {
    icon: Plane, name: "Travel Lovers", tag: "Hàng trăm ảnh du lịch", share: 30, aov: "299–349k", color: C.gold,
    quote: "Đi về là thôi, ảnh chết trong camera roll",
    pains: ["Không có thời gian lọc 800 ảnh", "Màu ảnh lệch nhau", "Photobook cũ to, nặng"],
    triggers: ["2 tuần sau chuyến đi", "Chuyến đi đầu tiên", "Tổng kết năm"],
    product: "Gói 40 trang · mẫu Xê Dịch",
    upsell: [["Lọc ảnh hộ", "+40k"], ["Thêm 4 trang", "+39k"], ["Cuốn thứ 2", "−15%"]],
    channel: ["Reels", "TikTok", "Nhóm du lịch"],
  },
  {
    icon: Gift, name: "Nam ‘cứu cánh phút chót’", tag: "Còn 3–7 ngày", share: 25, aov: "349–460k", color: C.rose,
    quote: "Không cần rẻ, cần chắc cô ấy thích",
    pains: ["Sợ không kịp ngày", "Không biết thiết kế", "Không biết viết lời ngọt"],
    triggers: ["Lịch nhắc kỷ niệm", "Người yêu từng thả tim", "Tìm ‘quà kỷ niệm’"],
    product: "Gói 40 trang có hộp + làm gấp",
    upsell: [["Làm gấp 72h", "+59k"], ["Viết hộ lời tựa", "Có sẵn"], ["Hoa khô + nến", "+49k"]],
    channel: ["TikTok Search", "Google", "Zalo"],
  },
];

const JOURNEY = [
  { stage: "Thấy", icon: Film, kpi: "Xem hết > 25%" },
  { stage: "Quan tâm", icon: Heart, kpi: "Lưu video ≥ 2%" },
  { stage: "Hỏi giá", icon: MessageCircle, kpi: "Trả lời < 10 phút" },
  { stage: "Mua", icon: Wallet, kpi: "Chốt ≥ 30%" },
  { stage: "Nhận", icon: Gift, kpi: "Gửi UGC ≥ 15%" },
  { stage: "Giới thiệu", icon: Users, kpi: "Mua lại ≥ 20%" },
];

function PersonaTab() {
  return (
    <div className="space-y-5">
      <Title n="05" title="Khách hàng" />
      <div className="grid gap-5 xl:grid-cols-3">
        {PERSONAS.map((p) => (
          <div key={p.name} className="overflow-hidden rounded-2xl border border-[#E4E4E2] bg-white">
            <div className="p-4 text-white" style={{ background: p.color }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-white/80"><p.icon className="h-4 w-4" />{p.tag}</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">{p.share}% DT</span>
              </div>
              <div className="mt-1 text-xl font-extrabold">{p.name}</div>
              <div className="mt-1 text-sm font-semibold">AOV {p.aov}</div>
            </div>
            <div className="space-y-3 p-4">
              <div className="rounded-xl bg-[#F5F5F4] p-3 text-center text-sm font-semibold italic">“{p.quote}”</div>
              <div>
                <div className="mb-1 text-xs font-bold text-[#2E2E2E]">Nỗi đau</div>
                {p.pains.map((x) => <div key={x} className="flex items-center gap-2 py-0.5 text-[13px]"><span className="text-[#E8798A]">✕</span>{x}</div>)}
              </div>
              <div>
                <div className="mb-1 text-xs font-bold text-[#2E2E2E]">Xuống tiền khi</div>
                <div className="flex flex-wrap gap-1.5">{p.triggers.map((x) => <Pill key={x} color={C.gold}>{x}</Pill>)}</div>
              </div>
              <div>
                <div className="mb-1 text-xs font-bold text-[#2E2E2E]">Upsell</div>
                {p.upsell.map(([a, b]) => (
                  <div key={a} className="flex items-center justify-between border-b border-dashed border-[#E4E4E2] py-1 text-[13px]"><span>{a}</span><b className="text-[#2E2E2E]">{b}</b></div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-semibold">{p.product}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">{p.channel.map((x) => <Pill key={x} color={C.muted}>{x}</Pill>)}</div>
            </div>
          </div>
        ))}
      </div>

      <Card title="Hành trình mua" icon={ArrowRight}>
        <div className="flex flex-wrap items-stretch justify-between gap-2">
          {JOURNEY.map((j, i) => (
            <React.Fragment key={j.stage}>
              <div className="min-w-[120px] flex-1 rounded-xl bg-[#F5F5F4] p-3 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#2E2E2E] text-white"><j.icon className="h-5 w-5" /></span>
                <div className="mt-2 text-sm font-bold">{j.stage}</div>
                <div className="mt-1 text-[11px] font-semibold text-[#6E9A52]">{j.kpi}</div>
              </div>
              {i < JOURNEY.length - 1 && <ArrowRight className="hidden h-5 w-5 self-center text-[#DDA543] xl:block" />}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   TAB 5 — SẢN PHẨM & VẬN HÀNH
   ========================================================= */
const PRODUCT_COVERS = [
  { title: "Bốn Khung Hình", sub: "24 trang", spine: "MINH & AN · 24", bg: "#2E2E2E", fg: "#F5F5F4", accent: "#E8798A", motif: "strip" },
  { title: "Chuyện Hai Đứa", sub: "32 trang", spine: "MINH & AN · 2026", bg: "#2E2E2E", fg: "#F5F5F4", accent: "#DDA543", motif: "lines" },
  { title: "365 Ngày Thương", sub: "40 trang + hộp", spine: "365 NGÀY · 2026", bg: "#EFEFEE", fg: "#111111", accent: "#2E2E2E", motif: "big" },
];
const ADDONS = [
  ["Thêm 4 trang (4–5 ảnh)", "+39k", "~5k"],
  ["Hộp quà nam châm + nơ (gói 24/32)", "+99k", "~30k"],
  ["Làm gấp 72h", "+59k", "0"],
  ["Lọc ảnh hộ (gửi cả album)", "+40k", "0"],
  ["Kẹp dải photobooth in lại", "+19k", "~3k"],
  ["Viết hộ lời tựa (gói 24)", "+29k", "0"],
];
const HN_PRICES = [
  ["In màu A3 Ford/Couche (lẻ)", "4.000–9.000đ/tờ", "Bảng giá in màu Hà Nội"],
  ["In màu A3 couche", "2.000–7.000đ/tờ", "In Hoa Hồng"],
  ["In KTS sỉ cho đối tác (chưa gồm giấy)", "1.800đ/mặt A3", "SV Print"],
  ["Đóng sách bìa cứng A4", "Từ 30.000đ/quyển", "In Thiên Hằng"],
  ["Photobook 15×20 trọn gói", "185.000đ + 5.000đ/trang", "In Hoa Hồng"],
  ["Photobook bìa cứng 20×20, 20 trang", "Từ 360.000đ", "In Nhanh Thủ Đô"],
  ["Giá bán lẻ studio 14×14 / 20×20", "469.000đ / 670.000đ", "Studio Chụp Ảnh Đẹp"],
];

const COLLECTIONS = [
  { name: "Chuyện Hai Đứa", from: "Romance", best: "Kỷ niệm 1 năm", c: { title: "Chuyện Hai Đứa", sub: "Romance", spine: "CHUYỆN HAI ĐỨA", bg: "#F5F5F4", fg: "#2E2E2E", accent: "#2E2E2E", motif: "lines" } },
  { name: "Xê Dịch", from: "Travel", best: "Travel Lovers", c: { title: "Xê Dịch", sub: "Đà Lạt · 2026", spine: "XÊ DỊCH", bg: "#3F4A3C", fg: "#F3E6D8", accent: "#DDA543", motif: "stamp" } },
  { name: "365 Ngày Thương", from: "Anniversary", best: "100 ngày / 1 năm", c: { title: "365 Ngày Thương", sub: "Anniversary", spine: "365 NGÀY", bg: "#EFEFEE", fg: "#111111", accent: "#2E2E2E", motif: "big" } },
  { name: "Bốn Khung Hình", from: "Photobooth", best: "Gen Z", c: { title: "Bốn Khung Hình", sub: "Photobooth", spine: "BỐN KHUNG HÌNH", bg: "#2E2E2E", fg: "#F5F5F4", accent: "#E8798A", motif: "strip" } },
  { name: "ĐÔI TA Magazine", from: "Magazine", best: "Sinh nhật", c: { title: "Số Đặc Biệt", sub: "Phỏng vấn độc quyền", spine: "ĐÔI TA · 01", bg: "#F3E6D8", fg: "#2E2E2E", accent: "#2E2E2E", motif: "masthead" } },
  { name: "Thư Tay", from: "Love Letters", best: "Bạn nam", c: { title: "Thư Tay", sub: "Gửi em", spine: "THƯ TAY", bg: "#C9AE8A", fg: "#3A2A22", accent: "#111111", motif: "letter" } },
];

const WORKFLOW = [
  { icon: BookOpen, title: "Chọn mẫu", time: "5'" },
  { icon: Camera, title: "Gửi ảnh Zalo/Drive", time: "15'" },
  { icon: Wand2, title: "Dàn trang AI", time: "15'" },
  { icon: Lock, title: "Duyệt + trả trước", time: "≤ 24h" },
  { icon: Printer, title: "Gom lô in", time: "1–2 lô/tuần" },
  { icon: Truck, title: "QC + giao", time: "2–3 ngày" },
];

const NEGOTIATION = [
  ["Lô đều đặn", "1–2 lô cố định/tuần"],
  ["Số trang chia hết cho 4", "24/32/40 trang = 6/8/10 tờ A3+, không phí giấy"],
  ["Giá mục tiêu", "In ≤ 4.500đ/tờ A3+ mỹ thuật · bìa + đóng ≤ 42k · hộp nắp rời ≤ 26k (100 hộp)"],
  ["Công nợ 3 bước", "Trả ngay → 7 ngày → 15–30 ngày"],
  ["Đổi bằng giá trị", "Tag xưởng trong video, giới thiệu khách"],
  ["Xưởng dự phòng", "Luôn có xưởng thứ 2 đã in thử"],
  ["Quy định lỗi", "Lỗi kỹ thuật in lại free trong 48h"],
  ["Đúng máy", "HP Indigo / Konica / Xerox / Fujifilm"],
];

const PRINTER_MSG = `Chào anh/chị, em đang mở thương hiệu photobook quà tặng cặp đôi Our Archive tại Hà Nội, dự kiến 30–100 cuốn/tháng, gửi lô cố định 1–2 lần/tuần.
Quy cách: photobook bìa cứng khổ B5 nhỡ 16,5 × 23,5 cm (thành phẩm), 3 loại 24 / 32 / 40 trang; ruột giấy mỹ thuật 200gsm in 4 màu 2 mặt; bìa cứng bồi carton, cán màng mờ, in chữ trên gáy. File PDF 300ppi, tràn lề 3 mm, có vạch xén.
Em nhờ anh/chị báo giá: (1) in 1 tờ A3+ giấy mỹ thuật 200gsm 4/4 (em tính 4 trang/tờ), (2) bìa cứng + đóng cuốn B5 nhỡ cho từng loại 24/32/40 trang, (3) giá theo bậc 30 / 100 / 200 cuốn/tháng, (4) thời gian hoàn thành mỗi lô, (5) độ dày gáy thực tế của từng loại, (6) hộp cứng nắp rời vừa sách (khoảng 18 × 25 × 4 cm) ở mức 100 / 300 hộp.
Em muốn in thử 3 cuốn mẫu trong tuần này. Sau 2–3 lô đầu thanh toán đúng hạn, em xin được đối soát công nợ 15 ngày. Em cảm ơn ạ!`;

function ProductTab() {
  return (
    <div className="space-y-5">
      <Title n="06" title="Sản phẩm & Vận hành" />
      <div className="grid gap-5 xl:grid-cols-3">
        {tierCalc(PRESETS.likely).map((t, i) => (
          <div key={t.name} className={`rounded-2xl border-2 bg-white p-4 ${t.hero ? "border-[#2E2E2E]" : "border-[#E4E4E2]"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-extrabold">{t.name}</div>
                <Pill color={t.hero ? C.burgundy : C.muted}>{t.hero ? "⭐ " : ""}{t.role}</Pill>
              </div>
              <div className="text-2xl font-extrabold text-[#2E2E2E]">{k(t.price)}</div>
            </div>
            <div className="my-3 rounded-xl bg-[#F5F5F4]"><BookCover {...PRODUCT_COVERS[i]} /></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-[#F5F5F4] p-2"><div className="text-[10px] text-[#6B6B69]">Giá vốn</div><div className="text-sm font-bold">{k(t.cogs)}</div></div>
              <div className="rounded-lg bg-[#DFEEE6] p-2"><div className="text-[10px] text-[#6B6B69]">Biên gộp</div><div className="text-sm font-bold text-[#2F6B3A]">{pct(t.gm, 0)}</div></div>
              <div className="rounded-lg bg-[#F5F5F4] p-2"><div className="text-[10px] text-[#6B6B69]">Lãi/đơn</div><div className="text-sm font-bold">{k(t.contrib)}</div></div>
            </div>
            <div className="mt-3 space-y-1 text-[13px]">
              {[["Khổ", "B5 nhỡ 16,5 × 23,5 cm"], ["Trang · ảnh", `${t.pages} trang · ${t.photos}`], ["Ruột", `Mỹ thuật 200gsm · ${t.sheets} tờ A3+`], ["Bìa", "Cứng, bồi carton, cán mờ"], ["Chữ trên gáy", "Có"], ["Kèm theo", t.incl]].map(([a, b]) => (
                <div key={a} className="flex justify-between gap-2 border-b border-[#EFEFEE] py-1"><span className="text-[#6B6B69]">{a}</span><span className="text-right font-semibold">{b}</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Món bán thêm" icon={Sparkles}>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-[#6B6B69]"><th className="py-1">Món</th><th className="text-right">Giá bán</th><th className="text-right">Giá vốn</th></tr></thead>
            <tbody>
              {ADDONS.map(([a, b, c]) => (
                <tr key={a} className="border-t border-[#EFEFEE]"><td className="py-2">{a}</td><td className="text-right font-bold text-[#2E2E2E]">{b}</td><td className="text-right text-[#6B6B69]">{c}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Giá in tham khảo · Hà Nội" icon={Printer} right={<Pill color={C.muted}>Giá lẻ công bố</Pill>}>
          <table className="w-full text-sm">
            <tbody>
              {HN_PRICES.map(([a, b, c]) => (
                <tr key={a} className="border-t border-[#EFEFEE] first:border-0"><td className="py-2 pr-2">{a}<div className="text-[11px] text-[#6B6B69]">{c}</div></td><td className="whitespace-nowrap text-right font-bold">{b}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-[#6B6B69]">Mô hình dùng 4,5k/tờ A3+ mỹ thuật 200gsm và 42k bìa cứng + đóng cuốn. Chi tiết nguồn ở tab “Chi phí & báo giá”. Xác nhận bằng báo giá 3 xưởng.</div>
        </Card>
      </div>

      <Card title="6 bộ sưu tập" icon={BookOpen}>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {COLLECTIONS.map((c, i) => (
            <div key={c.name} className="rounded-xl bg-[#F5F5F4] p-2 text-center">
              <BookCover {...c.c} size={i % 2 ? "sq" : "a5"} />
              <div className="text-sm font-bold">{c.name}</div>
              <div className="text-[11px] text-[#6B6B69]">{c.from}</div>
              <div className="mt-1"><Pill color={C.gold}>{c.best}</Pill></div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Quy trình nhận đơn" icon={Layers} right={<Pill color={C.sage}>Giao 5–7 ngày sau khi khách duyệt</Pill>}>
        <div className="flex flex-wrap items-stretch gap-2">
          {WORKFLOW.map((w, i) => (
            <React.Fragment key={w.title}>
              <div className="min-w-[120px] flex-1 rounded-xl bg-[#F5F5F4] p-3 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#2E2E2E] text-white"><w.icon className="h-5 w-5" /></span>
                <div className="mt-2 text-sm font-bold">{w.title}</div>
                <div className="mt-1"><Pill color={C.gold}>{w.time}</Pill></div>
              </div>
              {i < WORKFLOW.length - 1 && <ArrowRight className="hidden h-5 w-5 self-center text-[#DDA543] xl:block" />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Thao tác / đơn" value="~45 phút" />
          <Stat label="Năng lực 1 người" value="120–150 đơn" sub="mỗi tháng" />
          <Stat label="Lưu ảnh khách" value="Xóa sau 90 ngày" sub="kể từ ngày giao" tone="good" />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Đàm phán xưởng in" icon={Handshake}>
          <div className="grid gap-2 sm:grid-cols-2">
            {NEGOTIATION.map(([t, d], i) => (
              <div key={t} className="flex gap-3 rounded-xl border border-[#E4E4E2] p-3">
                <span className="text-lg font-extrabold text-[#DDA543]">{String(i + 1).padStart(2, "0")}</span>
                <div><div className="text-sm font-bold">{t}</div><div className="text-xs text-[#6B6B69]">{d}</div></div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Tin nhắn xin báo giá" icon={MessageCircle} right={<CopyBtn text={PRINTER_MSG} label="Chép tin nhắn" />}>
          <pre className="whitespace-pre-wrap rounded-xl bg-[#F5F5F4] p-3 text-xs leading-relaxed" style={{ fontFamily: FONT }}>{PRINTER_MSG}</pre>
        </Card>
      </div>
    </div>
  );
}

/* =========================================================
   30 KỊCH BẢN VIDEO
   ========================================================= */

const SC = { burgundy: "#2E2E2E", wine: "#111111", rose: "#E8798A", gold: "#DDA543", ink: "#2E2E2E", muted: "#6B6B69", sage: "#6E9A52", slate: "#9A88C8", taupe: "#C08A68" };

const FORMAT_COLORS = {
  "Biến đổi": SC.burgundy, "Cảm xúc": SC.rose, "Hài": SC.gold, "Kể chuyện": SC.wine, ASMR: SC.taupe, "Niềm tin": SC.slate,
  "Quy trình": SC.sage, "So sánh": SC.taupe, "Dịch vụ": SC.sage, "Khẩn cấp": "#C9443A", Reaction: SC.rose, "Du lịch": "#3F4A3C",
  "Giá trị": SC.gold, "Sưu tầm": SC.wine,
};
const PERSONA = { genz: ["Gen Z mới yêu", SC.burgundy], travel: ["Travel Lovers", SC.gold], nam: ["Nam phút chót", SC.rose], all: ["Mọi cặp đôi", SC.muted] };
const PHASES = [
  { id: 1, name: "Nhận biết", range: "Ngày 1–10", color: SC.burgundy },
  { id: 2, name: "Niềm tin & mở pre-order", range: "Ngày 11–20", color: SC.gold },
  { id: 3, name: "Chốt đơn", range: "Ngày 21–30", color: SC.sage },
];

const STYLE_PROMPT =
  "Vertical 9:16 video, 5–8 seconds per clip. Warm cream and burgundy color palette, soft natural window light, subtle 35mm film grain, shallow depth of field, candid documentary feel, handheld but steady. Vietnamese young adults in their early twenties, casual modern clothing, natural makeup. No text, no subtitles, no logos, no brand names, no books or photo albums visible in frame.";

/* k: "AI" = AI dựng được · "THẬT" = bắt buộc quay sách/màn hình thật */
const SCRIPTS = [
  {
    title: "2.847 ảnh chưa từng mở lại", persona: "genz", format: "Biến đổi",
    insight: "Ảnh của hai đứa nhiều vô kể nhưng chẳng ai mở lại — kỷ niệm đang “chết” trong máy.",
    hook: "2.847 ảnh của tụi mình… và chưa từng mở lại tấm nào",
    shots: [
      { t: "0–3s", k: "THẬT", d: "Quay màn hình cuộn thật nhanh thư viện ảnh, số ảnh hiện góc trên." },
      { t: "3–6s", k: "AI", d: "Cặp đôi ngồi cạnh nhau, mỗi người lướt điện thoại riêng, không nhìn nhau.", p: "A young Vietnamese couple sitting side by side on a sofa at night, both silently scrolling their own phones, faces lit by the screens, not looking at each other, cozy apartment with a warm lamp in the background." },
      { t: "6–14s", k: "THẬT", d: "Tay đặt cuốn sách lên bàn gỗ, lật nhanh các trang đầy ảnh." },
      { t: "14–18s", k: "THẬT", d: "Cận một trang có ảnh + chú thích ngày tháng." },
    ],
    vo: "Không lời — chỉ chữ trên màn hình. Giây 6: “Thử in ra một lần xem?”",
    audio: "Lo-fi nhẹ, cắt cứng đúng lúc cuốn sách xuất hiện ở giây 6.",
    cta: "Lưu lại để nhớ in ảnh cho người ấy",
    caption: "Ảnh không in ra thì chỉ là dữ liệu 📱→📖 #photobook #quatangnguoiyeu #kyniem",
  },
  {
    title: "Dải photobooth đầu tiên giờ ra sao", persona: "genz", format: "Biến đổi",
    insight: "Ảnh photobooth dán tủ lạnh, kẹp ví — sau vài tháng quăn mép, bay màu, thất lạc.",
    hook: "Dải ảnh photobooth đầu tiên của tụi mình giờ trông thế này…",
    shots: [
      { t: "0–3s", k: "THẬT", d: "Dải ảnh cũ quăn mép, phai màu dính trên cửa tủ lạnh." },
      { t: "3–7s", k: "AI", d: "Cặp đôi cười, làm mặt xấu trong buồng photobooth, đèn flash nháy.", p: "Inside a photo booth, a young Vietnamese couple laughing and making silly faces, bright camera flash bursts, booth curtain behind them, playful mood." },
      { t: "7–15s", k: "THẬT", d: "Lật tới trang mẫu “Bốn Khung Hình” có dải ảnh in lại sắc nét." },
      { t: "15–18s", k: "THẬT", d: "Đặt dải ảnh cũ cạnh trang sách để so sánh." },
    ],
    vo: "Chữ: “Trước” / “Sau”.",
    audio: "Tiếng flash photobooth “tách tách” + nhạc vui nhịp nhanh.",
    cta: "Bạn còn giữ được bao nhiêu dải photobooth?",
    caption: "Photobooth thì đầy, giữ được thì ít 📸 #photobooth #couple #photobook",
  },
  {
    title: "Người cầm máy không có ảnh", persona: "genz", format: "Cảm xúc",
    insight: "Người hay chụp cho người kia nhất lại là người có ít ảnh của mình nhất.",
    hook: "Cô ấy chụp cho mình 500 tấm. Mình chụp cho cô ấy… 12 tấm.",
    shots: [
      { t: "0–4s", k: "AI", d: "Bạn gái giơ điện thoại chụp bạn trai ở quán cà phê, anh tạo dáng vụng về.", p: "A young Vietnamese woman holding up her phone, taking photos of her boyfriend at a sunny cafe table, he poses awkwardly and laughs." },
      { t: "4–7s", k: "THẬT", d: "Quay màn hình album “Ảnh của em” chỉ có vài tấm." },
      { t: "7–12s", k: "AI", d: "Bạn trai lóng ngóng chụp bạn gái bên cửa sổ, cô bật cười.", p: "A young Vietnamese man clumsily photographing his girlfriend by a bright window, she covers her face and laughs, candid and sweet." },
      { t: "12–20s", k: "THẬT", d: "Lật cuốn sách toàn ảnh của cô ấy, trang bìa “Ảnh anh chụp em”." },
    ],
    vo: "“Năm nay mình gom hết 12 tấm đó, chụp thêm cả trăm tấm nữa — để cô ấy có một cuốn sách toàn là cô ấy.”",
    audio: "Piano nhẹ, ấm.",
    cta: "Tag người hay cầm máy cho bạn",
    caption: "Người chụp đẹp nhất thường không có ảnh của mình 🤍 #nguoiyeu #quatang #photobook",
  },
  {
    title: "Không phải ảnh sống ảo", persona: "genz", format: "Cảm xúc",
    insight: "Thứ đáng nhớ nhất không phải ảnh sống ảo mà là những khoảnh khắc đời thường.",
    hook: "Không phải ảnh đi Đà Lạt. Đây mới là những trang tụi mình thích nhất.",
    shots: [
      { t: "0–3s", k: "AI", d: "2h sáng, hai đứa ăn mì gói trong bếp nhỏ.", p: "A young Vietnamese couple eating instant noodles at 2am in a tiny kitchen, messy hair, laughing, warm overhead light." },
      { t: "3–6s", k: "AI", d: "Ngủ gật tựa vai nhau trên xe buýt.", p: "A young Vietnamese couple dozing off on each other's shoulder on a city bus, afternoon light flickering through the window." },
      { t: "6–9s", k: "AI", d: "Trú mưa dưới mái hiên phố Hà Nội, cười.", p: "A young Vietnamese couple sheltering from heavy rain under a shop awning on a Hanoi street, laughing, wet hair, cinematic." },
      { t: "9–18s", k: "THẬT", d: "Lật các trang có đúng những ảnh đời thường đó + chú thích hài." },
    ],
    vo: "Chữ từng cảnh: “2h sáng, mì gói” · “Ngủ quên trên xe 08” · “Mắc mưa lần thứ 7”.",
    audio: "Nhạc indie Việt nhẹ (dùng nhạc có bản quyền thương mại trên nền tảng).",
    cta: "Ảnh đời thường nào của hai bạn đáng in nhất?",
    caption: "Ảnh đẹp nhất là ảnh không cần đẹp ✨ #doithuong #couple #photobook",
  },
  {
    title: "Ảnh dìm thành ảnh bìa", persona: "genz", format: "Hài",
    insight: "Ảnh dìm người yêu là kho báu — vừa hài vừa thân mật.",
    hook: "Bạn trai chụp mình xấu nhất có thể… nên mình in nó lên bìa.",
    shots: [
      { t: "0–4s", k: "AI", d: "Cô gái tạo dáng sang chảnh ở công viên, bạn trai ngồi xổm chụp góc thấp “dìm hàng”.", p: "Comedic scene: a young Vietnamese woman posing elegantly in a park, her boyfriend crouching awkwardly to shoot from a very low unflattering angle, she frowns playfully." },
      { t: "4–7s", k: "THẬT", d: "Quay màn hình loạt ảnh xấu trong máy." },
      { t: "7–14s", k: "THẬT", d: "Bìa tạp chí “ĐÔI TA” in đúng ảnh dìm + tít “Sự cố thời trang của năm”." },
      { t: "14–18s", k: "AI", d: "Cô gái giả vờ giận, đánh yêu bạn trai.", p: "A young Vietnamese woman pretending to be angry, playfully hitting her boyfriend's arm while he laughs, sunny park." },
    ],
    vo: "Không lời, chữ trên màn hình.",
    audio: "Âm thanh trend hài đang thịnh hành.",
    cta: "Tag người chụp bạn xấu nhất",
    caption: "Ảnh dìm cũng xứng đáng lên bìa 😤📸 #anhdim #nguoiyeu #tapchi",
  },
  {
    title: "Story biến mất sau 24h", persona: "genz", format: "Cảm xúc",
    insight: "Đăng story về nhau rất nhiều nhưng 24h sau chẳng còn gì.",
    hook: "Story về nhau đăng 300 cái. Còn lại: 0.",
    shots: [
      { t: "0–3s", k: "THẬT", d: "Đồ họa thanh tiến trình story chạy hết rồi biến mất." },
      { t: "3–8s", k: "AI", d: "Cặp đôi selfie đăng story trên sân thượng lúc hoàng hôn.", p: "A young Vietnamese couple taking a selfie on a rooftop at sunset, golden light, holding the phone up, playful expressions." },
      { t: "8–16s", k: "THẬT", d: "Gấp sách lại, cận gáy in tên hai người." },
    ],
    vo: "“Mọi thứ trên mạng đều biến mất sau 24 giờ. Thứ này thì không.”",
    audio: "Nhạc chậm, tiếng đóng sách ở cuối.",
    cta: "Lưu video này cho lần kỷ niệm tới",
    caption: "24h vs mãi mãi ⏳ #story #kyniem #photobook",
  },
  {
    title: "Hôm nay là ngày gì?", persona: "all", format: "Hài",
    insight: "Con gái nhớ mọi cột mốc, con trai hay quên — và sợ bị hỏi.",
    hook: "Cô ấy: “Hôm nay là ngày gì?” · Anh ấy: …",
    shots: [
      { t: "0–3s", k: "AI", d: "Bạn gái khoanh tay hỏi.", p: "Comedy sketch: a young Vietnamese woman with arms crossed asking her boyfriend a question in a cozy living room, raised eyebrow." },
      { t: "3–7s", k: "AI", d: "Bạn trai đứng hình, mắt đảo liên tục, toát mồ hôi.", p: "A young Vietnamese man freezing in panic, eyes darting, sweating nervously, comedic close-up." },
      { t: "7–14s", k: "THẬT", d: "Tay anh rút cuốn sách, mở đúng trang timeline có ngày tháng." },
      { t: "14–18s", k: "AI", d: "Cô gái bất ngờ rồi cười.", p: "A young Vietnamese woman's face changing from suspicious to surprised and then smiling warmly, living room light." },
    ],
    vo: "Thoại hiện bằng chữ.",
    audio: "Hiệu ứng “tích tắc” khi anh đứng hình.",
    cta: "Con trai xem để không bao giờ quên ngày nữa",
    caption: "Cứu cánh cho hội hay quên 😅 #kyniem #nguoiyeu #quatang",
  },
  {
    title: "Âm thanh của 365 ngày", persona: "all", format: "ASMR",
    insight: "Cảm giác cầm, lật, chạm vào kỷ niệm là thứ màn hình không thay được.",
    hook: "(Bật tiếng lên)",
    shots: [
      { t: "0–3s", k: "THẬT", d: "Ngón tay vuốt gáy sách in tên." },
      { t: "3–15s", k: "THẬT", d: "Lật chậm 6 trang, góc top-down, ánh sáng cửa sổ." },
      { t: "15–20s", k: "THẬT", d: "Vuốt bề mặt giấy mờ, rồi đóng sách." },
    ],
    vo: "Không lời.",
    audio: "Chỉ tiếng giấy thật thu bằng mic cài — không nhạc.",
    cta: "Caption: “Mẫu Chuyện Hai Đứa — link ở bio”",
    caption: "🔊 #asmr #pageturning #photobook",
  },
  {
    title: "Những lần đầu tiên", persona: "genz", format: "Kể chuyện",
    insight: "Các cặp đôi trẻ trân trọng những “lần đầu” hơn mọi thứ.",
    hook: "Lần đầu nắm tay. Lần đầu cãi nhau. Lần đầu đi xa.",
    shots: [
      { t: "0–3s", k: "AI", d: "Hai bàn tay chạm nhau lần đầu trên bàn cà phê.", p: "Close-up of a young Vietnamese couple's hands touching for the first time on a cafe table, hesitant, soft film look." },
      { t: "3–6s", k: "AI", d: "Giận nhau trên ghế đá rồi làm lành.", p: "A young Vietnamese couple sitting apart on a park bench after a small argument, then one leans in and they make up, gentle evening light." },
      { t: "6–9s", k: "AI", d: "Lên xe khách đi chuyến xa đầu tiên.", p: "A young Vietnamese couple boarding an overnight coach bus with backpacks, excited, early morning." },
      { t: "9–20s", k: "THẬT", d: "Lật trang timeline “Những lần đầu” trong sách." },
    ],
    vo: "Chữ trên từng cảnh + “Tụi mình in hết chúng lại.”",
    audio: "Nhạc acoustic.",
    cta: "Lần đầu nào của hai bạn đáng nhớ nhất?",
    caption: "Lưu giữ những lần đầu 🤍 #landau #couple #photobook",
  },
  {
    title: "Yêu xa 400km", persona: "genz", format: "Cảm xúc",
    insight: "Yêu xa: một thứ cầm được trong tay quý hơn trăm cuộc gọi video.",
    hook: "Yêu xa 400km, hai tháng mới gặp một lần.",
    shots: [
      { t: "0–4s", k: "AI", d: "Gọi video lúc khuya, cô gái cười nhưng hơi buồn.", p: "Late at night, a young Vietnamese woman in a small dorm room on a video call with her boyfriend on a laptop, soft blue screen light, smiling but a little lonely." },
      { t: "4–8s", k: "AI", d: "Chàng trai ở thành phố khác nhìn ra cửa sổ.", p: "A young Vietnamese man alone in a city apartment at night looking out the window at city lights, thoughtful." },
      { t: "8–14s", k: "THẬT", d: "Tay mở gói hàng, lấy cuốn sách ra." },
      { t: "14–20s", k: "THẬT", d: "Trang có bản đồ Hà Nội — Sài Gòn nối hai chấm." },
    ],
    vo: "“Những ngày không gặp được nhau, ít nhất cũng có thứ để cầm.”",
    audio: "Piano buồn nhẹ, chuyển ấm ở giây 8.",
    cta: "Gửi cho người đang yêu xa",
    caption: "400km nhưng vẫn cầm được nhau trong tay 📖 #yeuxa #ldr #quatang",
  },
  {
    title: "Quà kỷ niệm mà không sến", persona: "genz", format: "So sánh",
    insight: "Muốn tặng thứ ý nghĩa nhưng sợ bị chê sến, quê.",
    hook: "Quà kỷ niệm nhưng không sến — trông như một cuốn tạp chí.",
    shots: [
      { t: "0–4s", k: "AI", d: "Không gian quán cà phê tối giản, rót cà phê.", p: "Minimalist cafe interior, coffee being slowly poured into a ceramic cup on a linen tablecloth, morning light, editorial look." },
      { t: "4–12s", k: "THẬT", d: "Flatlay sách cạnh ly cà phê, sách nghệ thuật; lật trang typography." },
      { t: "12–18s", k: "THẬT", d: "Cận bìa tối giản, chữ serif, khoảng trắng." },
    ],
    vo: "Chữ: “Không trái tim. Không chữ vàng. Chỉ có hai bạn.”",
    audio: "Jazz nhẹ.",
    cta: "Xem 6 mẫu ở bio",
    caption: "Lãng mạn kiểu tối giản ☕ #minimalist #couple #coffeetablebook",
  },
  {
    title: "Màn hình vs giấy in", persona: "all", format: "Niềm tin",
    insight: "Nỗi sợ lớn nhất: in ra màu xấu, không giống trên điện thoại.",
    hook: "Trên điện thoại vs khi in ra — bạn đoán được không?",
    shots: [
      { t: "0–5s", k: "THẬT", d: "Chia đôi màn hình: ảnh trên điện thoại | trang sách in." },
      { t: "5–10s", k: "THẬT", d: "Cận màu da và ảnh chụp tối." },
      { t: "10–16s", k: "THẬT", d: "Xoay trang dưới ánh sáng cửa sổ, thấy giấy mờ không lóa." },
    ],
    vo: "“Ảnh tối, ảnh da — tụi mình chỉnh màu từng tấm trước khi in.”",
    audio: "Nhạc nền trung tính.",
    cta: "Comment “màu” để nhận ảnh chụp trang mẫu thật",
    caption: "Không filter, không chỉnh video 🎨 #inanh #photobook #review",
  },
  {
    title: "Từ tin nhắn Zalo đến cuốn sách", persona: "all", format: "Quy trình",
    insight: "Khách nghĩ làm photobook phức tạp, tốn thời gian.",
    hook: "Từ tin nhắn Zalo đến cuốn sách: 15 phút dàn trang.",
    shots: [
      { t: "0–4s", k: "THẬT", d: "Quay màn hình khách gửi ảnh (làm mờ khuôn mặt)." },
      { t: "4–12s", k: "THẬT", d: "Tua nhanh màn hình dàn trang, đồng hồ đếm 15:00." },
      { t: "12–15s", k: "THẬT", d: "Bản xem trước PDF gửi khách." },
      { t: "15–20s", k: "THẬT", d: "Cuốn sách thật vừa in xong." },
    ],
    vo: "“Bạn chỉ cần gửi ảnh và kể ba câu. Phần còn lại để tụi mình.”",
    audio: "Nhạc nhịp nhanh, tiếng tích tắc.",
    cta: "Nhắn “MẪU” để xem mẫu dàn trang",
    caption: "Làm sách nhanh hơn nấu mì ⏱️ #behindthescenes #photobook",
  },
  {
    title: "Kiểm từng trang trước khi gửi", persona: "all", format: "Niềm tin",
    insight: "Đồ cá nhân hóa không đổi trả được → khách sợ nhận hàng lỗi.",
    hook: "Mình kiểm từng trang trước khi gửi cho bạn.",
    shots: [
      { t: "0–4s", k: "THẬT", d: "Máy in kỹ thuật số chạy, giấy ra liên tục." },
      { t: "4–9s", k: "THẬT", d: "Cắt xén, vào keo, bồi bìa cứng." },
      { t: "9–15s", k: "THẬT", d: "Lật kiểm từng trang, tách riêng một cuốn lỗi." },
      { t: "15–18s", k: "THẬT", d: "Gói giấy pelure, dán niêm phong." },
    ],
    vo: "“Lỗi do in — tụi mình in lại miễn phí.”",
    audio: "Âm thanh xưởng in thật + nhạc nhẹ.",
    cta: "Lô đầu tiên mở đặt ngày mai",
    caption: "Một cuốn sách ra đời như thế nào 🏭 #xuongin #handmade #photobook",
  },
  {
    title: "Đã tặng hết quà rồi", persona: "genz", format: "So sánh",
    insight: "Kỷ niệm 1 năm: đã tặng gấu, hoa, son, đồng hồ — hết ý tưởng.",
    hook: "Gấu bông ✓ Hoa ✓ Son ✓ Đồng hồ ✓ … Kỷ niệm 1 năm tặng gì nữa?",
    shots: [
      { t: "0–5s", k: "AI", d: "Flatlay các món quà quen thuộc trên giường.", p: "Top-down flat lay on a white bed: a teddy bear, a bouquet of roses, a lipstick, a wristwatch box, neatly arranged, soft daylight." },
      { t: "5–8s", k: "THẬT", d: "Dấu tick hiện lên từng món (đồ họa CapCut)." },
      { t: "8–18s", k: "THẬT", d: "Hộp quà gói 40 trang mở ra, cuốn sách bên trong." },
    ],
    vo: "Chữ: “Món này thì chưa ai tặng cô ấy.”",
    audio: "Âm thanh trend dạng checklist.",
    cta: "Lô #1 mở đặt hôm nay — 30 suất",
    caption: "Hết ý tưởng quà? 🎁 #quakyniem #1nam #photobook",
  },
  {
    title: "Ngày thứ 7 của bó hoa", persona: "nam", format: "So sánh",
    insight: "Cùng 300k: hoa đẹp vài ngày, thứ khác thì ở lại lâu hơn.",
    hook: "299k: một bó hoa vs một cuốn sách. Ngày thứ 7…",
    shots: [
      { t: "0–6s", k: "AI", d: "Tua nhanh bó hoa tươi héo dần trong 7 ngày.", p: "Time-lapse of a fresh bouquet of pink roses in a glass vase on a windowsill gradually wilting over seven days, soft natural light." },
      { t: "6–14s", k: "THẬT", d: "Cuốn sách trên kệ, chữ “Ngày thứ 365”." },
      { t: "14–18s", k: "THẬT", d: "Tay lấy sách xuống, mở ra." },
    ],
    vo: "“Hoa vẫn đẹp. Nhưng nếu muốn thứ ở lại lâu hơn…”",
    audio: "Nhạc chậm, chuyển sáng ở giây 6.",
    cta: "Lưu lại cho dịp tặng quà tới",
    caption: "Không thay hoa — chỉ thêm một lựa chọn 🌹📖 #quatang #valentine",
  },
  {
    title: "Tin nhắn đầu tiên ở trang 1", persona: "genz", format: "Kể chuyện",
    insight: "Tin nhắn làm quen đầu tiên là khởi đầu câu chuyện mà ai cũng muốn giữ.",
    hook: "Trang đầu tiên trong sách của tụi mình là tin nhắn này.",
    shots: [
      { t: "0–4s", k: "AI", d: "Chàng trai nằm trên giường, gõ rồi xóa tin nhắn.", p: "At night, a young Vietnamese man lying on his bed nervously typing and deleting a message on his phone, phone light on his face." },
      { t: "4–7s", k: "AI", d: "Cô gái mỉm cười nhìn điện thoại.", p: "A young Vietnamese woman on her bed smiling at her phone screen, cozy room, fairy lights." },
      { t: "7–16s", k: "THẬT", d: "Trang 1 in ảnh chụp tin nhắn làm quen (nội dung minh họa)." },
    ],
    vo: "Chữ: “Ai ngờ một chữ ‘Hi’ lại thành 30 trang.”",
    audio: "Tiếng thông báo tin nhắn + nhạc nhẹ.",
    cta: "Tin nhắn đầu tiên của hai bạn là gì?",
    caption: "Mọi chuyện bắt đầu từ một tin nhắn 💬 #crush #couple #photobook",
  },
  {
    title: "Điều con trai không nói thành lời", persona: "nam", format: "Cảm xúc",
    insight: "Nhiều bạn nam thương nhưng không biết nói ra.",
    hook: "Có những điều con trai không nói được thành lời…",
    shots: [
      { t: "0–5s", k: "AI", d: "Bữa tối, chàng trai định nói gì đó rồi thôi, cười ngượng.", p: "A young Vietnamese man at a dinner table opening his mouth to say something to his girlfriend, hesitating, then smiling shyly instead, warm restaurant light." },
      { t: "5–12s", k: "THẬT", d: "Trang cuối: thư tay in trong sách." },
      { t: "12–18s", k: "THẬT", d: "Cô gái đọc thư (người mẫu thật, có đồng ý)." },
    ],
    vo: "“…nên tụi mình để dành một trang cho những điều đó.”",
    audio: "Piano.",
    cta: "Gửi cho anh người yêu ít nói",
    caption: "Trang cuối dành cho những điều chưa nói ✉️ #thutay #nguoiyeu",
  },
  {
    title: "Chuyến đi đầu tiên trong 30 trang", persona: "travel", format: "Du lịch",
    insight: "Chuyến đi đầu tiên cùng nhau là cột mốc lớn nhưng ảnh nằm im trong máy.",
    hook: "Chuyến đi đầu tiên của tụi mình gói gọn trong 30 trang.",
    shots: [
      { t: "0–4s", k: "AI", d: "Xe máy chạy trên đèo rừng thông Đà Lạt, sương sớm.", p: "A young Vietnamese couple riding a motorbike along a winding pine forest road in Da Lat, misty morning, cinematic wide shot." },
      { t: "4–7s", k: "AI", d: "Nắm tay đi giữa đồi thông.", p: "A young Vietnamese couple walking hand in hand among tall pine trees, soft fog, warm sunlight rays." },
      { t: "7–18s", k: "THẬT", d: "Sách mẫu “Xê Dịch”: trang bản đồ hành trình, dấu tem, chú thích địa danh." },
    ],
    vo: "Chữ: “Đà Lạt · 3 ngày 2 đêm · 812 ảnh → 30 trang”.",
    audio: "Nhạc du lịch nhẹ.",
    cta: "Chuyến đi nào của hai bạn chưa được in?",
    caption: "Đi cùng nhau rồi thì in cùng nhau 🏔️ #dalat #dulichcapdoi #photobook",
  },
  {
    title: "Gửi 800 ảnh, nhận 40 tấm đẹp nhất", persona: "travel", format: "Dịch vụ",
    insight: "Travel lovers lười lọc ảnh — họ trả tiền để được lọc hộ.",
    hook: "Gửi shop 800 ảnh. Nhận về 40 tấm đẹp nhất.",
    shots: [
      { t: "0–4s", k: "THẬT", d: "Quay màn hình tải 800 ảnh lên thư mục Drive." },
      { t: "4–8s", k: "AI", d: "Cặp đôi thư giãn trên ghế biển, không bận tâm.", p: "A young Vietnamese couple relaxing on beach loungers in Phu Quoc at sunset, sipping coconuts, carefree and happy." },
      { t: "8–12s", k: "THẬT", d: "Lưới ảnh được chọn lọc, đồng bộ màu." },
      { t: "12–18s", k: "THẬT", d: "Sách hoàn chỉnh." },
    ],
    vo: "“Bạn đi chơi. Phần lọc ảnh để tụi mình.”",
    audio: "Nhạc hè.",
    cta: "Gói lọc ảnh hộ +40k — chỉ việc gửi",
    caption: "Lười lọc ảnh? Gửi hết đây 🌴 #phuquoc #travel #photobook",
  },
  {
    title: "819đ một ngày", persona: "all", format: "Giá trị",
    insight: "Khách so giá rất kỹ — cần khung giá trị dễ hiểu.",
    hook: "299k cho 365 ngày yêu nhau = 819đ một ngày.",
    shots: [
      { t: "0–4s", k: "THẬT", d: "Tay bấm máy tính: 299.000 ÷ 365." },
      { t: "4–10s", k: "AI", d: "Chuỗi khoảnh khắc thường ngày, mỗi cảnh 1 giây.", p: "Fast montage of everyday moments of a young Vietnamese couple, one second each: morning coffee, riding a scooter in traffic, cooking together, watching a movie under a blanket." },
      { t: "10–18s", k: "THẬT", d: "Cuốn sách mở ra đúng những khoảnh khắc đó." },
    ],
    vo: "“Rẻ hơn một ly trà đá mỗi ngày.”",
    audio: "Beat nhanh khớp từng cảnh.",
    cta: "Đặt trước lô #2 — số suất có hạn",
    caption: "Tính ra còn rẻ hơn trà đá 🧮 #quatang #photobook",
  },
  {
    title: "Không biết viết lời ngọt?", persona: "nam", format: "Dịch vụ",
    insight: "Bạn nam muốn tặng quà có lời nhắn nhưng không biết viết.",
    hook: "Không biết viết lời ngọt? Kể shop ba câu là đủ.",
    shots: [
      { t: "0–4s", k: "AI", d: "Chàng trai nhìn trang giấy trắng trên laptop, gãi đầu.", p: "A young Vietnamese man at a desk at night staring at a blank document on his laptop, scratching his head, crumpled paper notes around him." },
      { t: "4–9s", k: "THẬT", d: "Tin nhắn kể ba câu ngắn (nội dung minh họa)." },
      { t: "9–18s", k: "THẬT", d: "Trang lời tựa in đẹp trong sách." },
    ],
    vo: "Chữ: “Bạn kể. Tụi mình viết. Bạn duyệt.”",
    audio: "Nhạc vui nhẹ.",
    cta: "Nhắn “LỜI TỰA” để xem mẫu",
    caption: "Văn không hay vẫn có lời tựa hay ✍️ #quatangnguoiyeu #photobook",
  },
  {
    title: "Còn 3 ngày nữa là kỷ niệm", persona: "nam", format: "Khẩn cấp",
    insight: "Nam “phút chót” mua sự an tâm và tốc độ, không mua giá rẻ.",
    hook: "Còn 3 ngày nữa là kỷ niệm. Bạn chưa có quà?",
    shots: [
      { t: "0–3s", k: "AI", d: "Lịch treo tường khoanh đỏ một ngày.", p: "Close-up of a paper wall calendar with a date circled in red marker, slow push-in." },
      { t: "3–6s", k: "AI", d: "Chàng trai nhìn lịch hoảng hốt.", p: "A young Vietnamese man staring at a wall calendar in panic, running his hands through his hair, comedic." },
      { t: "6–14s", k: "THẬT", d: "Dòng thời gian 72h: nhận ảnh → dàn trang → in → giao (đồ họa + cảnh thật)." },
      { t: "14–18s", k: "THẬT", d: "Hộp quà hoàn chỉnh có nơ." },
    ],
    vo: "“72 giờ. Bạn chỉ cần gửi ảnh.”",
    audio: "Tiếng đồng hồ đếm ngược.",
    cta: "Gói làm gấp 72h — nhắn “GẤP”",
    caption: "Cứu nguy cho hội quên ngày ⏰ #quagap #kyniem",
  },
  {
    title: "Giữ bí mật đến phút cuối", persona: "nam", format: "Dịch vụ",
    insight: "Sợ người yêu phát hiện trước khi tặng.",
    hook: "Làm sao để người yêu không biết bạn đang chuẩn bị quà?",
    shots: [
      { t: "0–4s", k: "AI", d: "Bạn gái nhòm điện thoại, bạn trai giấu ra sau lưng.", p: "Comedy: a young Vietnamese woman leaning over trying to peek at her boyfriend's phone on the sofa, he quickly hides it behind his back with an innocent smile." },
      { t: "4–12s", k: "THẬT", d: "Hộp ngoài kín không logo, ghi chú “Không gọi trước”, giao đến địa chỉ khác." },
      { t: "12–16s", k: "THẬT", d: "Bên trong là hộp quà thật." },
    ],
    vo: "Chữ: “Hộp kín · Không logo · Giao đúng giờ bạn hẹn”.",
    audio: "Nhạc kiểu điệp viên vui nhộn.",
    cta: "Nhắn “BÍ MẬT” để shop giao kín",
    caption: "Bất ngờ phải trọn vẹn 🤫 #surprise #quatang",
  },
  {
    title: "POV: mở hộp sau một năm yêu", persona: "all", format: "Reaction",
    insight: "Khách muốn nhìn thấy phản ứng thật trước khi tin.",
    hook: "POV: bạn trai đưa mình hộp này sau 1 năm yêu nhau.",
    shots: [
      { t: "0–4s", k: "THẬT", d: "Hộp quà được đặt vào tay (khách/cặp đôi seeding thật)." },
      { t: "4–10s", k: "THẬT", d: "Gỡ nơ, mở nắp, thấy gáy sách có tên." },
      { t: "10–18s", k: "THẬT", d: "Đọc trang đầu, phản ứng thật (che mặt nếu muốn)." },
    ],
    vo: "Không lời, giữ âm thanh thật.",
    audio: "Âm thanh gốc + nhạc nhẹ ở cuối.",
    cta: "Lô #2 chốt sau 3 ngày",
    caption: "Phản ứng thật, không dàn dựng 🥹 #reaction #quakyniem",
  },
  {
    title: "ASMR mở hộp quà", persona: "all", format: "ASMR",
    insight: "Trải nghiệm mở quà là một nửa giá trị món quà.",
    hook: "(Bật tiếng lên)",
    shots: [
      { t: "0–4s", k: "THẬT", d: "Nắp hộp nam châm mở “tách”." },
      { t: "4–10s", k: "THẬT", d: "Kéo nơ, mở lớp giấy pelure sột soạt." },
      { t: "10–18s", k: "THẬT", d: "Nhấc sách ra, thiệp rơi nhẹ." },
    ],
    vo: "Không lời.",
    audio: "Chỉ âm thanh thật thu bằng mic cài.",
    cta: "Caption: “Gói 40 trang có hộp quà · 349k”",
    caption: "🔊🎁 #asmr #unboxing #giftbox",
  },
  {
    title: "Hai tuần sau chuyến đi", persona: "travel", format: "Du lịch",
    insight: "Cảm giác hụt hẫng sau chuyến đi là lúc dễ muốn in ảnh nhất.",
    hook: "Hai tuần sau chuyến đi, cảm giác nhớ nhất là…",
    shots: [
      { t: "0–5s", k: "AI", d: "Chiều mưa, cô gái bên cửa sổ lướt ảnh biển.", p: "A rainy afternoon in a Hanoi apartment, a young Vietnamese woman by the window scrolling through beach trip photos on her phone, nostalgic mood, grey light." },
      { t: "5–8s", k: "AI", d: "Hồi tưởng: chạy trên bãi biển nắng.", p: "Flashback: a young Vietnamese couple running barefoot on a sunny beach, waves, bright saturated colors." },
      { t: "8–18s", k: "THẬT", d: "Sách “Xê Dịch” chuyến biển mở trên đùi." },
    ],
    vo: "“…là muốn quay lại. Không quay lại được thì giữ nó lại.”",
    audio: "Nhạc buồn chuyển ấm.",
    cta: "In chuyến đi trước khi quên",
    caption: "Post-trip blues 🌊 #dulich #nhonha #photobook",
  },
  {
    title: "Làm lành bằng một cuốn sách", persona: "nam", format: "Hài",
    insight: "Cãi nhau xong không biết mở lời làm lành.",
    hook: "Giận nhau 3 ngày. Làm lành bằng 1 cuốn sách.",
    shots: [
      { t: "0–5s", k: "AI", d: "Hai người ngồi hai đầu sofa, khoanh tay im lặng.", p: "A young Vietnamese couple sitting at opposite ends of a sofa, arms crossed, not talking, awkward silence, muted colors, comedic tone." },
      { t: "5–10s", k: "THẬT", d: "Tay chàng trai đẩy cuốn sách sang phía cô gái." },
      { t: "10–16s", k: "THẬT", d: "Trang có chữ “Xin lỗi vì đã cãi thắng” (hài)." },
    ],
    vo: "Chữ trên màn hình.",
    audio: "Âm thanh trend hài.",
    cta: "Tag người cần làm lành",
    caption: "Lời xin lỗi dài 30 trang 😅 #lamlanh #nguoiyeu",
  },
  {
    title: "Mỗi năm một cuốn — Vol. 1", persona: "all", format: "Sưu tầm",
    insight: "Cặp đôi muốn câu chuyện được nối tiếp, không chỉ một lần.",
    hook: "Mỗi năm một cuốn. Đây là Vol. 1.",
    shots: [
      { t: "0–6s", k: "THẬT", d: "Gáy sách in tên + “Vol. 1” trên kệ, bên cạnh là các khoảng trống." },
      { t: "6–12s", k: "AI", d: "Đôi vợ chồng lớn tuổi cùng xem album cũ, mỉm cười.", p: "An elderly Vietnamese couple sitting together on a wooden bench at home, looking at old printed photographs in their hands, smiling softly, warm nostalgic light." },
      { t: "12–18s", k: "THẬT", d: "Tay đặt cuốn Vol. 1 vào kệ." },
    ],
    vo: "“Hy vọng sau này sẽ cần một cái kệ dài hơn.”",
    audio: "Nhạc ấm áp.",
    cta: "Bắt đầu Vol. 1 của hai bạn",
    caption: "Một bộ sưu tập dài cả đời 📚 #vol1 #couple #photobook",
  },
  {
    title: "Gửi tụi mình năm 2036", persona: "all", format: "Kể chuyện",
    insight: "Tặng quà cho hiện tại nhưng nghĩ về tương lai cùng nhau.",
    hook: "Gửi tụi mình của năm 2036.",
    shots: [
      { t: "0–5s", k: "AI", d: "Hộp kỷ niệm được cất lên gác.", p: "A small wooden keepsake box being gently placed on a high shelf in a cozy home, dust particles in warm sunlight, slow motion." },
      { t: "5–14s", k: "THẬT", d: "Trang cuối “Thư gửi tương lai” viết tay." },
      { t: "14–18s", k: "THẬT", d: "Đóng sách, cận gáy năm 2026." },
    ],
    vo: "“10 năm nữa mở ra, mong là vẫn còn nhau.”",
    audio: "Piano.",
    cta: "Lô Noel đã mở — đặt ở bio",
    caption: "Thư gửi tương lai 💌 #2036 #kyniem #photobook",
  },
].map((s, i) => ({ ...s, day: i + 1, phase: i < 10 ? 1 : i < 20 ? 2 : 3 }));

const scriptText = (s) =>
  [
    `NGÀY ${s.day} — ${s.title}`,
    `Tệp: ${PERSONA[s.persona][0]} · Format: ${s.format} · Thời lượng: 15–20s · Khung dọc 9:16`,
    `Insight: ${s.insight}`,
    `Hook (chữ trên màn hình 0–3s): ${s.hook}`,
    "Phân cảnh:",
    ...s.shots.map((x) => `- ${x.t} [${x.k === "AI" ? "AI dựng" : "Quay thật"}] ${x.d}`),
    `Lời/Chữ: ${s.vo}`,
    `Âm thanh: ${s.audio}`,
    `CTA: ${s.cta}`,
    `Caption: ${s.caption}`,
  ].join("\n");

const aiText = (s) => {
  const ai = s.shots.filter((x) => x.k === "AI");
  if (!ai.length) return `NGÀY ${s.day} — ${s.title}: không có cảnh AI, quay thật toàn bộ.`;
  return [`DAY ${s.day} — ${s.title}`, `STYLE: ${STYLE_PROMPT}`, ...ai.map((x, i) => `CLIP ${i + 1} (${x.t}): ${x.p}`)].join("\n\n");
};

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

/* =========================================================
   TAB 6 — MARKETING & AI
   ========================================================= */
const FORMATS = [
  { name: "Camera roll → Sách", icon: Sparkles, color: C.burgundy, beats: ["Cuộn 800 ảnh lộn xộn", "Cắt sang cuốn sách", "Lật 5 trang đẹp nhất", "Giá + link bio"], hook: "800 ảnh Đà Lạt → 30 trang này" },
  { name: "ASMR lật trang", icon: Film, color: C.gold, beats: ["Chạm gáy in tên", "Lật chậm, top-down", "Chỉ tiếng giấy", "CTA ở caption"], hook: "Âm thanh của 365 ngày yêu" },
  { name: "POV tặng quà", icon: Heart, color: C.rose, beats: ["Text POV", "Mở hộp, gỡ nơ", "Reaction thật", "Làm hộ A–Z"], hook: "POV: bạn trai lén làm cái này" },
  { name: "Dàn trang 15'", icon: Clock, color: C.sage, beats: ["Đồng hồ 15:00", "Tua màn hình", "Sách thật in xong", "Còn X suất"], hook: "Làm sách nhanh hơn nấu mì" },
  { name: "Ở xưởng in", icon: Printer, color: "#9A88C8", beats: ["Máy in chạy", "Cắt, vào keo", "QC từng trang", "Hạn chốt lô"], hook: "Một cuốn photobook ra đời" },
];
const BEAT_LABELS = ["0–3s", "3–10s", "10–20s", "CTA"];

const AI_PIPE = [
  { step: "Kịch bản", tool: "ChatGPT / Claude", time: "2h/tháng" },
  { step: "Lời tựa", tool: "ChatGPT / Claude", time: "3'/đơn" },
  { step: "Template", tool: "Canva", time: "1 ngày" },
  { step: "Quay batch", tool: "Điện thoại + đèn", time: "2 × 3h" },
  { step: "Dựng", tool: "CapCut", time: "20'/video" },
  { step: "Đăng & đo", tool: "TikTok Studio / Meta", time: "30'/tuần" },
];

const PROMPTS = [
  { title: "10 hook video", text: "Bạn là content creator TikTok chuyên quà tặng cặp đôi Gen Z Việt Nam. Viết 10 câu hook dài tối đa 12 từ cho video giới thiệu photobook bìa cứng cá nhân hóa giá từ 259k. Mỗi hook theo 1 kiểu: POV, câu hỏi, con số, gây tò mò, đồng cảm. Giọng tự nhiên, không sến, không dùng từ 'siêu phẩm'." },
  { title: "Lời tựa cho khách", text: "Viết lời tựa trang đầu cho cuốn photobook kỷ niệm của một cặp đôi. Thông tin: [tên 2 người], quen nhau [ở đâu/khi nào], kỷ niệm đáng nhớ: [1–2 chi tiết], dịp tặng: [kỷ niệm/sinh nhật]. Viết 3 phiên bản: (1) ngọt ngào ngôn tình, (2) hài hước nhẹ, (3) tối giản kiểu tạp chí. Mỗi bản 60–90 từ, tiếng Việt tự nhiên, không sáo rỗng." },
  { title: "Lịch 30 video", text: "Lập lịch 30 video ngắn cho thương hiệu photobook cặp đôi ở Việt Nam. Trộn 5 format: biến đổi camera roll → sách, ASMR lật trang, POV tặng quà, quy trình 15 phút, hậu trường xưởng in. Mỗi ngày gồm: format, hook (≤12 từ), 4 cảnh quay, CTA, kênh đăng. 10 ngày đầu xây nhận biết, 10 ngày giữa mở pre-order, 10 ngày cuối chốt đơn." },
];

const CALENDAR = SCRIPTS.map((x) => [x.format, x.title]);
const CAL_COLORS = FORMAT_COLORS;

function MarketingTab() {
  return (
    <div className="space-y-5">
      <Title n="07" title="Marketing & AI Content" />

      <Card title="5 format video chủ lực" icon={Film}>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[160px_repeat(4,1fr)] gap-1.5 pb-1.5 text-center text-[11px] font-bold text-[#6B6B69]">
              <div />
              {BEAT_LABELS.map((b) => <div key={b}>{b}</div>)}
            </div>
            {FORMATS.map((f) => (
              <div key={f.name} className="grid grid-cols-[160px_repeat(4,1fr)] gap-1.5 pb-1.5">
                <div className="flex items-center gap-2 text-sm font-bold"><f.icon className="h-4 w-4" style={{ color: f.color }} />{f.name}</div>
                {f.beats.map((b, i) => (
                  <div key={b} className="rounded-lg px-2 py-2 text-center text-xs font-semibold" style={{ background: `${f.color}${["33", "24", "18", "10"][i]}`, color: C.ink }}>{b}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-5">
          {FORMATS.map((f) => (
            <div key={f.name} className="rounded-xl border-l-4 bg-[#F5F5F4] p-2.5 text-xs font-semibold" style={{ borderColor: f.color }}>“{f.hook}”</div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card title="Dây chuyền AI: 30 video/tháng" icon={Wand2} right={<Pill color={C.sage}>~0đ tiền mặt</Pill>}>
          <div className="flex flex-wrap items-stretch gap-2">
            {AI_PIPE.map((a, i) => (
              <React.Fragment key={a.step}>
                <div className="min-w-[96px] flex-1 rounded-xl bg-[#F5F5F4] p-2.5 text-center">
                  <div className="text-xs font-extrabold text-[#2E2E2E]">{i + 1}. {a.step}</div>
                  <div className="mt-1 text-[11px]">{a.tool}</div>
                  <div className="mt-1"><Pill color={C.gold}>{a.time}</Pill></div>
                </div>
                {i < AI_PIPE.length - 1 && <ArrowRight className="hidden h-4 w-4 self-center text-[#DDA543] md:block" />}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="Giờ làm / tháng" value="~22h" />
            <Stat label="Bật Ads khi" value="Xem hết > 25%" />
            <Stat label="Mockup" value="Ảnh sách thật" tone="good" />
          </div>
        </Card>
        <Card title="Prompt mẫu" icon={Sparkles}>
          <div className="space-y-2">
            {PROMPTS.map((pr) => (
              <details key={pr.title} className="rounded-xl border border-[#E4E4E2] p-2.5">
                <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-bold text-[#2E2E2E]">
                  {pr.title}
                  <CopyBtn text={pr.text} />
                </summary>
                <div className="mt-2 text-xs leading-relaxed">{pr.text}</div>
              </details>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Lịch 30 ngày" icon={Calendar} right={<a href="#kich-ban" className="text-xs font-bold text-[#2E2E2E] underline">Xem kịch bản chi tiết →</a>}>
        <div className="mb-3 flex flex-wrap gap-2">
          <Pill color={C.burgundy}>N1–10 · Nhận biết</Pill>
          <Pill color={C.gold}>N11–20 · Pre-order</Pill>
          <Pill color={C.sage}>N21–30 · Chốt đơn</Pill>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {CALENDAR.map(([type, idea], i) => {
            const phase = i < 10 ? C.burgundy : i < 20 ? C.gold : C.sage;
            return (
              <div key={i} className="rounded-xl border border-[#E4E4E2] bg-white p-2.5" style={{ borderTop: `3px solid ${phase}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold">{i + 1}</span>
                  <Pill color={CAL_COLORS[type] || C.muted}>{type}</Pill>
                </div>
                <div className="mt-1 text-xs leading-snug">{idea}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="View tích lũy" value="150–300k" />
          <Stat label="Lưu / video" value="≥ 2%" />
          <Stat label="DM hỏi giá" value="60–120" />
          <Stat label="Đơn organic T1" value="20–40" tone="good" />
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   TAB 7 — CHECKLIST
   ========================================================= */
const WEEKS = [
  { title: "Tuần 1 · Xưởng in & mẫu", icon: Printer, tasks: ["Lập danh sách 8–10 xưởng in kỹ thuật số", "Xin báo giá 3 xưởng: tờ A3+ mỹ thuật 200gsm, bìa cứng B5 nhỡ, giá 30/100 cuốn/tháng, hộp nắp rời 100 hộp", "Ghé trực tiếp 3–4 xưởng", "In thử mỹ thuật 200gsm vs couche mờ 200gsm, kiểm tra ảnh tối và da người", "Chốt 1 xưởng chính + 1 dự phòng", "Xuất thử PDF in từ trang admin (tràn lề 3 mm, vạch xén) gửi xưởng kiểm tra", "In 3 cuốn mẫu: 24 / 32 / 40 trang", "Đặt 30 hộp nắp rời + 200 bộ túi/thiệp/tờ sticker", "Đăng ký hộ kinh doanh, tài khoản + QR", "Nhập giá vốn thật vào Tab 01"] },
  { title: "Tuần 2 · Kênh & 15 video", icon: Camera, tasks: ["Tạo TikTok, Instagram, Threads, Zalo, link bio", "Dựng góc quay: đèn, tripod, mic", "AI viết 15 kịch bản", "Quay batch 2 buổi", "Dựng 15 video, đặt lịch đăng", "Catalog giá + chính sách bảo mật ảnh", "Tặng sách 3 cặp đôi/micro-creator", "Form/Drive nhận ảnh + mẫu tin nhắn"] },
  { title: "Tuần 3 · Pre-order lô #1", icon: Gift, tasks: ["Mở pre-order 30 suất, 3 gói 259/299/349k, gắn nhãn gói 32 trang", "Thu 100% hoặc cọc ≥ 50%", "Gửi preview trong 24h", "Gửi lô #1 cho xưởng", "QC + quay đóng gói làm content", "Giao hàng, xin feedback & reaction", "Trả xưởng đúng hẹn, xin nợ 7–15 ngày"] },
  { title: "Tuần 4 · Vòng quay vốn", icon: Coins, tasks: ["Sổ dòng tiền theo ngày", "So COGS, CAC, AOV thực với mô hình", "Chấm đèn tín hiệu dừng lỗ (Tab 02)", "Chốt công nợ bằng văn bản", "Cố định lịch gửi lô", "Chỉ boost video xem hết > 25%", "Mở lô Noel; chốt lô Valentine trước 25/1"] },
];
const STORE_KEY = "ourarchive-checklist-v2";

function ChecklistTab() {
  const [done, setDone] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(done));
    } catch (e) {
      /* không lưu được: vẫn dùng trong phiên */
    }
  }, [done]);
  const toggle = (id) => setDone((d) => ({ ...d, [id]: !d[id] }));
  const total = WEEKS.reduce((s, w) => s + w.tasks.length, 0);
  const finished = Object.values(done).filter(Boolean).length;
  const overall = Math.round((finished / total) * 100);

  return (
    <div className="space-y-5">
      <Title n="09" title="Checklist 30 ngày" />
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-[#E4E4E2] bg-white p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold">Tiến độ</span>
            <span className="text-sm font-bold tabular-nums text-[#2E2E2E]">{finished}/{total} · {overall}%</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-[#EFEFEE]"><div className="h-3 rounded-full bg-[#2E2E2E] transition-all" style={{ width: `${overall}%` }} /></div>
        </div>
        <button onClick={() => setDone({})} className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#E4E4E2] bg-white px-4 text-sm font-semibold text-[#2E2E2E] hover:bg-[#F5F5F4]">
          <RotateCcw className="h-4 w-4" /> Làm lại
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {WEEKS.map((w, wi) => {
          const n = w.tasks.filter((_, ti) => done[`${wi}-${ti}`]).length;
          const pr = Math.round((n / w.tasks.length) * 100);
          return (
            <Card key={w.title} title={w.title} icon={w.icon} right={<Pill color={pr === 100 ? C.sage : C.red}>{pr}%</Pill>}>
              <div className="mb-3 h-1.5 rounded-full bg-[#EFEFEE]"><div className="h-1.5 rounded-full bg-[#DDA543] transition-all" style={{ width: `${pr}%` }} /></div>
              <ul className="space-y-0.5">
                {w.tasks.map((t, ti) => {
                  const id = `${wi}-${ti}`;
                  return (
                    <li key={id}>
                      <label className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-[#F5F5F4] ${done[id] ? "text-[#6B6B69] line-through" : ""}`}>
                        <input type="checkbox" checked={!!done[id]} onChange={() => toggle(id)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer" style={{ accentColor: C.burgundy }} />
                        <span>{t}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   ỨNG DỤNG
   ========================================================= */

/* =========================================================
   TAB · CHI PHÍ & BÁO GIÁ (tra cứu 21/11/2026, giá công bố trên web — cần báo giá thật để chốt)
   ========================================================= */
const COST_SRC = [
  { g: "In ruột", item: "In màu A3 giấy couche (lẻ)", price: "2.000–7.000đ/tờ", src: "In Hoa Hồng", url: "https://inhoahong.vn/gia-in-mau", note: "Khoảng rộng, chưa tách định lượng" },
  { g: "In ruột", item: "In KTS A3 couche 150–200gsm, 2 mặt", price: "3.500đ (1 tờ) → 1.800đ (50 tờ)", src: "In Nhanh Thủ Đô · bảng giá in KTS", url: "https://innhanhthudo.com/in-ky-thuat-so-ha-noi", note: "Giấy mỹ thuật thường đắt hơn couche 20–40%" },
  { g: "In ruột", item: "Tờ gấp A3 couche 200gsm", price: "4.950đ (500 tờ) · 2.915đ (1.000 tờ)", src: "In ấn AZ", url: "https://inanaz.com.vn/bao-gia-in-to-gap-a3", note: "Chưa VAT, chưa cán màng" },
  { g: "Bìa & đóng", item: "Đóng sách bìa cứng A4", price: "Từ 30.000đ/quyển", src: "In Thiên Hằng", url: "https://inthienhang.com/dong-sach-bia-cung/", note: "Bìa phổ thông, chưa in bìa màu" },
  { g: "Bìa & đóng", item: "Đóng bìa cứng mạ chữ", price: "45.000–50.000đ/quyển", src: "In Tâm Phúc", url: "https://intamphuc.vn/dong-sach-bia-cung/", note: "" },
  { g: "Đối thủ", item: "Photobook bìa cứng 20×20, 20 trang (bán lẻ)", price: "Từ 360.000đ · +25.000đ/4 trang · hộp từ 90.000đ", src: "In Nhanh Thủ Đô", url: "https://innhanhthudo.com/in-photobook", note: "Giá bán lẻ cho khách, không phải giá xưởng" },
  { g: "Đối thủ", item: "Photobook 24 trang bìa cứng 20×30", price: "~280.000đ", src: "In Thịnh Phát", url: "https://inthinhphat.com/kinh-nghiem-in-photobook-ky-yeu-2026-2027-dung-in-neu-chua-doc-bai-nay/", note: "Không gồm thiết kế" },
  { g: "Hộp quà", item: "Hộp nam châm 10×10×6 / 14×14×6 cm (1.000 hộp)", price: "12.900đ / 17.700đ", src: "In ấn AZ", url: "https://inanaz.com.vn/in-an/in-hop-cung", note: "Hộp vừa sách B5 (~18×25×4) và chỉ 100 hộp → ước 30–45k/hộp" },
  { g: "Hộp quà", item: "Hộp cứng gấp gọn nam châm (lẻ)", price: "Từ 33.000đ/hộp", src: "hopgapgon.com", url: "https://hopgapgon.com/san-pham", note: "Từ 100 hộp có giá sỉ" },
  { g: "Vận chuyển", item: "GHTK nội thành Hà Nội (≤ 3 kg)", price: "22.000đ", src: "Biểu phí GHTK · allship.vn", url: "https://allship.vn/cap-nhat-bang-gia-ghtk-chi-tiet-tung-khu-vuc-dich-vu/", note: "Sau phụ phí ~23–24k → shop bù ~3–4k/đơn" },
  { g: "Vận chuyển", item: "GHTK liên tỉnh 0,5 kg", price: "30.000–40.000đ", src: "Biểu phí GHTK (PDF)", url: "https://cache.giaohangtietkiem.vn/d/22ec5d9d4d4c77b7bc57a573218a7086.pdf", note: "Sách + bao bì ~0,8–1 kg → có thể cao hơn" },
  { g: "Vận chuyển", item: "GHN nội thành / liên tỉnh", price: "~22.000đ / 22.000–35.000đ", src: "Goship · so sánh GHN–GHTK", url: "https://goship.io/blog/so-sanh-giao-hang-nhanh-va-giao-hang-tiet-kiem/", note: "" },
  { g: "Quảng cáo", item: "TikTok Ads", price: "CPM 25.000–50.000đ · CPC 3.000–5.000đ", src: "Hunter Agency", url: "https://hunteragency.vn/chi-phi-quang-cao-tiktok-2025-bang-gia-cach-tinh-va-meo-toi-uu-ngan-sach-hieu-qua/", note: "Blog agency, chưa kiểm chứng" },
  { g: "Quảng cáo", item: "Facebook Ads Việt Nam", price: "CPM 15.000–80.000đ (nguồn khác 50–150k)", src: "Phúc T Digital", url: "https://phuctdigital.com/gia-quang-cao-facebook-ads/", note: "Phụ thuộc ngành, creative" },
  { g: "Thuế", item: "Hộ kinh doanh doanh thu ≤ 500tr/năm", price: "Miễn GTGT + TNCN từ 2026 (vẫn phải kê khai)", src: "Thư Viện Pháp Luật · VnExpress", url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/chinh-sach-moi/100294/chinh-thuc-ho-kinh-doanh-co-doanh-thu-duoi-500-trieu-dong-nam-khong-phai-dong-thue-tu-2026", note: "Các nguồn chưa thống nhất → hỏi cơ quan thuế" },
];
const COST_MODEL = [
  ["In ruột (mỹ thuật 200gsm, A3+ 2 mặt)", "6 / 8 / 10 tờ", "3.500–6.000đ/tờ", "4.500đ", "≤ 4.000đ khi ≥ 100 cuốn/tháng"],
  ["Bìa cứng bồi carton + in bìa + cán mờ + đóng", "1 cuốn", "35.000–55.000đ", "42.000đ", "≤ 38.000đ, gom lô 1–2 lần/tuần"],
  ["Bao bì chung (túi chống ẩm + carton chống gãy góc)", "Mỗi đơn", "5.000–9.000đ", "7.000đ", "Mua sỉ 200 bộ"],
  ["Thiệp cảm ơn + tờ sticker A6 (bộ 57 hình)", "Mỗi đơn", "4.000–8.000đ", "6.000đ", "In decal bế demi theo tờ A3"],
  ["Túi giấy quà (gói 32)", "Mỗi đơn", "3.000–6.000đ", "4.000đ", ""],
  ["Hộp cứng nắp rời vừa sách (gói 40)", "100 hộp", "22.000–35.000đ", "25.000đ", "Nam châm đắt hơn ~10k; ≥ 300 hộp còn ~18–22k"],
  ["Ship shop tự chịu (sau khi khách trả 20k/30k, đơn trả đủ miễn ship)", "Trung bình/đơn", "6.000–13.000đ", "10.000đ", "Gom đơn HN giao 1 lần/ngày"],
  ["CAC (quảng cáo + KOC giảm 10% + hoa hồng 12%)", "Trung bình/đơn", "35.000–75.000đ", "55.000đ", "Đơn KOC tốn ~60k; organic gần 0"],
];
function CostTab() {
  const tiers = tierCalc(PRESETS.likely);
  return (
    <div className="space-y-5">
      <Title n="10" title="Chi phí & báo giá · Hà Nội" />
      <Card title="Giá vốn 1 cuốn theo kịch bản Khả dĩ nhất" icon={Printer} right={<Pill color={C.muted}>Tra cứu 21/11/2026</Pill>}>
        <div className="grid gap-3 md:grid-cols-3">
          {tiers.map((x) => (
            <div key={x.name} className="rounded-xl border border-[#E4E4E2] p-3 text-sm">
              <div className="flex items-center justify-between"><b>{x.name}</b><span className="font-extrabold">{k(x.price)}</span></div>
              <div className="mt-2 space-y-1 text-[13px]">
                <div className="flex justify-between"><span className="text-[#6B6B69]">In ruột ({x.sheets} tờ × {vnd(PRESETS.likely.sheetPrice)})</span><b>{k(x.print)}</b></div>
                <div className="flex justify-between"><span className="text-[#6B6B69]">Bìa cứng + đóng</span><b>{k(PRESETS.likely.cover)}</b></div>
                <div className="flex justify-between"><span className="text-[#6B6B69]">Bao bì + quà</span><b>{k(x.pack)}</b></div>
                <div className="flex justify-between"><span className="text-[#6B6B69]">Dự phòng in lại {PRESETS.likely.reprint}%</span><b>{k(x.cogs - x.print - PRESETS.likely.cover - x.pack)}</b></div>
                <div className="flex justify-between border-t border-dashed border-[#E4E4E2] pt-1"><span>Giá vốn</span><b>{k(x.cogs)} · biên gộp {pct(x.gm, 0)}</b></div>
                <div className="flex justify-between"><span>Lãi/đơn sau CAC, ship, phí</span><b className={x.contrib >= 0 ? "text-[#2F6B3A]" : "text-[#B4232F]"}>{k(x.contrib)}</b></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-[#FFF6E5] p-3 text-[13px] text-[#7A4B00]">
          <b>Vì sao hộp quà không nên tốn 40k+?</b> Hộp nam châm in theo khuôn riêng chỉ rẻ khi đặt ≥ 1.000 hộp (AZ: 12,9–17,7k cho hộp nhỏ). Với 100 hộp vừa sách B5, giá thường 30–45k. Đề xuất: gói 40 dùng <b>hộp cứng nắp rời (âm dương) không nam châm ~25k</b>, in 1 màu logo; khi bán ≥ 300 hộp/đợt mới chuyển sang nam châm (~22–28k). Gói 24/32 chỉ dùng túi chống ẩm + carton chống gãy góc + thiệp + tờ sticker (~13–17k).
        </div>
      </Card>
      <Card title="Bảng giả định chi phí (dùng trong mô hình)" icon={Layers}>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
          <thead><tr className="text-left text-xs text-[#6B6B69]"><th className="py-2">Khoản</th><th>Đơn vị</th><th>Khoảng giá</th><th>Dùng trong mô hình</th><th>Mục tiêu thương lượng</th></tr></thead>
          <tbody>{COST_MODEL.map((r) => <tr key={r[0]} className="border-t border-[#EFEFEE]">{r.map((c, i) => <td key={i} className={`py-2 pr-3 ${i === 3 ? "font-bold" : ""}`}>{c}</td>)}</tr>)}</tbody>
        </table></div>
      </Card>
      <Card title="Nguồn tra cứu" icon={BookOpen} right={<Pill color={C.gold}>Giá công bố trên web, cần báo giá thật</Pill>}>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
          <thead><tr className="text-left text-xs text-[#6B6B69]"><th className="py-2">Nhóm</th><th>Hạng mục</th><th>Giá công bố</th><th>Nguồn</th><th>Ghi chú</th></tr></thead>
          <tbody>{COST_SRC.map((r) => <tr key={r.item} className="border-t border-[#EFEFEE] align-top"><td className="py-2 pr-2 text-[#6B6B69]">{r.g}</td><td className="pr-2">{r.item}</td><td className="pr-2 font-bold">{r.price}</td><td className="pr-2"><a className="underline" href={r.url} target="_blank" rel="noreferrer">{r.src}</a></td><td className="text-[12px] text-[#6B6B69]">{r.note}</td></tr>)}</tbody>
        </table></div>
        <div className="mt-2 text-[12px] text-[#6B6B69]">Không tìm được bảng giá công khai cho: in decal bế demi số lượng ít, thiệp cảm ơn 100 cái, in HP Indigo giấy mỹ thuật. Các khoản này đang dùng ước tính và cần hỏi xưởng.</div>
      </Card>
      <Card title="Tin nhắn xin báo giá (B5 nhỡ, mỹ thuật 200gsm)" icon={MessageCircle} right={<CopyBtn text={PRINTER_MSG} label="Chép tin nhắn" />}>
        <pre className="whitespace-pre-wrap rounded-xl bg-[#F5F5F4] p-3 text-xs leading-relaxed" style={{ fontFamily: FONT }}>{PRINTER_MSG}</pre>
      </Card>
    </div>
  );
}

/* =========================================================
   TAB · UPSELL · CHỜ CHỐT (chưa đưa lên web — bàn với cofounder rồi bật)
   ========================================================= */
const UPSELL = [
  { name: "Hộp quà cứng nắp rời cho gói 24/32", price: 69000, cost: 25000, how: "Nút “thêm hộp quà” ở bước đặt sách", why: "Quà tặng dịp lễ, tăng giá trị đơn mà không đổi sách" },
  { name: "Thêm 4 trang (1 tờ A3+)", price: 29000, cost: 5000, how: "Nút “+4 trang” trong menu Dự án", why: "Khách dư ảnh nhưng không muốn lên gói" },
  { name: "Bộ 6 ảnh polaroid in rời", price: 39000, cost: 10000, how: "Chọn 6 ảnh từ kho ảnh khi đặt", why: "Dán tường, tặng kèm, quay unbox đẹp" },
  { name: "2 dải photobooth in lại", price: 25000, cost: 4000, how: "Chọn 4 ảnh/dải", why: "Hợp tệp Gen Z mê photobooth" },
  { name: "Tờ sticker A5 tự chọn từ bộ 57 hình", price: 19000, cost: 5000, how: "Chọn 12 hình yêu thích", why: "Đồng bộ với hình minh hoạ trong sách" },
  { name: "Ép nhũ tên hai bạn trên bìa", price: 59000, cost: 25000, how: "Ô nhập tên + chọn màu nhũ vàng/bạc", why: "Cảm giác cao cấp, khó tự làm ở nhà" },
  { name: "Làm gấp 72 giờ", price: 59000, cost: 15000, how: "Ô tick ở bước đặt sách", why: "Khách đặt sát ngày kỷ niệm, Valentine" },
  { name: "Thiệp viết tay của Our Archive", price: 15000, cost: 3000, how: "Ô nhập lời nhắn", why: "Rẻ, dễ mua kèm, tăng cảm xúc" },
];
function UpsellTab() {
  const [on, setOn] = useState(() => UPSELL.map(() => true));
  const [rate, setRate] = useState(20);
  const picked = UPSELL.filter((_, i) => on[i]);
  const avgP = picked.length ? picked.reduce((s, x) => s + x.price, 0) / picked.length : 0;
  const avgC = picked.length ? picked.reduce((s, x) => s + x.cost, 0) / picked.length : 0;
  const orders = PRESETS.likely.orders;
  const extra = orders * (rate / 100) * (avgP - avgC);
  return (
    <div className="space-y-5">
      <Title n="11" title="Upsell · chờ chốt" />
      <div className="rounded-xl bg-[#FFF6E5] p-3 text-[13px] text-[#7A4B00]">Danh sách này <b>chưa đưa lên web</b>. Bàn với cofounder, đánh dấu món muốn bán, rồi báo Claude bật lên web. Giá vốn là ước tính, cần báo giá xưởng.</div>
      <Card title="Các món đề xuất" icon={Gift}>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
          <thead><tr className="text-left text-xs text-[#6B6B69]"><th className="py-2">Chọn</th><th>Món</th><th className="text-right">Giá bán</th><th className="text-right">Giá vốn ước</th><th className="text-right">Lãi gộp</th><th>Cách bán trên web</th><th>Vì sao</th></tr></thead>
          <tbody>{UPSELL.map((x, i) => (
            <tr key={x.name} className="border-t border-[#EFEFEE] align-top">
              <td className="py-2"><input type="checkbox" checked={on[i]} onChange={() => setOn((s) => s.map((v, j) => (j === i ? !v : v)))} /></td>
              <td className="pr-2 font-semibold">{x.name}</td><td className="text-right">{k(x.price)}</td><td className="text-right text-[#6B6B69]">{k(x.cost)}</td>
              <td className="text-right font-bold text-[#2F6B3A]">{k(x.price - x.cost)}</td><td className="pl-3 text-[12px]">{x.how}</td><td className="pl-2 text-[12px] text-[#6B6B69]">{x.why}</td>
            </tr>))}</tbody>
        </table></div>
      </Card>
      <div className="grid gap-5 md:grid-cols-[320px_1fr]">
        <Card title="Ước tính" icon={Coins}>
          <Slider label="Tỷ lệ khách mua ít nhất 1 món" value={rate} min={0} max={60} step={5} onChange={setRate} fmt={(v) => `${v}%`} />
          <div className="mt-2 text-xs text-[#6B6B69]">Tính trên {orders} đơn/tháng (kịch bản Khả dĩ nhất).</div>
        </Card>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Stat label="Món đang chọn" value={picked.length} />
          <Stat label="Giá bán TB" value={k(avgP)} />
          <Stat label="Lãi gộp TB / món" value={k(avgP - avgC)} tone="good" />
          <Stat label="Lãi thêm / tháng" value={tr(extra)} tone="brand" />
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "tai-chinh", label: "Tài chính", icon: Wallet, C: FinanceTab },
  { id: "than-trong", label: "Kịch bản thận trọng", icon: Shield, C: SafeTab },
  { id: "xac-suat", label: "Xác suất & Hòa vốn", icon: Target, C: ProbTab },
  { id: "thi-truong", label: "Thị trường", icon: TrendingUp, C: MarketTab },
  { id: "khach-hang", label: "Khách hàng", icon: Users, C: PersonaTab },
  { id: "san-pham", label: "Sản phẩm", icon: Package, C: ProductTab },
  { id: "marketing", label: "Marketing & AI", icon: Megaphone, C: MarketingTab },
  { id: "kich-ban", label: "30 kịch bản video", icon: Film, C: ScriptsTab },
  { id: "checklist", label: "Checklist", icon: CheckSquare, C: ChecklistTab },
  { id: "chi-phi", label: "Chi phí & báo giá", icon: Coins, C: CostTab },
  { id: "upsell", label: "Upsell · chờ chốt", icon: Gift, C: UpsellTab },
];

export default function App() {
  const initial = () => {
    try {
      const h = (window.location.hash || "").replace("#", "");
      if (TABS.some((t) => t.id === h)) return h;
    } catch (e) {
      /* bỏ qua */
    }
    return TABS[0].id;
  };
  const [tab, setTab] = useState(initial);
  useEffect(() => {
    const onHash = () => {
      const h = (window.location.hash || "").replace("#", "");
      if (TABS.some((t) => t.id === h)) setTab(h);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (id) => {
    setTab(id);
    try {
      window.location.hash = id;
    } catch (e) {
      /* bỏ qua */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const Active = TABS.find((t) => t.id === tab).C;

  return (
    <div className="min-h-screen bg-white text-[#2E2E2E] antialiased" style={{ fontFamily: FONT }}>
      <header className="border-b border-[#E4E4E2]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-black leading-none tracking-tight text-[#9A9A97]"><span className="text-[#2E2E2E]">our</span> archive</h1>
              <div className="mt-1 text-xs font-medium text-[#6B6B69]">Photobook cặp đôi · B5 nhỡ · in tại Hà Nội · Dashboard khởi nghiệp</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-[#E4E4E2] bg-white px-3 py-1">Vốn <b>20tr</b></span>
            <span className="rounded-full border border-[#E4E4E2] bg-white px-3 py-1">3 gói <b>259 · 299 · 349k</b> · cọc <b>50%</b></span>
            <span className="rounded-full border border-[#E4E4E2] bg-white px-3 py-1">Vốn lưu động <b>âm</b></span>
          </div>
        </div>
      </header>
      <nav className="sticky top-0 z-20 border-b border-[#E4E4E2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 py-2">
          {TABS.map((t, i) => {
            const active = t.id === tab;
            return (
              <button key={t.id} onClick={() => go(t.id)} className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${active ? "bg-[#2E2E2E] text-white" : "text-[#2E2E2E] hover:bg-[#EFEFEE]"}`}>
                <span className={`text-[10px] font-bold tabular-nums ${active ? "text-white/70" : "text-[#DDA543]"}`}>{String(i + 1).padStart(2, "0")}</span>
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
      <main className="mx-auto max-w-[1400px] px-5 py-6"><Active /></main>
      <footer className="mx-auto max-w-[1400px] px-5 pb-8 text-[11px] text-[#6B6B69]">Giá vốn tra cứu ngày 21/11/2026 từ giá công bố trên web (xem tab Chi phí & báo giá); thay bằng báo giá thật sau Tuần 1. Không phải tư vấn thuế/pháp lý.</footer>
    </div>
  );
}
