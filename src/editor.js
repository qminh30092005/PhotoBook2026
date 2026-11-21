/* ===== EDITOR ===== */
const curSp=()=>S.book.spreads[S.cur];
function findEl(id){for(const sp of S.book.spreads)for(const s of ['L','R']){const pg=sp[s];if(!pg.els)continue;const e=pg.els.find(x=>x.id===id);if(e)return {e,pg,sp,side:s}}return null}
function snapshot(){S.undo.push(JSON.stringify(S.book));if(S.undo.length>60)S.undo.shift();S.redo=[]}
function changed(){queueSave();updateUsed()}
function usage(){const u={};S.book.spreads.forEach(sp=>['L','R'].forEach(s=>(sp[s].els||[]).forEach(e=>{if(e.k==='a'&&!e.main)u[e.art]=(u[e.art]||0)+1})));return u}
function placedCount(){const m={};S.book.spreads.forEach(sp=>['L','R'].forEach(s=>(sp[s].frames||[]).forEach(f=>{if(f.ph)m[f.ph]=(m[f.ph]||0)+1})));return m}
function textLabel(e,sp){return {title:'Tiêu đề bìa',sub:'Dòng phụ bìa',couple:'Tên hai bạn',btitle:'Tiêu đề bìa sau',byear:'Năm (bìa sau)',note:'Lời tâm sự'}[e.role]||(sp.kind==='open'?'Trang lời chúc':'Chữ trên trang')}
function renderEditor(){
  const t=tierOf(S.tier);if(!S.admin&&!renderEditor._t){renderEditor._t=1;track('open_editor',{tier:S.tier})}
  app().innerHTML=`<div class="ed" id="ed">
   <header class="ed-top">
     <div class="logo" style="font-size:17px;margin-right:6px"><b>our</b> archive</div>
     <button class="tb" id="undo" title="hoàn tác (Ctrl+Z)">${ic('undo')}<span>Hoàn tác</span></button>
     <button class="tb" id="redo" title="làm lại (Ctrl+Y)">${ic('redo')}<span>Làm lại</span></button>
     <button class="tb" id="proj">${ic('proj')}<span>Dự án</span></button>
     <div class="used" id="used"></div>
     <span class="save-st" id="saveSt">Đã lưu</span>
     <button class="tb" id="pvBtn">${ic('eye')}<span>Xem lại sách</span></button>
     ${S.admin&&typeof adminTopHTML==='function'?adminTopHTML():`<button class="pill" id="order">${ic('bag')} Đặt sách ${vnd(t.price)}</button>`}
   </header>
   <nav class="tabs" aria-label="Công cụ">${[['photos','photo','Ảnh'],['cover','book','Mẫu bìa'],['text','text','Chữ'],['art','art','Hình vẽ'],['layout','layout','Bố cục']].map(([k,i,l])=>`<button class="tab${S.tab===k?' on':''}" data-tab="${k}">${ic(i)}${l}</button>`).join('')}</nav>
   <aside class="panel${S.panelOpen?'':' closed'}" id="panel"></aside>
   <section class="stage" id="stage"></section>
   <section class="film"><div class="film-bar"><button id="fPrev">‹ Trang trước</button><span id="fLbl"></span><button id="fNext">Trang sau ›</button></div><div class="film-strip" id="film"></div></section>
  </div><div id="menuHost"></div>`;
  if(innerWidth>820)S.panelOpen=true;else S.panelOpen=false;
  $('#panel').classList.toggle('closed',!S.panelOpen);
  bindEditor();renderPanel();renderStage();renderFilm();updateUsed();
}
function updateUsed(){const el=$('#used');if(!el)return;const t=tierOf(S.tier);const m=placedCount();const n=Object.keys(m).length;const tot=Math.min(S.photos.length,t.max);
  el.innerHTML=`Đã dùng ${n}/${tot} ảnh · ${Object.values(usage()).reduce((a,b)=>a+b,0)}/${t.stickers} hình vẽ<div class="bar"><i style="width:${tot?n/tot*100:0}%"></i></div>${t.pages} trang · ${t.name}`;
  $('#undo').disabled=!S.undo.length;$('#redo').disabled=!S.redo.length}
function stageSize(){const st=$('#stage');const r=st.getBoundingClientRect();const sp=curSp();const narrow=innerWidth<=820;
  const W=r.width-(narrow?20:150),H=(narrow&&S.panelOpen?r.height-innerHeight*.48+40:r.height)-(narrow?24:56);const k=sp.kind==='cover'?2.055:2;return Math.max(80,Math.floor(Math.min(W/k,H/RATIO)))}
