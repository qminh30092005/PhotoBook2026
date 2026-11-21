import { C } from "../shared/theme";
import { Shield, Sparkles, Target, TrendingUp } from "lucide-react";

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

export { PRESETS, runScenario, simulate, allocInfo, computeUnit, SCEN, MONTH_LABELS, CAPITAL, MONTHS, tierCalc };
