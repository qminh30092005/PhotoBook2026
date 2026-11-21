import archiveLogo from '../../src/our-archive.svg';
import { Wallet, Shield, Target, TrendingUp, Users, Package, Megaphone, Film, CheckSquare, Coins, Gift } from "lucide-react";
import { FinanceTab } from "./tabs/FinanceTab";
import { SafeTab } from "./tabs/SafeTab";
import { ProbTab } from "./tabs/ProbTab";
import { MarketTab } from "./tabs/MarketTab";
import { PersonaTab } from "./tabs/PersonaTab";
import { ProductTab } from "./tabs/ProductTab";
import { MarketingTab } from "./tabs/MarketingTab";
import { ScriptsTab } from "./tabs/ScriptsTab";
import { ChecklistTab } from "./tabs/ChecklistTab";
import { CostTab } from "./tabs/CostTab";
import { UpsellTab } from "./tabs/UpsellTab";
import React, { useState, useEffect } from "react";
import { FONT } from "./shared/theme";

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
              <h1><img src={archiveLogo} width="151" height="36" alt="Our Archive" /></h1>
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