function renderStage(){
  const st=$('#stage');const pw=stageSize();S.pw=pw;
  st.innerHTML=`<div class="editable" id="book">${spreadHTML(curSp(),pw,{editable:1,sel:S.sel,editing:S.editing})}</div>
   <div class="rail"><button class="tb" data-r="text">${ic('text')}Chữ</button><button class="tb" data-r="art">${ic('art')}Hình vẽ</button><button class="tb" data-r="photo">${ic('photo')}Ảnh</button><button class="tb" data-r="layout">${ic('layout')}Bố cục</button></div>`;
  placeToolbar();
  if(S.editing){const t=st.querySelector(`[data-el="${S.editing}"] .t`);if(t){t.focus();const r=document.createRange();r.selectNodeContents(t);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}}
  $('#fLbl').textContent=spreadLabel(S.cur,S.book)+' / '+(S.book.spreads.length)+' trang đôi';
}
function renderFilm(){
  const f=$('#film');const pw=innerWidth<=820?28:36;
  f.innerHTML=S.book.spreads.map((sp,i)=>`<button class="fs${i===S.cur?' on':''}" data-go="${i}">${spreadHTML(sp,pw,{})}<span>${spreadLabel(i,S.book)}</span></button>`).join('');
  const on=f.querySelector('.fs.on');if(on)on.scrollIntoView({block:'nearest',inline:'center'});
}
function go(i){if(i<0||i>=S.book.spreads.length)return;if(!$('#stage')){S.cur=i;S.sel=null;if(S.admin&&typeof admGo==='function'&&typeof ADM!=='undefined')admGo('editor');return}commitEdit();S.cur=i;S.sel=null;renderStage();renderFilm();if(S.tab==='text'||S.tab==='layout')renderPanel();queueSave()}
/* ---- panel ---- */
function renderPanel(){
  const p=$('#panel');if(!p)return;const t=tierOf(S.tier);const sp=curSp();
  let h='';
  if(S.tab==='photos'){const m=placedCount();
    h=`<button class="p-btn" id="addPh">${ic('upload')} Thêm ảnh</button><button class="p-btn" id="smart">${ic('magic')} Dàn trang tự động lại</button>
    <p class="faint" style="margin:0;font-size:11px">Kéo ảnh thả vào khung trên trang. Trên điện thoại: chạm ảnh rồi chạm vào khung.</p>
    <div class="quota"><span>${Object.keys(m).length} / ${S.photos.length} ảnh đã dùng</span><span>Tối đa ${t.max}</span></div>
    <div class="dock">${S.photos.map(p=>`<button class="dk${S.pick===p.id?' pick':''}" draggable="true" data-ph="${p.id}" title="${esc(p.name)}"><img src="${p.src}" alt="">${m[p.id]?`<span class="n">${m[p.id]}</span>`:''}</button>`).join('')}</div>`}
  if(S.tab==='cover'){h=`<h3>Mẫu bìa</h3><p class="faint" style="margin:0;font-size:11px">Đổi mẫu giữ nguyên chữ hai bạn đã sửa trên bìa.</p><div class="lay-grid">${[...TPL,CUSTOM].map(x=>`<button class="lay${S.book.tpl===x.id?' on':''}" data-tplset="${x.id}">${miniBook(x,64)}${x.name}</button>`).join('')}</div>
    <h3>Màu nền bìa</h3><div class="sw-row">${BG_SWATCHES.map(c=>`<button class="sw-c${S.book.spreads[0].R.bg===c?' on':''}" style="background:${c}" data-bg="${c}" aria-label="màu ${c}"></button>`).join('')}</div>`}
  if(S.tab==='text'){const els=[];(sp.kind==='cover'?['R','L']:['L','R']).forEach(s=>(sp[s].els||[]).forEach(e=>{if(e.k==='t')els.push(e)}));
    const sel=S.sel&&S.sel.t==='el'&&findEl(S.sel.id);const se=sel&&sel.e.k==='t'?sel.e:null;
    h=`<button class="p-btn" id="addTxt">${ic('plus')} Thêm chữ vào trang</button>
    <h3>Chữ trên ${esc(spreadLabel(S.cur,S.book).toLowerCase())}</h3><p class="faint" style="margin:0;font-size:11px">Gõ ở đây hoặc bấm đúp vào chữ trên sách, hai bên tự cập nhật theo nhau.</p>
    ${els.length?els.map(e=>`<label class="fld"><span class="lbl">${textLabel(e,sp)}</span>${e.text.length>40||e.role==='note'?`<textarea class="inp" rows="3" data-tx="${e.id}">${esc(e.text)}</textarea>`:`<input class="inp" data-tx="${e.id}" value="${esc(e.text)}">`}</label>`).join(''):'<p class="muted" style="margin:0">Trang này chưa có chữ.</p>'}
    <h3>Phông chữ${se?'':' <span class="faint" style="font-weight:600">· chọn một chữ trên trang trước</span>'}</h3>
    <div class="font-grid">${FONTS.map(f=>`<button class="font-card${se&&se.font===f.id?' on':''}" data-font="${f.id}" ${se?'':'disabled'}><span class="s" style="font-family:${f.css};font-weight:${f.w};font-style:${f.it?'italic':'normal'}">${esc(se?se.text.slice(0,18)||'Hai Đứa':'Hai Đứa Mình')}</span><small>${f.name}</small></button>`).join('')}</div>`}
  if(S.tab==='art'){const u=usage();const used=Object.keys(u).length,tot=Object.values(u).reduce((a,b)=>a+b,0);
    h=`<h3>Hình vẽ trang trí</h3><div class="quota"><span>Mẫu <b>${used}/${t.motifs}</b></span><span>Đã gắn <b>${tot}/${t.stickers}</b></span></div><p class="faint" style="margin:0;font-size:11px">Mỗi mẫu dùng tối đa ${MAX_USE} lần. Hình kỷ vật chính trên bìa không tính.</p>
    <div class="chips" role="tablist" aria-label="lọc nhóm hình">${[{id:'all',name:'Tất cả'},...ART_GROUPS].map(g=>`<button class="chip${(S.artGroup||'all')===g.id?' on':''}" data-ag="${g.id}">${esc(g.name)}</button>`).join('')}</div>
    <div class="art-grid">${Object.keys(ART).filter(k=>!S.artGroup||S.artGroup==='all'||ART[k].group===S.artGroup).map(k=>{const n=u[k]||0;const why=tot>=t.stickers?'Đã đủ '+t.stickers+' hình':n>=MAX_USE?'Mẫu này đã dùng 3 lần':(!n&&used>=t.motifs)?'Đã chọn đủ '+t.motifs+' mẫu':'';
      return `<button class="art-btn" data-art="${k}" ${why?'disabled':''} title="${why||'Thêm '+ART[k].name}">${artSVG(k)}${ART[k].name}${n?`<span class="c">${n}/3</span>`:''}</button>`}).join('')}</div>`}
  if(S.tab==='layout'){
    if(sp.kind==='inner')h=`<h3>Bố cục trang đôi</h3><div class="lay-grid">${['A','B','C','D','E','F'].map(k=>`<button class="lay${sp.lay===k?' on':''}" data-lay="${k}">${layIcon(k)}${k} · ${LAYOUTS[k].n}</button>`).join('')}</div>`;
    else h=`<p class="muted" style="margin:0">Bố cục chỉ đổi được ở các trang ruột. Ở bìa, hãy dùng thẻ “Mẫu bìa”.</p>`;
    if(sp.kind!=='cover'){const sd=S.side;const pg=sp[sd];if(pg&&!pg.dark)h+=`<h3>Màu nền trang ${sd==='L'?'trái':'phải'}</h3><div class="sw-row">${['#FFFEFB','#F6F1E9','#FCE4EA','#F6EBCD','#E0EAD9','#DCE9F4','#E9E3F2','#2E2E2E'].map(c=>`<button class="sw-c${pg.bg===c?' on':''}" style="background:${c}" data-pbg="${c}"></button>`).join('')}</div>`}}
  p.innerHTML=h;
  p.querySelectorAll('[data-ag]').forEach(b=>b.onclick=e=>{e.stopPropagation();S.artGroup=b.dataset.ag;renderPanel()});
  p.querySelectorAll('[data-tx]').forEach(inp=>{inp.oninput=()=>{const r=findEl(inp.dataset.tx);if(!r)return;if(!inp._snap){snapshot();inp._snap=1}r.e.text=inp.value;const t=$(`#stage [data-el="${r.e.id}"] .t`);if(t)t.textContent=inp.value;if(r.sp.kind==='cover'&&r.e.role==='title'){const sv=$('#stage .spine span');if(sv)sv.textContent=inp.value+'  ·  OUR ARCHIVE'}changed();clearTimeout(inp._f);inp._f=setTimeout(renderFilm,500)};
    inp.onfocus=()=>{inp._snap=0;if(!(S.sel&&S.sel.id===inp.dataset.tx)){S.sel={t:'el',id:inp.dataset.tx};renderStage()}}});
  p.querySelectorAll('.dk').forEach(d=>{d.ondragstart=e=>{e.dataTransfer.setData('text/plain','ph:'+d.dataset.ph);e.dataTransfer.effectAllowed='copy'}});
}
function layIcon(k){const fr=FR[k];const box=side=>`<div>${fr[side].map(([x,y,w,h])=>`<i style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"></i>`).join('')}</div>`;return `<div class="lay-ic">${box('L')}${box('R')}</div>`}
/* ---- floating toolbar ---- */
function placeToolbar(){
  const st=$('#stage');const old=st.querySelector('.ftb');if(old)old.remove();
  if(!S.sel)return;let h='',anchor;
  if(S.sel.t==='el'){const r=findEl(S.sel.id);if(!r)return;anchor=st.querySelector(`[data-el="${r.e.id}"]`);const e=r.e;
    if(e.k==='t'){h=`<select id="tbFont" aria-label="Phông chữ">${FONTS.map(f=>`<option value="${f.id}"${f.id===e.font?' selected':''}>${f.name}</option>`).join('')}</select><span class="sep"></span>
      <button data-tb="sz-" aria-label="nhỏ hơn">A−</button><span class="val">${Math.round(e.size)}</span><button data-tb="sz+" aria-label="lớn hơn">A+</button><span class="sep"></span>
      ${['#2E2E2E','#FFFFFF','#E8577A','#E0533F','#B76E9E','#3F7F70','#5C8FC0','#C98A3C'].map(c=>`<button class="cdot" data-col="${c}" style="background:${c}" aria-label="màu chữ"></button>`).join('')}<span class="sep"></span>
      <button data-tb="al" aria-label="căn lề">${e.align==='left'?'⟸':e.align==='right'?'⟹':'≡'}</button><button data-tb="edit">Sửa chữ</button><button data-tb="dup" aria-label="nhân bản">${ic('copy')}</button><button data-tb="del" aria-label="xóa">${ic('trash')}</button>`}
    else h=`<button data-tb="sz-">−</button><span class="val">${Math.round(e.w)}%</span><button data-tb="sz+">+</button><span class="sep"></span><button data-tb="flip">${ic('flip')} Lật</button><button data-tb="up">${ic('up')} Lên trên</button><button data-tb="dup">${ic('copy')}</button><button data-tb="del">${ic('trash')}</button>`;}
  else if(S.sel.t==='frame'){anchor=st.querySelector(`.page[data-side="${S.sel.side}"] [data-frame="${S.sel.i}"]`);const fr=curSp()[S.sel.side].frames[S.sel.i];
    const ppi=fr.ph&&typeof framePPI==='function'?framePPI(fr):null;const ph=fr.ph&&S.photos.find(p=>p.id===fr.ph);
    h=`<button data-tb="pick">${ic('photo')} ${fr.ph?'Đổi ảnh':'Chọn ảnh'}</button>${fr.ph?`<span class="sep"></span><button data-tb="z-" aria-label="thu nhỏ ảnh">−</button><span class="val">${Math.round((fr.z||1)*100)}%</span><button data-tb="z+" aria-label="phóng to ảnh">+</button><button data-tb="fit">Vừa khung</button><span class="sep"></span><button data-tb="clear">${ic('x')} Bỏ ảnh</button>`:''}${ppi&&ph&&!ph.sample?`<span class="ppi${ppi<CONFIG.MIN_PPI?' bad':''}" title="Độ phân giải khi in">${ppi}ppi</span>`:''}`;
    if(fr.ph)h+=`<div class="ftb-hint">Kéo ảnh để chỉnh vị trí · chụm 2 ngón để phóng to</div>`;
    if(ppi&&ph&&!ph.sample&&ppi<CONFIG.MIN_PPI)h+=`<div class="ftb-hint bad">Ảnh hơi nhỏ, in có thể bị mờ</div>`}
  if(!anchor)return;
  const tb=document.createElement('div');tb.className='ftb';tb.innerHTML=h;st.appendChild(tb);
  const a=anchor.getBoundingClientRect(),s=st.getBoundingClientRect();
  let x=a.left-s.left+a.width/2-tb.offsetWidth/2,y=a.top-s.top-tb.offsetHeight-12;
  if(y<6)y=Math.min(s.height-tb.offsetHeight-6,a.bottom-s.top+12);
  tb.style.left=Math.max(6,Math.min(s.width-tb.offsetWidth-6,x))+'px';tb.style.top=y+'px';
  const fs=tb.querySelector('#tbFont');if(fs)fs.onchange=()=>{const r=findEl(S.sel.id);snapshot();r.e.font=fs.value;changed();renderStage();renderFilm();if(S.tab==='text')renderPanel()};
}
function toolbarAction(act,val){
  const sp=curSp();
  if(S.sel.t==='frame'){const fr=sp[S.sel.side].frames[S.sel.i];
    if(act==='clear'){snapshot();fr.ph=null;delete fr.z;delete fr.px;delete fr.py;changed();renderStage();renderFilm();if(S.tab==='photos')renderPanel()}
    if(act==='z+'||act==='z-'){snapshot();fr.z=Math.max(1,Math.min(3,+((fr.z||1)+(act==='z+'?.15:-.15)).toFixed(2)));changed();renderStage();renderFilm()}
    if(act==='fit'){snapshot();delete fr.z;delete fr.px;delete fr.py;changed();renderStage();renderFilm()}
    if(act==='pick'){S.tab='photos';S.panelOpen=true;S.awaitFrame={...S.sel};renderEditorChrome();toast('Chọn một ảnh ở cột Ảnh để đặt vào khung')}
    return}
  const r=findEl(S.sel.id);if(!r)return;const e=r.e;
  if(act==='edit'){S.editing=e.id;renderStage();return}
  snapshot();
  if(act==='sz-'||act==='sz+'){const d=act==='sz+'?1:-1;if(e.k==='t')e.size=Math.max(5,Math.min(160,+(e.size*(1+.08*d)).toFixed(1)));else e.w=Math.max(8,Math.min(140,e.w+6*d))}
  if(act==='col')e.color=val;
  if(act==='al')e.align={center:'left',left:'right',right:'center'}[e.align];
  if(act==='flip')e.flip=e.flip?0:1;
  if(act==='up'){r.pg.els=r.pg.els.filter(x=>x!==e).concat([e])}
  if(act==='dup'){if(e.k==='a'&&!canAdd(e.art))return;const c=JSON.parse(JSON.stringify(e));c.id=uid();c.x=Math.min(92,e.x+6);c.y=Math.min(92,e.y+6);delete c.main;delete c.role;r.pg.els.push(c);S.sel={t:'el',id:c.id}}
  if(act==='del'){r.pg.els=r.pg.els.filter(x=>x!==e);S.sel=null}
  changed();renderStage();renderFilm();if(S.tab==='art'||S.tab==='text')renderPanel();
}
function renderEditorChrome(){const ed=$('#ed');if(ed)ed.classList.toggle('sheet',innerWidth<=820&&S.panelOpen);if(innerWidth<=820)setTimeout(()=>{renderStage()},0);document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===S.tab));$('#panel').classList.toggle('closed',!S.panelOpen);renderPanel()}
function canAdd(art){const t=tierOf(S.tier),u=usage(),tot=Object.values(u).reduce((a,b)=>a+b,0);
  if(tot>=t.stickers){toast('Gói '+t.pages+' trang gắn tối đa '+t.stickers+' hình vẽ');return false}
  if((u[art]||0)>=MAX_USE){toast('Mỗi mẫu hình vẽ dùng tối đa 3 lần');return false}
  if(!u[art]&&Object.keys(u).length>=t.motifs){toast('Gói '+t.pages+' trang chọn tối đa '+t.motifs+' mẫu hình vẽ');return false}return true}
