/* ===== khởi động trang khách (index.html) ===== */
function i3(p){const n=S.photos.length;return n<11?1:n<22?2:3}
(async()=>{document.body.insertAdjacentHTML('beforeend','<div class="toast" id="toast" role="status"></div>');
  try{await restore()}catch(e){}
  try{await Promise.race([Promise.all(FONTS.map(f=>document.fonts.load(`${f.it?'italic ':''}${f.w} 20px ${f.css.split(',')[0]}`,'Hà Nội ẤỮỢỆđ'))).then(()=>document.fonts.ready),new Promise(r=>setTimeout(r,3500))])}catch(e){}
  /* ?demo=form : mở sẵn form đặt sách với bộ ảnh mẫu (để chụp ảnh duyệt giao diện; không lưu gì) */
  if(/[?&]demo=form/.test(location.search)){S.admin=false;S.photos=[];S.tpl='danang';S.tier=32;Array.from({length:32},(_,i)=>samplePhoto(i)).forEach(p=>S.photos.push(Object.assign(p,{ch:i3(p)})));buildBook(false);S.screen='editor';render();setTimeout(()=>{orderDialog();const d=document.querySelector('.dlg');const set=(id,v)=>{const el=d.querySelector(id);if(el)el.value=v};set('#oName','Hoài Minh');set('#oPhone','0912345678');set('#oMail','hoaiminh@gmail.com');set('#oAddr','12 Phan Chu Trinh, Hoàn Kiếm, Hà Nội');set('#oKoc','DEMO10');d.querySelector('#oKocBtn').click()},400);return}  render();try{checkPendingUpload()}catch(e){}})();
