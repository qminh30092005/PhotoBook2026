

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

export { C, FONT, k, vnd, tr, pct, CHART };
