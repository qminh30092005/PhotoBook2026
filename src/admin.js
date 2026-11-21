/* ===== TRANG ADMIN (admin.html) · một mật khẩu chung, lưu trong Script Properties của Apps Script =====
   Danh sách đơn + số liệu · chi tiết đơn + các phiên bản bản thảo · mở trình thiết kế để sửa · lưu bản mới
   · gửi link duyệt cho khách · đổi trạng thái · xuất PDF ruột + bìa trải phẳng. */
S.admin=true;
const ADM={auth:null,orders:[],statuses:[],filter:'all',q:'',view:'login',d:null,code:null,views:{},origs:{}};
try{ADM.auth=sessionStorage.getItem('oa-adm')}catch(e){}
const cap=s=>{s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1)};
const PAID=['đã cọc','đang thiết kế','chờ duyệt','sửa lần 1','sửa lần 2','đang in','đang giao','đã giao'];
async function admCall(action,body,timeout){const r=await apiPost(action,Object.assign({auth:ADM.auth},body||{}),timeout);
  if(!r.ok&&/đăng nhập/.test(r.msg||'')){ADM.auth=null;try{sessionStorage.removeItem('oa-adm')}catch(e){}admGo('login');throw new Error(r.msg)}
  if(!r.ok)throw new Error(r.msg||'lỗi');return r}
function admGo(v){ADM.view=v;S.screen=v==='editor'?'editor':'admin';admRender()}
function render(){closeModal();const pv=$('.pv');if(pv)pv.remove();app().onclick=null;admRender()}
function admRender(){
  if(!CONFIG.API_URL){app().innerHTML=`<div class="adm-center"><div class="logo"><b>our</b> archive</div><h1>Admin</h1><p class="muted">Chưa điền <b>API_URL</b> trong khối CONFIG. làm theo tai-lieu/huong-dan-cai-dat.md trước nhé.</p></div>`;return}
  if(!ADM.auth)ADM.view='login';
  if(ADM.view==='login')return admLogin();
  if(ADM.view==='list')return admList();
  if(ADM.view==='order')return admOrder();
  if(ADM.view==='editor')return renderEditor();
}
function admLogin(){
  app().innerHTML=`<form class="adm-center" id="lg"><div class="logo"><b>our</b> archive</div><h1>Đăng nhập admin</h1>
   <label class="fld" style="width:100%"><span>Mật khẩu</span><input type="password" id="pw" autocomplete="current-password" required></label>
   <p class="err" id="lgErr"></p><button class="pill block">Vào trang quản lý</button></form>`;
  $('#pw').focus();
  $('#lg').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;b.textContent='Đang kiểm tra…';
    try{const r=await apiPost('login',{password:$('#pw').value});if(!r.ok)throw new Error(r.msg);ADM.auth=r.auth;try{sessionStorage.setItem('oa-adm',r.auth)}catch(e){}
      await admLoad();const h=decodeURIComponent(location.hash.slice(1));if(/^OA-/.test(h))admOpen(h);else admGo('list')}
    catch(err){$('#lgErr').textContent=err.message||'Không đăng nhập được';b.disabled=false;b.textContent='Vào trang quản lý'}};
}
async function admLoad(){const r=await admCall('list');ADM.orders=r.orders;ADM.statuses=r.statuses}
function num(v){return Number(String(v||0).replace(/[^\d-]/g,''))||0}
function admStats(list){
  const live=list.filter(o=>o['trạng thái']!=='hủy');
  const paid=live.filter(o=>PAID.includes(o['trạng thái']));
  const st={orders:live.length,revenue:paid.reduce((a,o)=>a+num(o['tổng']),0),received:paid.reduce((a,o)=>a+num(o['số tiền chuyển khoản']),0),
    codLeft:paid.filter(o=>o['trạng thái']!=='đã giao').reduce((a,o)=>a+num(o['số tiền COD']),0),
    waiting:live.filter(o=>o['trạng thái']==='chờ cọc').reduce((a,o)=>a+num(o['số tiền chuyển khoản']),0),
    commission:paid.reduce((a,o)=>a+num(o['hoa hồng KOC']),0),byStatus:{},byKoc:{},byTier:{}};
  list.forEach(o=>{st.byStatus[o['trạng thái']]=(st.byStatus[o['trạng thái']]||0)+1});
  paid.forEach(o=>{const k=o['mã KOC']||'(không mã)';const x=st.byKoc[k]=st.byKoc[k]||{n:0,rev:0,com:0};x.n++;x.rev+=num(o['tổng']);x.com+=num(o['hoa hồng KOC']);
    st.byTier[o['gói']]=(st.byTier[o['gói']]||0)+1});
  return st}
