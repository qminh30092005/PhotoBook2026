/* ===== XUẤT PDF IN (trang admin) =====
   - File ruột: mỗi trang 165 × 235 mm + tràn lề 3 mm + lề vạch xén 7 mm, ảnh 300ppi (JPEG chất lượng cao).
   - File bìa trải phẳng: phần gập bọc 15 mm + bìa sau + gáy (theo gói) + bìa trước + phần gập 15 mm, có vạch xén và vạch gập.
   - Mỗi trang được vẽ lại bằng canvas theo đúng toạ độ của trình thiết kế (khung %, chữ theo đơn vị trang = 165mm/300).
   - Chữ là ảnh (đúng phông vì canvas dùng chính phông web), ảnh lấy từ ảnh gốc; ảnh nào không đọc được thì dùng bản xem và báo lại. */
const PRINT={trimW:165,trimH:235,bleed:3,slug:7,wrap:15,ppi:300,spine:{24:6.8,32:8.5,40:10.2}};
const MM=PRINT.ppi/25.4;
let JSPDF_P=null;
function loadJsPDF(){if(window.jspdf)return Promise.resolve();if(JSPDF_P)return JSPDF_P;
  JSPDF_P=new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=ok;s.onerror=()=>no(new Error('không tải được thư viện PDF (cần mạng)'));document.head.appendChild(s)});return JSPDF_P}
const imgCache=new Map();
function loadImg(src){if(imgCache.has(src))return imgCache.get(src);const p=new Promise((ok,no)=>{const i=new Image();i.decoding='async';i.onload=()=>ok(i);i.onerror=()=>no(new Error('ảnh lỗi'));i.src=src});imgCache.set(src,p);return p}
function artImage(id){const a=ART[id];if(!a)return Promise.resolve(null);
  const vb=(a.vb||'0 0 200 200').split(/\s+/).map(Number);
  const svg=artSVG(id,`width="1200" height="${Math.round(1200*vb[3]/vb[2])}"`);
  return loadImg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)).catch(()=>null)}
function artRatio(id){const vb=(ART[id]&&ART[id].vb||'0 0 200 200').split(/\s+/).map(Number);return vb[3]/vb[2]}

/* vẽ 1 trang (pg) vào ctx, gốc toạ độ = góc trên-trái vùng thành phẩm (mm), có tràn lề */
async function drawPage(ctx,pg,ox,oy,photoSrcOf,opt){
  opt=opt||{};const W=PRINT.trimW,H=PRINT.trimH,b=opt.noBleed?0:PRINT.bleed;
  const X=mm=>(ox+mm)*MM, Y=mm=>(oy+mm)*MM;
  ctx.fillStyle=pg.bg||'#FFFEFB';ctx.fillRect(X(-(opt.bleedL!=null?opt.bleedL:b)),Y(-b),(W+(opt.bleedL!=null?opt.bleedL:b)+(opt.bleedR!=null?opt.bleedR:b))*MM,(H+2*b)*MM);
  for(const fr of pg.frames||[]){
    if(!fr.ph)continue;const src=photoSrcOf(fr.ph);if(!src)continue;
    let [x,y,w,h]=fr.f;let fx=x/100*W,fy=y/100*H,fw=w/100*W,fh=h/100*H;
    if(x<=0){fx-=b;fw+=b}if(x+w>=100)fw+=b;if(y<=0){fy-=b;fh+=b}if(y+h>=100)fh+=b;
    let im;try{im=await loadImg(src)}catch(e){continue}
    const s=Math.max(fw/im.naturalWidth,fh/im.naturalHeight),iw=im.naturalWidth*s,ih=im.naturalHeight*s;
    const px=(fr.px==null?50:fr.px)/100,py=(fr.py==null?50:fr.py)/100,z=fr.z||1;
    let dx=-(iw-fw)*px,dy=-(ih-fh)*py;const ox2=fw*px,oy2=fh*py;
    dx=ox2+(dx-ox2)*z;dy=oy2+(dy-oy2)*z;
    ctx.save();ctx.beginPath();ctx.rect(X(fx),Y(fy),fw*MM,fh*MM);ctx.clip();
    ctx.drawImage(im,X(fx+dx),Y(fy+dy),iw*z*MM,ih*z*MM);ctx.restore();
  }
  const U=W/300; // 1 đơn vị chữ = 0.55mm
  for(const e of pg.els||[]){
    if(e.k==='a'){const im=await artImage(e.art);if(!im)continue;const ew=e.w/100*W,eh=ew*artRatio(e.art);
      const cx=e.x/100*W,cy=e.y/100*H;ctx.save();ctx.translate(X(cx),Y(cy));if(e.flip)ctx.scale(-1,1);ctx.drawImage(im,-ew/2*MM,-eh/2*MM,ew*MM,eh*MM);ctx.restore();continue}
    if(!e.text)continue;const f=fontOf(e.font);const size=e.size*U*MM;
    ctx.font=`${f.it?'italic ':''}${f.w} ${size}px ${f.css}`;ctx.fillStyle=e.color;ctx.textBaseline='alphabetic';
    const boxW=e.w/100*W*MM;const lines=wrapText(ctx,e.text,boxW);const lh=size*1.05;const totalH=lines.length*lh;
    const cx=X(e.x/100*W),cy=Y(e.y/100*H);const top=cy-totalH/2;
    const m=ctx.measureText('Hg');const asc=m.actualBoundingBoxAscent!=null?(lh-(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent))/2+m.actualBoundingBoxAscent:lh*.8;
    lines.forEach((ln,i)=>{const lw=ctx.measureText(ln).width;let lx=e.align==='left'?cx-boxW/2:e.align==='right'?cx+boxW/2-lw:cx-lw/2;ctx.fillText(ln,lx,top+i*lh+asc)});
  }
}
function wrapText(ctx,text,maxW){const out=[];String(text).split('\n').forEach(par=>{const words=par.split(/(\s+)/);let line='';
  for(const w of words){const t=line+w;if(ctx.measureText(t).width<=maxW||!line.trim()){if(ctx.measureText(t).width>maxW&&!line.trim()){let cur='';for(const ch of w){if(ctx.measureText(cur+ch).width>maxW&&cur){out.push(cur);cur=ch}else cur+=ch}line=cur}else line=t}
    else{out.push(line.replace(/\s+$/,''));line=w.replace(/^\s+/,'')}}
  out.push(line.replace(/\s+$/,''))});return out}
