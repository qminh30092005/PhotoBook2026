/* ===== CHẤT LƯỢNG ẢNH IN: ppi thực của ảnh gốc trong từng khung =====
   Trang thành phẩm 165 × 235 mm, tràn lề 3 mm. Khung chạm mép trang được cộng thêm phần tràn lề.
   Ảnh phủ kín khung (cover) rồi phóng thêm z lần, nên ppi = min(rộng gốc / rộng khung, cao gốc / cao khung) × 25,4 / z. */
const PAGE_MM={w:165,h:235,bleed:3};
function frameMM(f){const [x,y,w,h]=f;let W=w/100*PAGE_MM.w,H=h/100*PAGE_MM.h;
  if(x<=0)W+=PAGE_MM.bleed;if(x+w>=100)W+=PAGE_MM.bleed;if(y<=0)H+=PAGE_MM.bleed;if(y+h>=100)H+=PAGE_MM.bleed;return {W,H}}
function framePPI(fr){
  if(!fr||!fr.ph)return null;const p=S.photos.find(x=>x.id===fr.ph);if(!p)return null;
  const ow=p.ow||p.w, oh=p.oh||p.h;const {W,H}=frameMM(fr.f);
  return Math.round(Math.min(ow/(W/25.4),oh/(H/25.4))/(fr.z||1));
}
function frameLow(fr){const p=fr&&fr.ph&&S.photos.find(x=>x.id===fr.ph);if(!p||p.sample)return false;const v=framePPI(fr);return v!=null&&v<CONFIG.MIN_PPI}
function lowResList(){
  const out=[];if(!S.book)return out;
  S.book.spreads.forEach((sp,i)=>['L','R'].forEach(s=>(sp[s].frames||[]).forEach((fr,k)=>{if(frameLow(fr))out.push({label:spreadLabel(i,S.book)+' · khung '+(k+1)+' ('+framePPI(fr)+'ppi)',spread:i,side:s,frame:k,ppi:framePPI(fr)})})));
  return out;
}
