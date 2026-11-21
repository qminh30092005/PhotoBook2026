/* ===== State & storage ===== */
const S={screen:'shop',tier:32,tpl:'dalat',photos:[],book:null,cur:0,sel:null,editing:null,tab:'photos',pick:null,side:'R',undo:[],redo:[],code:null,panelOpen:false};
const $=s=>document.querySelector(s);
const app=()=>$('#app');
const LS='oa-studio-v2';
function saveMeta(){if(S.admin){setSaved(S.undo&&S.undo.length?'Chưa lưu lên shop':'Đã lưu lên shop');return}try{localStorage.setItem(LS,JSON.stringify({screen:S.screen==='magic'?'allset':S.screen,tier:S.tier,tpl:S.tpl,book:S.book,cur:S.cur,code:S.code,photos:S.photos.map(p=>({id:p.id,w:p.w,h:p.h,ow:p.ow,oh:p.oh,ch:p.ch,man:p.man,name:p.name,sample:p.sample}))}));setSaved('Đã lưu')}catch(e){setSaved('Không lưu được trên trình duyệt này')}}
let saveT;function queueSave(){clearTimeout(saveT);setSaved(S.admin?'Chưa lưu lên shop':'Đang lưu…');saveT=setTimeout(saveMeta,600)}
function setSaved(t){const el=$('#saveSt');if(el)el.textContent=t}
/* IndexedDB: 'p' = bản xem (≤1600px, dataURL) · 'orig' = file ảnh gốc (Blob) để gửi xưởng in */
let DB;function idb(){return new Promise((res,rej)=>{if(DB)return res(DB);try{const r=indexedDB.open('oa-photos',2);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('p'))d.createObjectStore('p');if(!d.objectStoreNames.contains('orig'))d.createObjectStore('orig')};r.onsuccess=()=>{DB=r.result;res(DB)};r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function idbPut(store,key,val){try{const db=await idb();await new Promise((ok,no)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(val,key);tx.oncomplete=ok;tx.onerror=()=>no(tx.error)});return true}catch(e){return false}}
async function idbGet(store,key){try{const db=await idb();return await new Promise(r=>{const q=db.transaction(store).objectStore(store).get(key);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})}catch(e){return null}}
async function putPhoto(p){if(S.admin)return;await idbPut('p',p.id,p.src);if(p.file)await idbPut('orig',p.id,p.file)}
async function getPhoto(id){return idbGet('p',id)}
async function getOrig(id){return idbGet('orig',id)}
async function clearPhotos(){try{const db=await idb();['p','orig'].forEach(s=>db.transaction(s,'readwrite').objectStore(s).clear())}catch(e){}}
async function restore(){
  let m=null;try{m=JSON.parse(localStorage.getItem(LS)||'null')}catch(e){}
  if(!m)return false;
  Object.assign(S,{tier:m.tier,tpl:m.tpl,book:m.book,cur:m.cur||0,code:m.code});
  const ph=[];for(const p of m.photos||[]){const src=await getPhoto(p.id);if(src)ph.push(Object.assign({},p,{src}))}
  S.photos=ph;S.screen=m.screen==='editor'&&S.book?'editor':(ph.length?'allset':'shop');
  return true;
}
const toast=(t)=>{const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2200)};
const ICON={undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',proj:'<path d="M4 6h16M4 12h10M4 18h7"/>',save:'<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 10 4 4 0 0 1 18 18z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
 photo:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>',text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',art:'<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>',layout:'<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M12 4v16M3 12h9"/>',plus:'<path d="M12 5v14M5 12h14"/>',left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',flip:'<path d="M12 3v18M8 7L4 12l4 5M16 7l4 5-4 5"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4h12"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',magic:'<path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M17.8 6.2l1.4-1.4M3 21l9-9"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',color:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18"/>'};
const ic=(n,c)=>`<svg class="ic${c?' '+c:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]||''}</svg>`;