function cropMarks(ctx,x0,y0,w,h,extraX){ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=.25*MM;const L=5*MM,g=(PRINT.bleed+1)*MM;
  const xs=[x0*MM,(x0+w)*MM].concat((extraX||[]).map(v=>v*MM)),ys=[y0*MM,(y0+h)*MM];
  xs.forEach((x,k)=>{const fold=k>1;ctx.setLineDash(fold?[1*MM,1*MM]:[]);ys.forEach((y,j)=>{const dir=j?1:-1;ctx.beginPath();ctx.moveTo(x,y+dir*g);ctx.lineTo(x,y+dir*(g+L));ctx.stroke()})});
  ctx.setLineDash([]);ys.forEach(y=>[x0*MM,(x0+w)*MM].forEach((x,k)=>{const dir=k?1:-1;ctx.beginPath();ctx.moveTo(x+dir*g,y);ctx.lineTo(x+dir*(g+L),y);ctx.stroke()}));ctx.restore()}
function slugLabel(ctx,text,x,y){ctx.save();ctx.fillStyle='#000';ctx.font=`500 ${2.2*MM}px Montserrat, sans-serif`;ctx.fillText(text,x*MM,y*MM);ctx.restore()}

function interiorPages(book){const out=[];book.spreads.forEach(sp=>{if(sp.kind==='cover')return;['L','R'].forEach(s=>{const pg=sp[s];if(pg&&!pg.dark)out.push(pg)})});return out}

