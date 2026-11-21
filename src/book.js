/* ===== Book model & rendering ===== */
let UID=1; const uid=()=>'e'+(UID++)+Math.random().toString(36).slice(2,5);
const RATIO=235/165;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function fitSize(text,max,width){const n=Math.max(1,[...String(text)].length);return Math.round(Math.min(max,width/(n*.62)))}
function T(text,o){return Object.assign({id:uid(),k:'t',text,font:'paytone',size:14,color:'#2E2E2E',x:50,y:50,w:84,align:'center'},o)}
function A(art,o){return Object.assign({id:uid(),k:'a',art,x:50,y:60,w:70,flip:0},o)}
function frontEls(tp){
  const f=tp.font||'paytone';
  if(tp.textOnly) return [T(tp.title,{font:f,size:tp.big,color:tp.ink,y:44,w:92,role:'title'}),T(tp.subt,{font:'montserrat',size:11,color:tp.sub,y:tp.big>100?66:56,role:'sub'}),T('HOÀI MINH & QUỲNH MINH',{font:'montserrat',size:8.5,color:tp.ink,y:90,role:'couple'})];
  if(tp.mode==='bleed') return [T(tp.title,{font:f,size:Math.min(108,fitSize(tp.title,108,330)),color:tp.ink,x:47,y:15,w:118,align:'left',role:'title'}),
    T(tp.subt,{font:f,size:fitSize(tp.subt,17,200),color:tp.sub,x:52,y:31,w:84,align:'right',role:'sub'}),
    A(tp.art,{x:50,y:66,w:84,main:1})];
  return [T(tp.title,{font:f,size:fitSize(tp.title,54,250),color:tp.ink,y:12.5,w:90,role:'title'}),
    T(tp.subt,{font:f,size:fitSize(tp.subt,16,220),color:tp.sub,x:52,y:22.5,w:84,align:'right',role:'sub'}),
    A(tp.art,tp.place?{x:50,y:63,w:90,main:1}:{x:50,y:62,w:68,main:1})];
}
function newBook(tplId,tier,photos,notes){
  const tp=tplOf(tplId), t=tierOf(tier);
  const ids=photos.slice(0,t.max);
  const back={bg:tp.bg,frames:[[9,8,39,31],[52,8,39,31],[9,42,39,31],[52,42,39,31]].map((f,i)=>({f,ph:(ids[i]||{}).id||null})),
    els:[T(tp.title,{font:tp.font||'paytone',size:fitSize(tp.title,30,200),color:tp.ink==='#FFFFFF'?tp.sub:tp.ink,y:83,w:80,role:'btitle'}),T('2026',{font:tp.font||'paytone',size:14,color:tp.sub,y:90.5,role:'byear'})]};
  const front={bg:tp.bg,frames:[],els:frontEls(tp)};
  const cover={kind:'cover',L:back,R:front};
  const ded={bg:'#FFFEFB',frames:[],els:[T('LỜI MỞ ĐẦU',{font:'montserrat',size:7,color:'#8A8A86',y:30}),T('Cảm ơn vì đã đến, đã ở lại, và đã biến những ngày bình thường nhất thành một cuốn sách đáng để lật giở suốt đời.',{font:'cormorant',size:15,color:'#2E2E2E',y:50,w:74}),T('Thương gửi người luôn ở cạnh',{font:'dancing',size:15,color:'#B23A5B',y:70,w:80})]};
  const open={kind:'open',L:{dark:1,locked:1,frames:[],els:[]},R:ded};
  const inner=autoLayout(ids,t.pages,notes).map(s=>spreadFrom(s));
  const close={kind:'close',L:{bg:'#FFFEFB',frames:[],els:[T('Hết tập 01',{font:'dancing',size:20,color:'#2E2E2E',y:46}),T('— Còn nhiều trang nữa của tụi mình —',{font:'lora',size:8,color:'#8A8A86',y:54,w:80})]},R:{dark:1,locked:1,frames:[],els:[]}};
  return {tpl:tp.id,cover:{bg:tp.bg,ink:tp.ink},spreads:[cover,open,...inner,close]};
}
function spreadFrom(s){
  const key=s.L==='F'&&s.ph.length>1?'F2':s.L; const fr=FR[key]; let i=0;
  const mk=side=>fr[side].map(f=>({f,ph:s.ph[i++]||null}));
  const L={bg:'#FFFEFB',frames:mk('L'),els:[]}, R={bg:'#FFFEFB',frames:mk('R'),els:[]};
  const ch=CHAPTERS[s.ch-1];
  if(s.L==='F'){L.bg=ch.bg;L.els=[T('CHƯƠNG',{font:'montserrat',size:7,color:ch.ink,x:30,y:30,w:44,align:'left'}),T(ch.no,{font:'cormorant',size:70,color:ch.ink,x:30,y:41,w:44,align:'left'}),T(ch.t,{font:'playfair',size:20,color:ch.ink,x:44,y:55,w:72,align:'left'}),T(s.note||'',{font:'lora',size:9,color:ch.ink,x:44,y:68,w:72,align:'left',role:'note'})];if(!s.note)L.els.pop()}
  if(s.L==='A')R.els=[T('CHƯƠNG '+ch.no,{font:'montserrat',size:6.5,color:'#8A8A86',x:50,y:42,w:68,align:'left'}),T(s.note||'Một ngày bình thường của tụi mình.',{font:'lora',size:11,color:'#2E2E2E',x:50,y:52,w:68,align:'left',role:'note'})];
  if(s.L==='E')R.els=[T('01.09',{font:'cormorant',size:40,color:'#B23A5B',x:50,y:46,w:68,align:'left'}),T('Một ngày bình thường của tụi mình.',{font:'lora',size:9,color:'#2E2E2E',x:50,y:55,w:68,align:'left'})];
  return {kind:'inner',lay:s.L,ch:s.ch,L,R};
}
function relayout(sp,lay){
  const phs=[...sp.L.frames,...sp.R.frames].map(f=>f.ph).filter(Boolean);
  const keepEls=[...sp.L.els,...sp.R.els].filter(e=>e.k==='a'||e.user);
  const notes=[...sp.L.els,...sp.R.els].filter(e=>e.role==='note').map(e=>e.text);
  const need=lay==='F'?1:LAYOUTS[lay].need;
  const n=spreadFrom({L:lay,ch:sp.ch,ph:phs.slice(0,lay==='F'?Math.min(2,phs.length):need),note:notes[0]||''});
  keepEls.forEach(e=>n.R.els.push(e));
  sp.lay=n.lay;sp.L=n.L;sp.R=n.R;
  return phs.length-Math.min(phs.length,lay==='F'?2:need);
}
/* vị trí & độ phóng ảnh trong khung: fr.px, fr.py (0–100, tâm cắt), fr.z (1–3) */
function imgCropStyle(fr){const px=fr.px==null?50:fr.px,py=fr.py==null?50:fr.py,z=fr.z||1;return `object-position:${px}% ${py}%;transform-origin:${px}% ${py}%;${z!==1?`transform:scale(${z});`:''}`}
function photoSrc(id){const p=S.photos.find(x=>x.id===id);return p?p.src:''}
function pageHTML(pg,pw,o){
  o=o||{};
  if(pg.dark) return `<div class="page dark" style="width:${pw}px;height:${pw*RATIO}px;--u:${pw/300}px" data-side="${o.side}"><div class="endnote"><b>Trang lót bìa</b><small>Giấy lót không in nội dung</small></div></div>`;
  let h=`<div class="page" data-side="${o.side}" style="width:${pw}px;height:${pw*RATIO}px;--u:${pw/300}px;background:${pg.bg||'#FFFEFB'}">`;
  pg.frames.forEach((fr,i)=>{const [x,y,w,hh]=fr.f;const src=fr.ph&&photoSrc(fr.ph);const sel=o.sel&&o.sel.t==='frame'&&o.sel.side===o.side&&o.sel.i===i;
    const low=src&&o.editable&&typeof frameLow==='function'&&frameLow(fr);
    h+=`<div class="frame${sel?' sel':''}${sel&&o.crop?' crop':''}" data-frame="${i}" style="left:${x}%;top:${y}%;width:${w}%;height:${hh}%">${src?`<img src="${src}" alt="" draggable="false" style="${imgCropStyle(fr)}">${low?`<span class="lowres" title="Ảnh hơi nhỏ, in có thể bị mờ">!</span>`:''}`:(o.editable?`<div class="drag-here">Kéo ảnh vào đây<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg></div>`:'')}</div>`});
  pg.els.forEach(e=>{const sel=o.sel&&o.sel.t==='el'&&o.sel.id===e.id;
    if(e.k==='t'){const f=fontOf(e.font);if(!e.text&&!o.editable)return;
      h+=`<div class="el txt${sel?' sel':''}" data-el="${e.id}" style="left:${e.x}%;top:${e.y}%;width:${e.w}%"><div class="t" style="font-family:${f.css};font-weight:${f.w};font-style:${f.it?'italic':'normal'};font-size:calc(var(--u)*${e.size});color:${e.color};text-align:${e.align}"${o.editing===e.id?' contenteditable="true" spellcheck="false"':''}>${esc(e.text)}</div>${sel&&o.editing!==e.id?'<div class="h-rs" data-rs="1"></div>':''}</div>`;}
    else h+=`<div class="el art${sel?' sel':''}" data-el="${e.id}" style="left:${e.x}%;top:${e.y}%;width:${e.w}%;${e.flip?'transform:translate(-50%,-50%) scaleX(-1)':''}">${artSVG(e.art)}${sel?'<div class="h-rs" data-rs="1"></div>':''}</div>`;
  });
  if(o.editable) h+='<div class="guide-v"></div><div class="guide-h"></div>';
  return h+'</div>';
}
function spineHTML(sp,pw){
  const t=sp.R.els.find(e=>e.role==='title'), c=S.book.cover;
  const ink=t?t.color:c.ink, f=fontOf(t?t.font:'paytone');
  const sw=Math.max(6,pw*.055);
  return `<div class="spine" style="width:${sw}px;height:${pw*RATIO}px;background:${sp.R.bg}"><span style="font-family:${f.css};font-weight:${f.w};font-size:${Math.max(4,sw*.42)}px;color:${ink}">${esc((t?t.text:'')+'  ·  OUR ARCHIVE')}</span></div>`;
}
function spreadHTML(sp,pw,o){
  o=o||{};
  if(sp.kind==='cover') return `<div class="spread cover">${pageHTML(sp.L,pw,Object.assign({},o,{side:'L'}))}${spineHTML(sp,pw)}${pageHTML(sp.R,pw,Object.assign({},o,{side:'R'}))}</div>`;
  return `<div class="spread">${pageHTML(sp.L,pw,Object.assign({},o,{side:'L'}))}${pageHTML(sp.R,pw,Object.assign({},o,{side:'R'}))}<div class="gutter"></div></div>`;
}
function spreadLabel(i,b){const sp=b.spreads[i];if(sp.kind==='cover')return 'Bìa';if(sp.kind==='open')return 'Trang 1';const n=b.spreads.length;if(sp.kind==='close')return 'Trang '+((n-2)*2);return 'Trang '+((i-1)*2)+'–'+((i-1)*2+1)}
function frontOnlyHTML(tp,pw){const b={cover:{bg:tp.bg,ink:tp.ink}};const old=S.book;S.book=b;const pg={bg:tp.bg,frames:[],els:frontEls(tp)};const h=pageHTML(pg,pw,{side:'R'});S.book=old;return h}