function targetPage(){const sp=curSp();let s=S.side;if(sp[s].dark||sp[s].locked)s=s==='L'?'R':'L';if(sp[s].dark)return null;return {pg:sp[s],side:s}}
function addArt(k){if(!canAdd(k))return;const tp=targetPage();if(!tp)return;snapshot();const e=A(k,{x:30+Math.random()*40,y:35+Math.random()*30,w:26});tp.pg.els.push(e);S.sel={t:'el',id:e.id};changed();renderStage();renderFilm();renderPanel();if(innerWidth<=820){S.panelOpen=false;renderEditorChrome()}}
function addText(){const tp=targetPage();if(!tp)return;snapshot();const e=T('Chữ của hai bạn',{font:'pangolin',size:16,color:'#2E2E2E',x:50,y:50,w:70,user:1});tp.pg.els.push(e);S.sel={t:'el',id:e.id};S.editing=e.id;changed();renderStage();renderFilm();if(S.tab==='text')renderPanel()}
function placePhoto(phId,side,i){const sp=curSp();const fr=sp[side].frames[i];if(!fr)return;snapshot();fr.ph=phId;changed();S.pick=null;S.awaitFrame=null;S.sel={t:'frame',side,i};renderStage();renderFilm();if(S.tab==='photos')renderPanel()}
function commitEdit(){if(!S.editing)return;const t=$(`#stage [data-el="${S.editing}"] .t`);const r=findEl(S.editing);if(t&&r){const v=t.innerText.replace(/\n$/,'');if(v!==r.e.text){r.e.text=v}}S.editing=null;changed();renderFilm()}
/* ---- binding ---- */
function bindEditor(){
  const ed=$('#ed');
  ed.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.tab){if(S.tab===b.dataset.tab&&innerWidth<=820)S.panelOpen=!S.panelOpen;else{S.tab=b.dataset.tab;S.panelOpen=true}renderEditorChrome();return}
    if(b.dataset.go){go(+b.dataset.go);return}
    if(b.dataset.r){({text:()=>addText(),art:()=>{S.tab='art';S.panelOpen=true;renderEditorChrome()},photo:()=>{S.tab='photos';S.panelOpen=true;renderEditorChrome()},layout:()=>{S.tab='layout';S.panelOpen=true;renderEditorChrome()}})[b.dataset.r]();return}
    if(b.dataset.tb){toolbarAction(b.dataset.tb);return}
    if(b.dataset.col){toolbarAction('col',b.dataset.col);return}
    if(b.dataset.ph){if(S.awaitFrame){placePhoto(b.dataset.ph,S.awaitFrame.side,S.awaitFrame.i);if(innerWidth<=820){S.panelOpen=false;renderEditorChrome()}return}S.pick=S.pick===b.dataset.ph?null:b.dataset.ph;renderPanel();if(S.pick)toast('Chạm vào một khung ảnh trên trang để đặt ảnh');return}
    if(b.dataset.art){addArt(b.dataset.art);return}
    if(b.dataset.font){const r=S.sel&&findEl(S.sel.id);if(r&&r.e.k==='t'){snapshot();r.e.font=b.dataset.font;changed();renderStage();renderFilm();renderPanel()}return}
    if(b.dataset.lay){const sp=curSp();snapshot();const lost=relayout(sp,b.dataset.lay);changed();S.sel=null;renderStage();renderFilm();renderPanel();if(lost>0)toast(lost+' ảnh được trả về kho ảnh');return}
    if(b.dataset.tplset){applyTemplate(b.dataset.tplset);return}
    if(b.dataset.bg){snapshot();S.book.spreads[0].L.bg=S.book.spreads[0].R.bg=b.dataset.bg;changed();go(0);renderPanel();return}
    if(b.dataset.pbg){const sp=curSp();snapshot();sp[S.side].bg=b.dataset.pbg;changed();renderStage();renderFilm();renderPanel();return}
    const id=b.id;
    if(S.admin&&typeof adminAction==='function'&&adminAction(id))return;
    if(id==='undo'||id==='redo'){const from=id==='undo'?S.undo:S.redo,to=id==='undo'?S.redo:S.undo;if(!from.length)return;commitEdit();to.push(JSON.stringify(S.book));S.book=JSON.parse(from.pop());S.sel=null;if(S.cur>=S.book.spreads.length)S.cur=0;queueSave();renderStage();renderFilm();renderPanel();updateUsed()}
    if(id==='fPrev')go(S.cur-1); if(id==='fNext')go(S.cur+1);
    if(id==='pvBtn'){commitEdit();track('review_book',{});openFlip(S.cur)}
    if(id==='order'){commitEdit();track('review_book',{ordering:1});openFlip(0,true)}
    if(id==='proj')openMenu();
    if(id==='addTxt')addText();
    if(id==='addPh')pickFiles(l=>{addPhotos(l);renderPanel();updateUsed()});
    if(id==='smart')smartRedo();
  });
  const st=$('#stage');
  st.addEventListener('pointerdown',e=>{if(PTRS.size&&e.target.closest('.frame.sel')){PTRS.set(e.pointerId,{x:e.clientX,y:e.clientY});return}onDown(e)});
  st.addEventListener('wheel',onWheelZoom,{passive:false});
  st.addEventListener('dblclick',e=>{const el=e.target.closest('.el.txt');if(!el)return;S.sel={t:'el',id:el.dataset.el};S.editing=el.dataset.el;renderStage()});
  st.addEventListener('input',e=>{const t=e.target.closest('.t[contenteditable]');if(!t)return;const id=t.parentElement.dataset.el;const r=findEl(id);if(!r)return;if(!t._snap){snapshot();t._snap=1}r.e.text=t.innerText.replace(/\n$/,'');const inp=document.querySelector(`#panel [data-tx="${id}"]`);if(inp){inp.value=r.e.text;inp.classList.remove('flash');void inp.offsetWidth;inp.classList.add('flash')}if(r.e.role==='title'&&r.sp.kind==='cover'){const sv=$('#stage .spine span');if(sv)sv.textContent=r.e.text+'  ·  OUR ARCHIVE'}queueSave()});
  st.addEventListener('focusout',e=>{const t=e.target.closest('.t[contenteditable]');if(!t)return;setTimeout(()=>{if(S.editing&&!document.activeElement.closest('.t[contenteditable]')){commitEdit();renderStage()}},0)});
  st.addEventListener('dragover',e=>{const f=e.target.closest('.frame');if(!f)return;e.preventDefault();f.classList.add('over')});
  st.addEventListener('dragleave',e=>{const f=e.target.closest('.frame');if(f)f.classList.remove('over')});
  st.addEventListener('drop',e=>{const f=e.target.closest('.frame');if(!f)return;e.preventDefault();const d=e.dataTransfer.getData('text/plain');if(d.startsWith('ph:'))placePhoto(d.slice(3),f.closest('.page').dataset.side,+f.dataset.frame)});
  onkeydown=e=>{if(S.screen!=='editor'||$('.pv')||$('.modal'))return;const typing=e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]');
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!typing){e.preventDefault();$('#undo').click()}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'&&!typing){e.preventDefault();$('#redo').click()}
    if(typing)return;
    if((e.key==='Delete'||e.key==='Backspace')&&S.sel&&S.sel.t==='el'){e.preventDefault();toolbarAction('del')}
    if(e.key==='ArrowRight'&&!S.sel)go(S.cur+1);if(e.key==='ArrowLeft'&&!S.sel)go(S.cur-1);
    if(e.key==='Escape'){S.sel=null;renderStage()}};
  let rt;onresize=()=>{clearTimeout(rt);rt=setTimeout(()=>{if(S.screen==='editor'){renderStage();renderFilm()}},120)};
}
function onDown(e){
  if(e.target.closest('.ftb,.rail'))return;
  const page=e.target.closest('.page');const book=$('#book');
  if(!page||!book.contains(page)){if(S.sel||S.editing){commitEdit();S.sel=null;renderStage()}return}
  S.side=page.dataset.side;
  if(page.classList.contains('dark')){S.sel=null;renderStage();toast('Trang lót bìa không chỉnh sửa được');return}
  const elN=e.target.closest('.el');const fr=e.target.closest('.frame');
  if(elN){const id=elN.dataset.el;if(S.editing===id)return;
    if(S.editing)commitEdit();
    const r=findEl(id);const rs=e.target.closest('.h-rs');const wasSel=S.sel&&S.sel.id===id;
    S.sel={t:'el',id};
    const rect=page.getBoundingClientRect();const sx=e.clientX,sy=e.clientY;const ox=r.e.x,oy=r.e.y,ow=r.e.w,os=r.e.size;
    let moved=false,snap=false;const gv=page.querySelector('.guide-v'),gh=page.querySelector('.guide-h');
    elN.setPointerCapture(e.pointerId);
    if(!wasSel){renderStage();}
    const node=()=>$(`#stage [data-el="${id}"]`);
    const mv=ev=>{const dx=(ev.clientX-sx)/rect.width*100,dy=(ev.clientY-sy)/rect.height*100;if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<4)return;
      if(!moved){snapshot();moved=true}const n=node();if(!n)return;
      if(rs){if(r.e.k==='t'){r.e.size=Math.max(5,Math.min(160,os*(1+dx*2/ow)));n.querySelector('.t').style.fontSize=`calc(var(--u)*${r.e.size})`}else{r.e.w=Math.max(8,Math.min(140,ow+dx*2));n.style.width=r.e.w+'%'}}
      else{let x=ox+dx,y=oy+dy;const sv=Math.abs(x-50)<2.2,sh=Math.abs(y-50)<2.2;if(sv)x=50;if(sh)y=50;r.e.x=Math.max(-10,Math.min(110,x));r.e.y=Math.max(-10,Math.min(110,y));n.style.left=r.e.x+'%';n.style.top=r.e.y+'%';
        const pv=$(`#stage .page[data-side="${S.side}"] .guide-v`),ph=$(`#stage .page[data-side="${S.side}"] .guide-h`);if(pv)pv.classList.toggle('on',sv);if(ph)ph.classList.toggle('on',sh)}
      const old=$('#stage .ftb');if(old)old.style.visibility='hidden'};
    const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);
      if(moved){changed();renderStage();renderFilm()}else if(wasSel&&r.e.k==='t'){S.editing=id;renderStage()}else renderStage();
      if(S.tab==='text')renderPanel()};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);return}
  if(fr){const side=page.dataset.side,i=+fr.dataset.frame;if(S.editing)commitEdit();
    if(S.pick){placePhoto(S.pick,side,i);return}
    const was=S.sel&&S.sel.t==='frame'&&S.sel.side===side&&S.sel.i===i;const fd=curSp()[side].frames[i];
    if(was&&fd.ph){cropDrag(e,fr,fd);return}
    S.sel={t:'frame',side,i};renderStage();return}
  if(S.editing)commitEdit();S.sel=null;renderStage();if(S.tab==='layout')renderPanel();
}
/* kéo để chỉnh vị trí ảnh trong khung; 2 ngón (hoặc cuộn chuột) để phóng */
const PTRS=new Map();
function cropDrag(e,node,fd){
  e.preventDefault();node.setPointerCapture(e.pointerId);PTRS.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const img=node.querySelector('img');const r=node.getBoundingClientRect();
  const p0={px:fd.px==null?50:fd.px,py:fd.py==null?50:fd.py,z:fd.z||1};let snap=false;let d0=null;
  const sx=e.clientX,sy=e.clientY;
  const apply=()=>{if(img){img.style.objectPosition=`${fd.px}% ${fd.py}%`;img.style.transformOrigin=`${fd.px}% ${fd.py}%`;img.style.transform=fd.z>1?`scale(${fd.z})`:''}};
  const mv=ev=>{if(!PTRS.has(ev.pointerId))return;PTRS.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
    if(!snap){snapshot();snap=true}
    const pts=[...PTRS.values()];
    if(pts.length>=2){const d=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(d0==null)d0={d,z:fd.z||1};fd.z=Math.max(1,Math.min(3,+(d0.z*d/d0.d).toFixed(3)))}
    else{/* kéo sang phải = thấy phần bên trái ảnh → giảm px */
      const k=100/(fd.z||1);fd.px=Math.max(0,Math.min(100,p0.px-(ev.clientX-sx)/r.width*k*1.4));fd.py=Math.max(0,Math.min(100,p0.py-(ev.clientY-sy)/r.height*k*1.4))}
    apply();const t=$('#stage .ftb');if(t)t.style.visibility='hidden'};
  const up=ev=>{PTRS.delete(ev.pointerId);if(PTRS.size)return;removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);
    if(snap){fd.px=Math.round(fd.px*10)/10;fd.py=Math.round(fd.py*10)/10;changed();renderFilm()}renderStage()};
  addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);
}
function onWheelZoom(e){const fr=e.target.closest('.frame.sel');if(!fr||!S.sel||S.sel.t!=='frame')return;const fd=curSp()[S.sel.side].frames[S.sel.i];if(!fd||!fd.ph)return;e.preventDefault();
  if(!onWheelZoom._t)snapshot();clearTimeout(onWheelZoom._t);onWheelZoom._t=setTimeout(()=>{onWheelZoom._t=0;changed();renderStage();renderFilm()},350);
  fd.z=Math.max(1,Math.min(3,+((fd.z||1)*(e.deltaY<0?1.06:1/1.06)).toFixed(3)));const img=fr.querySelector('img');if(img)img.style.transform=fd.z>1?`scale(${fd.z})`:''}