function admList(){
  const st=admStats(ADM.orders);const q=strip(ADM.q);
  const list=ADM.orders.filter(o=>(ADM.filter==='all'||o['trạng thái']===ADM.filter)&&(!q||strip([o['mã đơn'],o['tên'],o['SĐT/Zalo'],o['email'],o['mã KOC']].join(' ')).includes(q)));
  const maxS=Math.max(1,...Object.values(st.byStatus));
  app().innerHTML=`<div class="adm">
   <header class="adm-top"><div class="logo"><b>our</b> archive <span class="faint" style="font-size:13px;font-weight:700">· quản lý đơn</span></div>
     <div style="display:flex;gap:8px"><button class="ghost sm" id="reload">Tải lại</button><button class="ghost sm" id="logout">Đăng xuất</button></div></header>
   <section class="adm-stats">
     <div class="kpi dark"><span>Đơn (không tính hủy)</span><b>${st.orders}</b></div>
     <div class="kpi"><span>Doanh thu đơn đã cọc</span><b>${vnd(st.revenue)}</b></div>
     <div class="kpi"><span>Tiền đã nhận chuyển khoản</span><b>${vnd(st.received)}</b></div>
     <div class="kpi"><span>COD còn phải thu</span><b>${vnd(st.codLeft)}</b></div>
     <div class="kpi warn"><span>Đang chờ khách chuyển cọc</span><b>${vnd(st.waiting)}</b></div>
     <div class="kpi"><span>Hoa hồng KOC phải trả</span><b>${vnd(st.commission)}</b></div>
   </section>
   <section class="adm-grid2">
     <div class="adm-card"><h3>Đơn theo trạng thái</h3>${ADM.statuses.map(s=>`<div class="bar-row"><span>${cap(s)}</span><i style="--w:${(st.byStatus[s]||0)/maxS*100}%"></i><b>${st.byStatus[s]||0}</b></div>`).join('')}</div>
     <div class="adm-card"><h3>Theo mã KOC (đơn đã cọc)</h3><table class="tbl"><tr><th>Mã</th><th>Đơn</th><th>Doanh thu</th><th>Hoa hồng</th></tr>${Object.entries(st.byKoc).sort((a,b)=>b[1].n-a[1].n).map(([k,x])=>`<tr><td>${esc(k)}</td><td>${x.n}</td><td>${vnd(x.rev)}</td><td>${vnd(x.com)}</td></tr>`).join('')||'<tr><td colspan="4" class="faint">Chưa có</td></tr>'}</table>
       <h3 style="margin-top:14px">Theo gói</h3><div class="chips">${Object.entries(st.byTier).map(([k,n])=>`<span class="chip">${esc(k)} · ${n}</span>`).join('')||'<span class="faint">Chưa có</span>'}</div></div>
   </section>
   <section class="adm-card"><div class="adm-filter"><label class="search" style="flex:1;border:1px solid var(--line);border-radius:999px">${ic('search')}<input id="aq" placeholder="tìm mã đơn, tên, số điện thoại, email, mã KOC" value="${esc(ADM.q)}"></label></div>
     <div class="chips">${['all',...ADM.statuses].map(s=>`<button class="chip${ADM.filter===s?' on':''}" data-f="${s}">${s==='all'?'Tất cả':s} · ${s==='all'?ADM.orders.length:(st.byStatus[s]||0)}</button>`).join('')}</div>
     <div class="tbl-wrap"><table class="tbl orders"><tr><th>Mã đơn</th><th>Ngày</th><th>Khách</th><th>Gói</th><th>Tổng</th><th>Chuyển khoản / COD</th><th>Trạng thái</th><th>Bản</th><th></th></tr>
     ${list.map(o=>`<tr><td class="mono">${esc(o['mã đơn'])}</td><td>${new Date(o['ngày giờ']).toLocaleDateString('vi-VN')}</td><td><b>${esc(o['tên'])}</b><br><small class="faint">${esc(String(o['SĐT/Zalo']).replace(/^'/,''))}</small></td><td>${esc(o['gói'])} × ${o['số lượng']}</td><td>${vnd(num(o['tổng']))}</td><td>${vnd(num(o['số tiền chuyển khoản']))}<br><small class="faint">COD ${vnd(num(o['số tiền COD']))}</small></td>
       <td><select data-st="${esc(o['mã đơn'])}">${ADM.statuses.map(s=>`<option${s===o['trạng thái']?' selected':''}>${s}</option>`).join('')}</select></td><td>${esc(o['phiên bản']||'v0')}${num(o['lượt sửa'])?`<br><small class="faint">Sửa ${num(o['lượt sửa'])}/${CONFIG.FREE_REVISIONS}</small>`:''}</td><td><button class="pill sm" data-open="${esc(o['mã đơn'])}">Mở</button></td></tr>`).join('')||'<tr><td colspan="9" class="faint">Không có đơn nào.</td></tr>'}</table></div></section></div>`;
  const qi=$('#aq');qi.oninput=()=>{ADM.q=qi.value;const p=qi.selectionStart;admList();const n=$('#aq');n.focus();n.setSelectionRange(p,p)};
  app().onclick=async e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.f){ADM.filter=b.dataset.f;admList()}
    if(b.dataset.open)admOpen(b.dataset.open);
    if(b.id==='reload'){b.textContent='Đang tải…';try{await admLoad()}catch(err){toast(err.message)}admList()}
    if(b.id==='logout'){ADM.auth=null;try{sessionStorage.removeItem('oa-adm')}catch(e){}admGo('login')}};
  app().querySelectorAll('[data-st]').forEach(s=>s.onchange=async()=>{const code=s.dataset.st;s.disabled=true;try{await admCall('setStatus',{code,status:s.value});const o=ADM.orders.find(x=>x['mã đơn']===code);if(o)o['trạng thái']=s.value;toast('Đã đổi trạng thái '+code);admList()}catch(err){toast(err.message);s.disabled=false}});
}
async function admOpen(code){
  ADM.code=code;ADM.d=null;ADM.view='order';location.hash=code;
  app().innerHTML=`<div class="adm-center"><p class="muted">Đang mở đơn ${esc(code)}…</p></div>`;
  try{ADM.d=await admCall('order',{code});admOrder()}catch(err){toast(err.message);admGo('list')}
}
function admOrder(){
  const d=ADM.d;if(!d)return;const o=d.order;const t=tierOf(d.design.tier);
  app().innerHTML=`<div class="adm">
   <header class="adm-top"><button class="ghost sm" id="back">${ic('left')} danh sách</button><div class="logo">${esc(o['mã đơn'])}</div><span></span></header>
   <section class="adm-grid2">
    <div class="adm-card"><h3>Khách & đơn</h3><div class="sum">
      ${[['khách',o['tên']],['SĐT/Zalo',String(o['SĐT/Zalo']).replace(/^'/,'')],['email',o['email']],['địa chỉ',o['địa chỉ']+' · '+o['khu vực']],['gói',o['gói']+' × '+o['số lượng']+' cuốn'],['mẫu bìa',o['mẫu bìa']],['mã KOC',o['mã KOC']||'—'],['tổng',vnd(num(o['tổng']))],['chuyển khoản ('+o['hình thức thanh toán']+')',vnd(num(o['số tiền chuyển khoản']))],['COD',vnd(num(o['số tiền COD']))],['ảnh nhận',o['ảnh đã nhận']+'/'+o['số ảnh']],['ảnh mờ',o['ảnh cảnh báo mờ']||'không'],['quyền đăng ảnh',o['quyền đăng ảnh']],['lời nhắn',o['lời nhắn khách']||'—'],['ghi chú shop',o['ghi chú']||'—']].map(([k,v])=>`<div><span>${cap(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
      <a class="ghost" style="margin-top:10px" href="${esc(o['link Drive'])}" target="_blank" rel="noopener">Mở thư mục Drive</a></div>
    <div class="adm-card"><h3>Trạng thái</h3><div class="frow" style="grid-template-columns:1fr auto"><select id="stSel" class="sel">${ADM.statuses.map(s=>`<option${s===o['trạng thái']?' selected':''}>${s}</option>`).join('')}</select><button class="pill sm" id="stSave">Lưu</button></div>
      <p class="faint" style="font-size:11.5px;margin:6px 0 0">Đổi sang "đã giao" thì hệ thống ghi ngày giao và tự xóa ảnh sau ${CONFIG.PHOTO_KEEP_DAYS} ngày.</p>
      <h3 style="margin-top:16px">Bản thảo · đang mở ${esc(d.version)} · khách sửa ${num(o['lượt sửa'])}/${CONFIG.FREE_REVISIONS} lần miễn phí</h3>
      <div class="vers">${d.versions.map(v=>`<div class="ver${v.v===d.version?' on':''}"><b>${esc(v.v)}</b><span>${new Date(v.time).toLocaleString('vi-VN')} · ${esc(v.by)}${v.note?' · '+esc(v.note):''}</span>${v.result?`<em class="${v.result==='duyệt'?'ok-t':'err-t'}">Khách: ${esc(v.result)}${v.customerNote?' · “'+esc(v.customerNote)+'”':''}</em>`:''}</div>`).join('')}</div>
      <div class="adm-actions"><button class="pill" id="openEd">${ic('book')} mở trình thiết kế (${esc(d.version)})</button><button class="ghost" id="flip">${ic('eye')} xem lật trang</button>
       <button class="ghost" id="sendRv">Gửi link duyệt cho khách</button>${d.reviewKey?`<button class="ghost" id="cpRv">Copy link duyệt</button>`:''}
       <button class="ghost" id="pdfIn">${ic('upload')} PDF ruột</button><button class="ghost" id="pdfCv">${ic('upload')} PDF bìa trải phẳng</button><button class="ghost" id="sheet">Phiếu lệnh in</button></div>
      <p class="faint" id="admMsg" style="font-size:12px;margin:8px 0 0"></p></div>
   </section></div>`;
  app().onclick=async e=>{const b=e.target.closest('button');if(!b)return;const msg=t=>{$('#admMsg').textContent=t||''};
    if(b.id==='back'){location.hash='';try{await admLoad()}catch(e){}admGo('list')}
    if(b.id==='stSave'){b.disabled=true;try{await admCall('setStatus',{code:ADM.code,status:$('#stSel').value});o['trạng thái']=$('#stSel').value;toast('Đã lưu trạng thái')}catch(err){toast(err.message)}b.disabled=false}
    if(b.id==='openEd'||b.id==='flip'||b.id==='sheet'){b.disabled=true;try{await admPrepare(msg);if(b.id==='openEd'){S.cur=0;S.sel=null;S.undo=[];S.redo=[];admGo('editor')}else if(b.id==='flip')openFlip(0);else modal(`<h2>Phiếu lệnh in</h2><pre id="sheetTxt">${esc(productionSheet())}</pre><div style="display:flex;gap:8px;justify-content:flex-end"><button class="ghost" data-close>Đóng</button><button class="pill" id="cpSheet">${ic('copy')} copy phiếu</button></div>`,dd=>{dd.querySelector('#cpSheet').onclick=()=>copyText($('#sheetTxt').textContent)})}catch(err){msg(err.message)}b.disabled=false}
    if(b.id==='sendRv'){if(!confirm('Gửi email link duyệt bản '+d.version+' cho '+o['email']+'?'))return;b.disabled=true;msg('Đang gửi…');try{const r=await admCall('sendReview',{code:ADM.code});d.reviewKey=r.link.split('k=')[1];o['trạng thái']='chờ duyệt';copyText(r.link);admOrder();$('#admMsg').textContent='Đã gửi link duyệt (đã copy): '+r.link}catch(err){msg(err.message)}b.disabled=false}
    if(b.id==='cpRv'){copyText(reviewLink())}
    if(b.id==='pdfIn'||b.id==='pdfCv'){b.disabled=true;try{await admPrepare(msg);await admOriginals(msg);const src=id=>ADM.origs[id]||photoSrc(id);
      if(b.id==='pdfIn'){const n=await exportInteriorPDF(S.book,ADM.code,src,msg);msg('Đã xuất PDF ruột '+n+' trang.'+admOrigNote())}else{await exportCoverPDF(S.book,ADM.code,d.design.tier,src,msg);msg('Đã xuất PDF bìa trải phẳng.'+admOrigNote())}}
      catch(err){msg('Lỗi xuất PDF: '+err.message)}b.disabled=false}};
}
function reviewLink(){const base=(CONFIG.SITE_URL||location.origin+location.pathname.replace(/admin(\.html)?$/,'')).replace(/\/$/,'');return `${base}/duyet?o=${encodeURIComponent(ADM.code)}&k=${ADM.d.reviewKey}`}
/* nạp thiết kế + ảnh bản xem của đơn vào trình thiết kế */
async function admPrepare(msg){
  const d=ADM.d;S.tier=d.design.tier;S.tpl=d.design.tpl;S.book=JSON.parse(JSON.stringify(d.design.book));S.code=ADM.code;
  S.order={total:num(d.order['tổng']),payNow:num(d.order['số tiền chuyển khoản']),cod:num(d.order['số tiền COD'])};
  const list=d.design.photos;let n=0;
  for(const p of list){if(!ADM.views[ADM.code+p.id]){msg&&msg(`đang tải ảnh ${n+1}/${list.length}…`);
      try{const r=await admCall('photo',{code:ADM.code,id:p.id,kind:'view'},60000);ADM.views[ADM.code+p.id]=`data:${r.mime};base64,${r.data}`}catch(e){ADM.views[ADM.code+p.id]=''}}n++}
  S.photos=list.map(p=>Object.assign({},p,{src:ADM.views[ADM.code+p.id]||''}));msg&&msg('');
}
/* ảnh gốc cho file in (chỉ những ảnh đang nằm trong khung) */
async function admOriginals(msg){
  const used=[...new Set(S.book.spreads.flatMap(sp=>['L','R'].flatMap(s=>(sp[s].frames||[]).map(f=>f.ph).filter(Boolean))))];
  ADM.origFail=[];let i=0;
  for(const id of used){i++;const key=ADM.code+id;if(ADM.origs[key]!==undefined)continue;msg(`đang tải ảnh gốc ${i}/${used.length}…`);
    try{const r=await admCall('photo',{code:ADM.code,id,kind:'orig'},180000);const u=`data:${r.mime};base64,${r.data}`;await loadImg(u);ADM.origs[key]=u}
    catch(e){ADM.origs[key]=null;ADM.origFail.push(id)}}
  const map={};used.forEach(id=>{if(ADM.origs[ADM.code+id])map[id]=ADM.origs[ADM.code+id]});ADM.origs=Object.assign(ADM.origs,map);
}
function admOrigNote(){return ADM.origFail&&ADM.origFail.length?` ${ADM.origFail.length} ảnh không đọc được ảnh gốc (thường là HEIC) nên dùng bản xem, nên đổi ảnh gốc sang JPG rồi tải lại vào Drive.`:''}
/* nút trên thanh trình thiết kế khi ở admin */
function adminTopHTML(){return `<button class="ghost sm" id="admBack">${ic('left')} đơn ${esc(ADM.code)}</button><button class="ghost sm" id="admSave">${ic('save')} lưu bản mới</button><button class="pill" id="admReview">Gửi bản duyệt</button>`}
function adminAction(id){
  if(id==='admBack'){if(S.undo.length&&!confirm('Bản đang sửa chưa lưu lên shop. vẫn quay lại?'))return true;admGo('order');return true}
  if(id==='admSave'){commitEdit();const note=prompt('Ghi chú cho bản mới (vd: chỉnh màu bìa, đổi ảnh trang 4–5):','');if(note===null)return true;
    setSaved('Đang lưu…');admCall('saveVersion',{code:ADM.code,note,design:{v:1,tier:S.tier,tpl:S.book.tpl,book:S.book,photos:ADM.d.design.photos}})
      .then(r=>{ADM.d.version=r.version;ADM.d.design.book=JSON.parse(JSON.stringify(S.book));ADM.d.versions.push({v:r.version,time:new Date().toISOString(),by:'shop',note});S.undo=[];setSaved('Đã lưu '+r.version);toast('Đã lưu '+r.version)})
      .catch(err=>{setSaved('Chưa lưu');toast(err.message)});return true}
  if(id==='admReview'){if(S.undo.length){toast('Lưu bản mới trước rồi hãy gửi duyệt nhé');return true}
    if(!confirm('Gửi email link duyệt bản '+ADM.d.version+' cho khách?'))return true;
    admCall('sendReview',{code:ADM.code}).then(r=>{ADM.d.reviewKey=r.link.split('k=')[1];copyText(r.link);toast('Đã gửi link duyệt (đã copy)')}).catch(err=>toast(err.message));return true}
  return false}
(async()=>{document.body.insertAdjacentHTML('beforeend','<div class="toast" id="toast" role="status"></div>');
  try{await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,2500))])}catch(e){}
  if(ADM.auth){try{await admLoad();const h=decodeURIComponent(location.hash.slice(1));if(/^OA-/.test(h)){admOpen(h);return}ADM.view='list'}catch(e){ADM.auth=null}}
  admRender()})();