/* photoSrcOf(id) → dataURL ảnh tốt nhất đang có; onProg(text) báo tiến độ */
async function exportInteriorPDF(book,code,photoSrcOf,onProg){
  await loadJsPDF();const {jsPDF}=window.jspdf;
  const s=PRINT.bleed+PRINT.slug,PW=PRINT.trimW+2*s,PH=PRINT.trimH+2*s;
  const pages=interiorPages(book);const doc=new jsPDF({unit:'mm',format:[PW,PH],orientation:'portrait',compress:true});
  const cv=document.createElement('canvas');cv.width=Math.round(PW*MM);cv.height=Math.round(PH*MM);const ctx=cv.getContext('2d');
  for(let i=0;i<pages.length;i++){
    onProg&&onProg(`đang dựng trang ${i+1}/${pages.length}…`);
    ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,cv.width,cv.height);
    await drawPage(ctx,pages[i],s,s,photoSrcOf);
    cropMarks(ctx,s,s,PRINT.trimW,PRINT.trimH);
    slugLabel(ctx,`${code} · ruột · trang ${i+1}/${pages.length} · ${PRINT.trimW}×${PRINT.trimH}mm + tràn lề ${PRINT.bleed}mm · ${PRINT.ppi}ppi`,s,s-PRINT.bleed-3.2);
    if(i)doc.addPage([PW,PH],'portrait');
    doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',0,0,PW,PH,undefined,'FAST');
    await new Promise(r=>setTimeout(r,0));
  }
  onProg&&onProg('đang ghi file…');doc.save(`${code}-ruot-${pages.length}trang.pdf`);return pages.length;
}
async function exportCoverPDF(book,code,tier,photoSrcOf,onProg){
  await loadJsPDF();const {jsPDF}=window.jspdf;
  const sp=book.spreads[0],spine=PRINT.spine[tier]||8.5,wr=PRINT.wrap,sl=PRINT.slug+PRINT.bleed;
  const innerW=wr+PRINT.trimW+spine+PRINT.trimW+wr,innerH=wr+PRINT.trimH+wr,PW=innerW+2*sl,PH=innerH+2*sl;
  const cv=document.createElement('canvas');cv.width=Math.round(PW*MM);cv.height=Math.round(PH*MM);const ctx=cv.getContext('2d');
  ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,cv.width,cv.height);
  const x0=sl,y0=sl;onProg&&onProg('đang dựng bìa trải phẳng…');
  /* nền: bìa sau kéo sang phần gập trái, bìa trước kéo sang phần gập phải, gáy cùng màu bìa trước */
  ctx.fillStyle=sp.L.bg;ctx.fillRect((x0-PRINT.bleed)*MM,(y0-PRINT.bleed)*MM,(wr+PRINT.trimW+PRINT.bleed)*MM,(innerH+2*PRINT.bleed)*MM);
  ctx.fillStyle=sp.R.bg;ctx.fillRect((x0+wr+PRINT.trimW)*MM,(y0-PRINT.bleed)*MM,(spine+PRINT.trimW+wr+PRINT.bleed)*MM,(innerH+2*PRINT.bleed)*MM);
  await drawPage(ctx,sp.L,x0+wr,y0+wr,photoSrcOf,{noBleed:true});
  await drawPage(ctx,sp.R,x0+wr+PRINT.trimW+spine,y0+wr,photoSrcOf,{noBleed:true});
  /* chữ gáy */
  const t=sp.R.els.find(e=>e.role==='title');const f=fontOf(t?t.font:'paytone');
  ctx.save();ctx.translate((x0+wr+PRINT.trimW+spine/2)*MM,(y0+wr+PRINT.trimH/2)*MM);ctx.rotate(Math.PI/2);
  ctx.font=`${f.it?'italic ':''}${f.w} ${Math.min(spine*.5,5)*MM}px ${f.css}`;ctx.fillStyle=t?t.color:'#2E2E2E';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(((t?t.text:'')+'  ·  OUR ARCHIVE').replace(/\n/g,' '),0,0);ctx.restore();
  cropMarks(ctx,x0,y0,innerW,innerH,[x0+wr,x0+wr+PRINT.trimW,x0+wr+PRINT.trimW+spine,x0+innerW-wr]);
  /* vạch gập ngang trên/dưới */
  ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=.25*MM;ctx.setLineDash([1*MM,1*MM]);[y0+wr,y0+innerH-wr].forEach(y=>{[[x0-PRINT.bleed-1-5,x0-PRINT.bleed-1],[x0+innerW+PRINT.bleed+1,x0+innerW+PRINT.bleed+6]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a*MM,y*MM);ctx.lineTo(b*MM,y*MM);ctx.stroke()})});ctx.restore();
  slugLabel(ctx,`${code} · bìa trải phẳng · gập ${wr}mm | bìa sau ${PRINT.trimW}mm | gáy ${spine}mm (gói ${tier} trang) | bìa trước ${PRINT.trimW}mm | gập ${wr}mm · cao ${PRINT.trimH}mm + gập 2×${wr}mm · ${PRINT.ppi}ppi`,x0,y0-PRINT.bleed-3.2);
  const doc=new jsPDF({unit:'mm',format:[PW,PH],orientation:'landscape',compress:true});
  doc.addImage(cv.toDataURL('image/jpeg',.93),'JPEG',0,0,PW,PH,undefined,'FAST');
  onProg&&onProg('đang ghi file…');doc.save(`${code}-bia-trai-phang-gay${String(spine).replace('.',',')}mm.pdf`);
}