function applyTemplate(id){
  const tp=tplOf(id);snapshot();const cv=S.book.spreads[0];
  const oldT=cv.R.els.find(e=>e.role==='title'),oldS=cv.R.els.find(e=>e.role==='sub');
  const edited=S.book.titleEdited;const nf=frontEls(tp);
  if(oldT&&oldT.text!==tplOf(S.book.tpl).title){const t=nf.find(e=>e.role==='title');if(t){t.text=oldT.text;t.size=fitSize(oldT.text,tp.mode==='bleed'?108:54,tp.mode==='bleed'?330:250)}}
  if(oldS&&oldS.text!==tplOf(S.book.tpl).subt){const s=nf.find(e=>e.role==='sub');if(s)s.text=oldS.text}
  cv.R.els=nf.concat(cv.R.els.filter(e=>e.user||(e.k==='a'&&!e.main)));cv.R.bg=cv.L.bg=tp.bg;
  cv.L.els.forEach(e=>{if(e.role==='btitle'){e.color=tp.ink==='#FFFFFF'?tp.sub:tp.ink;e.font=tp.font||'paytone'}if(e.role==='byear'){e.color=tp.sub}});
  S.book.tpl=id;S.book.cover={bg:tp.bg,ink:tp.ink};changed();go(0);renderPanel();
}
function smartRedo(){
  const t=tierOf(S.tier);snapshot();const nb=newBook(S.book.tpl,S.tier,S.photos.slice(0,t.max),defaultNotes());
  nb.spreads[0]=S.book.spreads[0];nb.spreads[1]=S.book.spreads[1];S.book.spreads=nb.spreads;S.cur=Math.min(S.cur,S.book.spreads.length-1);changed();renderStage();renderFilm();renderPanel();toast('Đã dàn trang lại toàn bộ ruột sách');
}
function openMenu(){const h=$('#menuHost');if(h.innerHTML){h.innerHTML='';return}
  h.innerHTML=`<div class="menu"><button data-m="tier">Đổi số trang (gói)</button>${S.admin?'<button data-m="sheet">Phiếu lệnh in cho xưởng</button>':''}${S.admin?'':'<button data-m="shop">Về trang chọn mẫu</button><button data-m="reset">Làm lại từ đầu</button>'}</div>`;
  h.onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;h.innerHTML='';const m=b.dataset.m;
    if(m==='sheet')modal(`<h2>Phiếu lệnh in</h2><p class="muted" style="margin:0">Gửi kèm file ảnh gốc cho xưởng.</p><pre id="sheetTxt">${esc(productionSheet())}</pre><div style="display:flex;gap:8px;justify-content:flex-end"><button class="ghost" data-close>Đóng</button><button class="pill" id="cpSheet">${ic('copy')} Copy phiếu</button></div>`,d=>{d.querySelector('#cpSheet').onclick=()=>copyText($('#sheetTxt').textContent)});
    if(m==='tier')modal(`<h2>Đổi số trang</h2><p class="muted" style="margin:0">Ruột sách sẽ được dàn trang lại theo số trang mới. Bìa giữ nguyên.</p><div class="tiers">${TIERS.map(x=>`<button class="tier${x.id===S.tier?' on':''}" data-nt="${x.id}"><b>${x.pages} trang</b><span class="tp">${vnd(x.price)}</span><small>Tối đa ${x.max} ảnh</small></button>`).join('')}</div><button class="ghost" data-close>Đóng</button>`,d=>{d.onclick=ev=>{const b=ev.target.closest('[data-nt]');if(b){S.tier=+b.dataset.nt;closeModal();smartRedo();renderEditor()}if(ev.target.closest('[data-close]'))closeModal()}});
    if(m==='shop'){S.screen='shop';render()}
    if(m==='reset')modal(`<h2>Làm lại từ đầu?</h2><p class="muted" style="margin:0">Toàn bộ ảnh và thiết kế trên trình duyệt này sẽ bị xóa.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="ghost" data-close>Giữ lại</button><button class="pill" id="doReset">Xóa và làm lại</button></div>`,d=>{d.querySelector('#doReset').onclick=()=>{try{localStorage.removeItem(LS)}catch(e){}clearPhotos();Object.assign(S,{photos:[],book:null,screen:'shop',cur:0,code:null});closeModal();render()}});
  }}