/* ===== sample photos (illustrative, no real people) ===== */
function samplePhoto(i){
  const o=['P','L','P','S','L','P','P','L','S'][(i*5+2)%9], [w,h]=o==='P'?[720,900]:o==='L'?[1000,680]:[820,820];
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  const skies=[['#F7D9CB','#E9A28F'],['#CFE6EE','#86B9CF'],['#EADFF3','#B8A2D6'],['#F4E7C3','#E2B65F'],['#DDEBD9','#93B48A'],['#F7D6DE','#D98CA2'],['#D9E4F5','#8DA5D6'],['#EFE3D3','#C4A182']];
  const [a,b]=skies[i%skies.length];const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.arc(w*(.2+(i*37%60)/100),h*.28,Math.min(w,h)*.09,0,7);x.fill();
  x.fillStyle=b;x.beginPath();x.moveTo(0,h*.72);x.quadraticCurveTo(w*.3,h*.6,w*.55,h*.7);x.quadraticCurveTo(w*.8,h*.78,w,h*.66);x.lineTo(w,h);x.lineTo(0,h);x.fill();
  x.fillStyle='rgba(40,30,35,.55)';const cx=w*.5,base=h*.86,s=Math.min(w,h)*.0022;
  [[-26,0],[26,8]].forEach(([dx,dy],k)=>{x.beginPath();x.arc(cx+dx*s*10,base-150*s*(k?0.92:1)+dy*s,16*s*10/10*1.4,0,7);x.fill();x.beginPath();x.ellipse(cx+dx*s*10,base-60*s+dy*s,26*s,70*s*(k?0.92:1),0,0,7);x.fill()});
  x.fillStyle='rgba(255,255,255,.85)';x.font=`600 ${Math.round(w*.03)}px Montserrat, sans-serif`;x.fillText('Ảnh mẫu '+String(i+1).padStart(2,'0'),w*.04,h*.07);
  return {id:'s'+Date.now().toString(36)+i,name:'Ảnh mẫu '+(i+1),w,h,sample:1,src:c.toDataURL('image/jpeg',.82)};
}
function readFiles(files){
  const list=[...files].filter(f=>/^image\//.test(f.type));
  return Promise.all(list.map((f,i)=>new Promise(res=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,1600/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res({id:'u'+Date.now().toString(36)+i+Math.random().toString(36).slice(2,5),name:f.name,w:c.width,h:c.height,ow:im.width,oh:im.height,file:f,src:c.toDataURL('image/jpeg',.85)})};im.onerror=()=>res(null);im.src=r.result};r.onerror=()=>res(null);r.readAsDataURL(f)}))).then(a=>a.filter(Boolean));
}
function addPhotos(list){
  list.forEach(p=>{S.photos.push(p);putPhoto(p)});if(list.length)track('upload_photos',{count:list.length});
  const auto=S.photos.filter(p=>!p.man);const n=auto.length;
  auto.forEach((p,i)=>p.ch=i<Math.ceil(n/3)?1:i<Math.ceil(2*n/3)?2:3);
  queueSave();
}
function pickFiles(cb){const i=document.createElement('input');i.type='file';i.accept='image/*';i.multiple=true;i.onchange=async()=>{const l=await readFiles(i.files);cb(l)};i.click()}

