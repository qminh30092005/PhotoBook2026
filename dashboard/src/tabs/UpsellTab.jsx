import React, { useState } from "react";
import { PRESETS } from "../finance/model";
import { Title, Card, Slider, Stat } from "../shared/components";
import { Gift, Coins } from "lucide-react";
import { k, tr } from "../shared/theme";

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

export { UpsellTab };