function modal(html,init){const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="dlg" role="dialog">${html}</div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-close]'))closeModal()});if(init)init(m.querySelector('.dlg'));return m}
function closeModal(){document.querySelectorAll('.modal').forEach(m=>m.remove())}
function copyText(t){try{navigator.clipboard.writeText(t).then(()=>toast('Đã copy'),()=>toast('Hãy bôi đen và copy thủ công'))}catch(e){toast('Hãy bôi đen và copy thủ công')}}
function productionSheet(){const t=tierOf(S.tier),b=S.book,tp=tplOf(b.tpl);const L=[];
  L.push('OUR ARCHIVE · PHIẾU LỆNH SẢN XUẤT');L.push('mã đơn: '+(S.code||'(chưa đặt)'));L.push('quy cách: B5 nhỡ 165×235mm · bìa cứng matte · ruột mỹ thuật 200gsm · '+t.pages+' trang · gáy '+t.spine);
  L.push('mẫu bìa: '+tp.name+' · nền '+b.spreads[0].R.bg);
  b.spreads.forEach((sp,i)=>{L.push('');L.push('['+spreadLabel(i,b)+']'+(sp.lay?' bố cục '+sp.lay+' · chương 0'+sp.ch:''));
    ['L','R'].forEach(s=>{const pg=sp[s];if(pg.dark){L.push('  '+s+': giấy lót');return}
      (pg.frames||[]).forEach((f,k)=>L.push(`  ${s} khung ${k+1} [${f.f.join(',')}%]: ${f.ph||'TRỐNG'}`));
      (pg.els||[]).forEach(e=>L.push(e.k==='t'?`  ${s} chữ "${e.text.replace(/\n/g,' / ')}" · ${fontOf(e.font).name} ${e.size} · ${e.color} · (${Math.round(e.x)}%,${Math.round(e.y)}%)`:`  ${s} hình "${ART[e.art].name}" · rộng ${Math.round(e.w)}% · (${Math.round(e.x)}%,${Math.round(e.y)}%)${e.flip?' · lật':''}`))})});
  L.push('');L.push('giá gói: '+vnd(t.price)+' · quà: '+t.gift+(S.order?' · tổng đơn '+vnd(S.order.total)+' · đã/cần chuyển khoản '+vnd(S.order.payNow)+' · COD '+vnd(S.order.cod):''));return L.join('\n')}