/* ===== SHOP ===== */
function miniBook(tp,pw){return tp.custom?`<div class="custom-tile" style="width:${pw}px;height:${pw*RATIO}px">+</div>`:`<div class="mini">${frontOnlyHTML(tp,pw)}</div>`}
function renderShop(){if(!renderShop._t){renderShop._t=1;track('view_product',{})}
  const t=tierOf(S.tier), tp=tplOf(S.tpl), q=(S.q||'');
  const list=[...TPL,CUSTOM].filter(x=>!q||strip(x.name+' '+(x.title||'')+' '+(ART[x.art]?ART[x.art].name:'')).includes(strip(q)));
  app().innerHTML=`
  <header class="shop-top wrap"><div class="logo"><b>our</b> archive</div><span class="muted" style="font-size:12px">Photobook cặp đôi · in tại Hà Nội</span></header>
  <main class="shop wrap">
    <section class="hero-book" aria-label="Xem trước bìa">
      <button class="hero-nav l" id="hPrev" aria-label="Mẫu trước">${ic('left')}</button>
      <div class="book3d">${book3D(tp,Math.min(300,Math.round(innerWidth*.55)))}</div>
      <button class="hero-nav r" id="hNext" aria-label="Mẫu sau">${ic('right')}</button>
    </section>
    <section class="shop-info">
      <h1>Photobook cặp đôi</h1>
      <div class="price-line"><span class="muted" style="font-weight:600">${t.pages} trang · </span><span class="big">${vnd(t.price)}</span> <span class="badge">Cọc 50%: ${vnd(dep(t.price))}</span></div>
      <div class="tpl-box"><label class="search">${ic('search')}<input id="q" placeholder="Tìm mẫu bìa cho kỷ niệm của hai bạn" value="${esc(q)}"></label>
        <div class="tpl-grid">${list.map(x=>`<button class="tpl${x.id===S.tpl?' on':''}" data-tpl="${x.id}">${miniBook(x,78)}<span>${x.name}</span></button>`).join('')||'<p class="muted">Không tìm thấy mẫu nào.</p>'}</div></div>
      <div class="divider-t">Chọn số trang</div>
      <div class="tiers">${TIERS.map(x=>`<button class="tier${x.id===S.tier?' on':''}" data-tier="${x.id}">
        ${x.tag?`<span class="tag">${x.tag}</span>`:''}<b>${x.pages} trang</b><span class="tp">${vnd(x.price)}</span><small>Tối đa ${x.max} ảnh · ${x.motifs} hình vẽ</small></button>`).join('')}</div>
      <button class="pill block" id="start">Bắt đầu thiết kế</button>
      <p class="muted" style="margin:0;font-size:12px">Chọn một mẫu bìa, bấm “Bắt đầu thiết kế”, mẫu sẽ hiện sẵn trong trình thiết kế để hai bạn sửa chữ, đổi hình.</p>
      <span class="note-chip">Ship 20k nội thành Hà Nội · 30k tỉnh khác · chuyển khoản đủ 100% được miễn ship · tặng ${t.gift}</span><span class="note-chip">Từ cuốn thứ 2 cùng thiết kế giảm ${Math.round(CONFIG.SECOND_COPY_DISCOUNT*100)}% · giao ${CONFIG.DELIVERY_DAYS} sau khi hai bạn duyệt bản thiết kế</span>
      <div class="specs"><span>Khổ</span><b>B5 nhỡ 16,5 × 23,5 cm</b><span>Bìa</span><b>Bìa cứng matte, gáy vuông</b><span>Ruột</span><b>Giấy mỹ thuật 200gsm</b><span>Số trang</span><b>${t.pages} trang · tối đa ${t.max} ảnh</b><span>Hình vẽ</span><b>${t.motifs} mẫu · tối đa ${t.stickers} hình trên cả quyển</b></div>
    </section>
  </main>`;
  app().onclick=e=>{const b=e.target.closest('[data-tier],[data-tpl],#start,#hPrev,#hNext');if(!b)return;
    if(b.dataset.tier){S.tier=+b.dataset.tier;renderShop()}
    else if(b.dataset.tpl){S.tpl=b.dataset.tpl;track('select_template',{template:S.tpl});renderShop()}
    else if(b.id==='start'){track('select_template',{template:S.tpl,tier:S.tier});S.screen='allset';S.book=null;render();}
    else{const all=[...TPL,CUSTOM];const i=all.findIndex(x=>x.id===S.tpl);S.tpl=all[(i+(b.id==='hNext'?1:all.length-1))%all.length].id;renderShop()}};
  const qi=$('#q');qi.oninput=()=>{S.q=qi.value;const pos=qi.selectionStart;renderShop();const n=$('#q');n.focus();n.setSelectionRange(pos,pos)};
}
function book3D(tp,pw){
  const ph=pw*RATIO, sw=22;
  const title=tp.custom?'TÊN CUỐN SÁCH':tp.title, f=fontOf(tp.font||'paytone');
  return `<div class="book3d-in" style="width:${pw}px;height:${ph}px">${tp.custom?`<div class="custom-tile" style="width:${pw}px;height:${ph}px;font-size:60px">+</div>`:frontOnlyHTML(tp,pw)}
   <div class="book3d-spine" style="width:${sw}px;background:${tp.bg}"><span style="font-family:${f.css};font-weight:${f.w};color:${tp.ink};font-size:11px">${esc(title)} · OUR ARCHIVE</span></div>
   <div class="book3d-pages" style="left:${pw}px"></div><div class="book3d-shadow"></div></div>`;
}

/* ===== ALL SET (upload) ===== */
function chCounts(){return [1,2,3].map(c=>S.photos.filter(p=>p.ch===c).length)}
function renderAllset(){
  const t=tierOf(S.tier), n=S.photos.length, cc=chCounts(), ok=cc.every(x=>x>=MIN_CH)&&n>=12;
  app().innerHTML=`<div class="flow">
   <div class="flow-main">
     <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><button class="ghost sm" id="back">${ic('left')} Mẫu bìa</button><div class="logo" style="font-size:16px"><b>our</b> archive</div></div>
     <p class="hint-bar">Ảnh gốc của hai bạn được giữ nguyên chất lượng để in. Ảnh được chia vào 3 chương theo thứ tự tải lên. Rê chuột vào ảnh để chuyển chương hoặc bỏ ảnh. Mỗi chương cần ít nhất ${MIN_CH} ảnh.</p>
     ${n?[1,2,3].map(c=>`<section class="ch-group"><div class="ch-head"><h3>Chương ${CHAPTERS[c-1].no} · ${CHAPTERS[c-1].t}</h3><span class="st ${cc[c-1]>=MIN_CH?'ok':'warn'}">${cc[c-1]>=MIN_CH?'✓ '+cc[c-1]+' ảnh':cc[c-1]+'/'+MIN_CH+' ảnh tối thiểu'}</span></div>
       <div class="ph-grid">${S.photos.filter(p=>p.ch===c).map(p=>`<div class="ph" tabindex="0"><img src="${p.src}" alt="${esc(p.name)}"><div class="ph-tools"><button data-mv="${p.id}" data-d="-1" ${c===1?'disabled':''}>‹ ch.${c-1||''}</button><button data-rm="${p.id}">Bỏ</button><button data-mv="${p.id}" data-d="1" ${c===3?'disabled':''}>ch.${c<3?c+1:''} ›</button></div></div>`).join('')}</div></section>`).join('')
       :`<div class="drop" id="bigDrop" style="padding:60px 20px;font-size:14px">${ic('upload')}Kéo ảnh của hai bạn vào đây<small>hoặc bấm để chọn từ máy tính / điện thoại</small></div>`}
   </div>
   <aside class="flow-side">
     <h2>Sẵn sàng chưa?</h2><p class="muted" style="margin:0;font-size:12px">Không cần chờ ảnh tải xong, cứ tiếp tục nhé.</p>
     <div class="drop" id="drop" tabindex="0" role="button">${ic('upload')}Thêm ảnh<small>Kéo thả hoặc bấm để chọn ảnh</small></div>
     <button class="ghost sm" id="samples">${ic('photo')} Dùng bộ ảnh mẫu (${t.max} ảnh)</button>
     <p style="margin:6px 0 0;font-weight:700">Để tụi mình dàn trang giúp hai bạn.</p>
     <div class="toggle"><span>Đã chọn <b>${n}</b> ảnh · gói ${t.pages} trang tối đa <b>${t.max}</b></span></div>
     ${n>t.max?`<p class="st warn" style="margin:0;font-size:11.5px">${n-t.max} ảnh dư sẽ để trong kho ảnh, hai bạn tự kéo vào sau.</p>`:''}
     ${!ok&&n?`<p class="st warn" style="margin:0;font-size:11.5px">Mỗi chương cần ít nhất ${MIN_CH} ảnh để dàn trang.</p>`:''}
     <button class="pill block" id="magic" ${ok?'':'disabled'}>Làm phép màu ${ic('right')}</button>
     <p class="muted" style="margin:10px 0 0;font-size:12px">Hoặc tự làm từ đầu</p>
     <button class="ghost" id="manual" ${n?'':'disabled'}>Vào trình thiết kế ${ic('right')}</button>
   </aside></div>`;
  const drop=el=>{if(!el)return;el.onclick=()=>pickFiles(l=>{addPhotos(l);renderAllset()});el.onkeydown=e=>{if(e.key==='Enter')el.click()};el.ondragover=e=>{e.preventDefault();el.classList.add('over')};el.ondragleave=()=>el.classList.remove('over');el.ondrop=async e=>{e.preventDefault();addPhotos(await readFiles(e.dataTransfer.files));renderAllset()}};
  drop($('#drop'));drop($('#bigDrop'));
  app().onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.id==='back'){S.screen='shop';render()}
    else if(b.id==='samples'){const k=S.photos.length;addPhotos(Array.from({length:Math.max(0,t.max-k)},(_,i)=>samplePhoto(k+i)));renderAllset()}
    else if(b.dataset.rm){S.photos=S.photos.filter(p=>p.id!==b.dataset.rm);queueSave();renderAllset()}
    else if(b.dataset.mv){const p=S.photos.find(x=>x.id===b.dataset.mv);p.ch=Math.min(3,Math.max(1,p.ch+ +b.dataset.d));p.man=1;queueSave();renderAllset()}
    else if(b.id==='magic'){track('magic',{photos:S.photos.length});S.screen='magic';render()}
    else if(b.id==='manual'){buildBook(true);S.screen='editor';render()}};
}
function defaultNotes(){const t=tierOf(S.tier);const sl={3:[1,1,1],4:[2,1,1],5:[2,2,1]}[t.notes];
  const pool={1:['Lần đầu gặp nhau, chẳng ai nghĩ sẽ đi cùng nhau xa đến vậy.','Hôm ấy trời mưa phùn, anh quên mang ô, em cũng thế.'],2:['Những chuyến đi nhỏ, những bữa cơm cháy nửa nồi.','Có lần giận nhau cả tuần, rồi làm lành bằng một ly trà sữa.'],3:['Mình đã đi qua đủ bốn mùa của nhau.']};
  const o={};[1,2,3].forEach(c=>o[c]=pool[c].slice(0,sl[c-1]));return o}