/* ===== FLIPBOOK final check ===== */
function openFlip(start,ordering){
  const b=S.book;const pages=[];
  b.spreads.forEach((sp,i)=>{if(sp.kind==='cover'){pages.push({pg:sp.R,i,cover:1});return}pages.push({pg:sp.L,i});pages.push({pg:sp.R,i})});
  pages.push({pg:b.spreads[0].L,i:0,cover:1,back:1});
  const leaves=[];for(let k=0;k<pages.length;k+=2)leaves.push({front:pages[k],back:pages[k+1]});
  let cur=start?b.spreads.slice(1,start).reduce((a)=>a+1,1):0;cur=Math.min(cur,leaves.length);
  const pv=document.createElement('div');pv.className='pv';pv.innerHTML=`<div class="pv-top"><span style="font-weight:700">Xem lại cuốn sách</span><span id="flLbl" class="faint"></span><div style="display:flex;gap:8px"><button class="ghost sm" id="flEdit">Sửa trang này</button>${ordering?`<button class="pill" id="flOk" style="height:36px;padding:0 16px;font-size:12.5px">Đã kiểm tra, đặt sách</button>`:''}<button class="ghost sm" id="flClose" aria-label="Đóng">${ic('x')}</button></div></div>
   <div class="pv-stage"><button class="pv-nav" id="flPrev" aria-label="Trang trước">${ic('left')}</button><div class="fb" id="fb"></div><button class="pv-nav" id="flNext" aria-label="Trang sau">${ic('right')}</button></div><div class="pv-lbl">${ordering?'Lật hết sách để kiểm tra lần cuối trước khi đặt. ':''}Vuốt, kéo góc trang hoặc dùng phím ← →</div>`;
  document.body.appendChild(pv);
  const fb=pv.querySelector('#fb');
  const size=()=>{const W=innerWidth-(innerWidth<700?40:180),H=innerHeight-150;return Math.floor(Math.min(W/2,H/RATIO))};
  function build(){const pw=size();fb.style.width=pw*2+'px';fb.style.height=pw*RATIO+'px';fb.style.setProperty('--pw',pw+'px');
    fb.innerHTML=leaves.map((lf,k)=>`<div class="leaf" data-k="${k}" style="z-index:${k<cur?k:leaves.length-k}"><div class="face front">${pageHTML(lf.front.pg,pw,{side:'R'})}<div class="shade"></div></div><div class="face back">${lf.back?pageHTML(lf.back.pg,pw,{side:'L'}):''}<div class="shade"></div></div></div>`).join('')+'<div class="fb-gutter"></div>';
    layout()}
  function layout(){fb.querySelectorAll('.leaf').forEach((l,k)=>{l.classList.toggle('turned',k<cur);l.style.zIndex=k<cur?k+1:leaves.length-k});
    fb.classList.toggle('closed-front',cur===0);fb.classList.toggle('closed-back',cur===leaves.length);
    const lbl=cur===0?'Bìa trước':cur===leaves.length?'Bìa sau':`Trang ${Math.max(0,cur*2-2)||'lót'} – ${cur*2-1}`;pv.querySelector('#flLbl').textContent=lbl;
    pv.querySelector('#flPrev').disabled=cur===0;pv.querySelector('#flNext').disabled=cur===leaves.length}
  const turn=d=>{const n=cur+d;if(n<0||n>leaves.length)return;cur=n;layout()};
  build();
  pv.querySelector('#flPrev').onclick=()=>turn(-1);pv.querySelector('#flNext').onclick=()=>turn(1);
  const close=()=>{pv.remove();removeEventListener('keydown',kd);removeEventListener('resize',build)};
  pv.querySelector('#flClose').onclick=close;
  pv.querySelector('#flEdit').onclick=()=>{let sp=0;if(cur>0&&cur<leaves.length){const lf=leaves[cur-1];sp=(lf.back||lf.front).i}else if(cur===leaves.length)sp=0;close();go(sp)};
  if(ordering)pv.querySelector('#flOk').onclick=()=>{close();orderDialog()};
  const kd=e=>{if(e.key==='ArrowRight')turn(1);if(e.key==='ArrowLeft')turn(-1);if(e.key==='Escape')close()};addEventListener('keydown',kd);addEventListener('resize',build);
  /* kéo góc trang để lật: trang đi theo ngón tay/chuột, thả quá 1/3 thì lật hẳn, chưa tới thì trả về */
  let drag=null;fb.style.touchAction='pan-y';
  fb.addEventListener('pointerdown',e=>{const r=fb.getBoundingClientRect();const fwd=e.clientX>r.left+r.width/2;const k=fwd?cur:cur-1;const lf=fb.querySelectorAll('.leaf')[k];
    drag={sx:e.clientX,fwd,lf,p:0,w:r.width/2,moved:false};fb.setPointerCapture(e.pointerId)});
  fb.addEventListener('pointermove',e=>{if(!drag||!drag.lf)return;const dx=e.clientX-drag.sx;if(!drag.moved&&Math.abs(dx)<6)return;
    if(!drag.moved){drag.moved=true;drag.lf.style.transition='none';drag.lf.style.zIndex=999}
    drag.p=Math.max(0,Math.min(1,(drag.fwd?-dx:dx)/(drag.w*1.1)));drag.lf.style.transform=`rotateY(${drag.fwd?-180*drag.p:-180*(1-drag.p)}deg)`});
  const end=e=>{if(!drag)return;const d=drag;drag=null;
    if(!d.moved){const r=fb.getBoundingClientRect();turn(e.clientX>r.left+r.width/2?1:-1);return}
    if(d.lf){d.lf.style.transition='';d.lf.style.transform='';d.lf.style.zIndex=''}
    if(d.p>.33)turn(d.fwd?1:-1);else layout()};
  fb.addEventListener('pointerup',end);fb.addEventListener('pointercancel',end);
}
/* orderDialog: xem order.js */

/* ===== boot ===== */
function render(){closeModal();const pv=$('.pv');if(pv)pv.remove();app().onclick=null;
  if(S.screen==='shop')renderShop();else if(S.screen==='allset')renderAllset();else if(S.screen==='magic')renderMagic();else if(S.screen==='editor'&&S.book)renderEditor();else{S.screen='shop';renderShop()}
  window.scrollTo(0,0)}