function buildBook(empty){
  const t=tierOf(S.tier);const ph=S.photos.slice(0,t.max);
  S.book=newBook(S.tpl,S.tier,ph,defaultNotes());
  if(empty)S.book.spreads.forEach(sp=>[sp.L,sp.R].forEach(pg=>pg.frames&&pg.frames.forEach(f=>f.ph=null)));
  S.cur=0;S.sel=null;S.undo=[];S.redo=[];queueSave();
}

/* ===== MAGIC ===== */
function renderMagic(){
  const R=86,C=2*Math.PI*R;
  app().innerHTML=`<div class="magic"><h1 id="mTitle">Tụi mình đang làm phép màu!</h1><div class="magic-row">
   <div><div class="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="${R}" fill="none" stroke="#EDEDEB" stroke-width="12"/><circle id="arc" cx="100" cy="100" r="${R}" fill="none" stroke="#2E2E2E" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 100 100)"/></svg><img id="mImg" src="${(S.photos[0]||{}).src||''}" alt=""></div><div class="ring-pct" id="pct">0%</div></div>
   <ul class="steps" style="padding:0;margin:0"><li id="s0"><span class="dot"></span>Chuẩn bị ảnh của hai bạn</li><li id="s1"><span class="dot"></span>Chia ảnh theo 3 chương</li><li id="s2"><span class="dot"></span>Dàn trang thành câu chuyện</li></ul></div></div>`;
  let p=0;const t0=performance.now(),D=3400;
  const step=now=>{p=Math.min(100,Math.round((now-t0)/D*100));$('#pct').textContent=p+'%';$('#arc').setAttribute('stroke-dashoffset',C*(1-p/100));
    const k=Math.floor(p/34);[0,1,2].forEach(i=>{const li=$('#s'+i);li.className=i<k||p===100?'done':i===k?'on':'';li.querySelector('.dot').innerHTML=(i<k||p===100)?ic('check'):''});
    const im=S.photos[Math.floor(p/8)%Math.max(1,S.photos.length)];if(im)$('#mImg').src=im.src;
    if(p<100)requestAnimationFrame(step);else{$('#arc').setAttribute('stroke','#1F9D63');$('#mTitle').textContent='Cuốn sách đã sẵn sàng';buildBook(false);setTimeout(()=>{S.screen='editor';render()},1100)}};
  requestAnimationFrame(step);
}
