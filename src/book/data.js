/* ===== Data ===== */
const TIERS=[
 {id:24,name:'Gói kỷ niệm',pages:24,price:259000,max:24,motifs:4,stickers:12,notes:3,gift:'bộ sticker dán ngẫu nhiên',spine:'6.8mm'},
 {id:32,name:'Gói hành trình',pages:32,price:299000,max:32,motifs:8,stickers:20,notes:4,gift:'bộ sticker dán ngẫu nhiên',tag:'Bán chạy',spine:'8.5mm'},
 {id:40,name:'Gói lưu trữ VIP',pages:40,price:349000,max:40,motifs:12,stickers:27,notes:5,gift:'bộ sticker + hộp quà cao cấp',tag:'VIP',spine:'10.2mm'}];
const tierOf=id=>TIERS.find(t=>t.id===+id)||TIERS[1];
const MIN_CH=4, MAX_USE=3, DEPOSIT=CONFIG.DEPOSIT_RATE;
const SHIP_FEE={hn:CONFIG.SHIP_HANOI,tinh:CONFIG.SHIP_PROVINCE};
const round100=n=>Math.round(n/100)*100;
/* Bảng tiền (trình duyệt chỉ để hiển thị; Apps Script tính lại ở server).
   tiền hàng = giá + (số cuốn − 1) × giá × (1 − SECOND_COPY_DISCOUNT); mã KOC giảm % trên tiền hàng;
   cọc = 50% tiền hàng sau giảm; COD = phần còn lại + ship; trả đủ 100% thì miễn ship. */
function quote(o){
  const t=tierOf(o.tier), qty=Math.max(1,Math.min(CONFIG.MAX_COPIES,o.qty|0||1));
  const extra=(qty-1)*round100(t.price*(1-CONFIG.SECOND_COPY_DISCOUNT));
  const goods=t.price+extra;
  const kocPct=o.koc&&o.koc.pct?o.koc.pct:0;
  const disc=round100(goods*kocPct/100);
  const net=goods-disc;
  const full=o.pay==='full';
  const ship=full?0:(SHIP_FEE[o.area]||SHIP_FEE.tinh);
  const payNow=full?net:round100(net*DEPOSIT);
  const cod=full?0:net-payNow+ship;
  return {tier:t.id,price:t.price,qty,extra,goods,kocPct,disc,net,ship,total:net+ship,payNow,cod,full};
}
/* Every face below ships a Vietnamese subset on Google Fonts; each is used ONLY at a weight it actually has (no faux bold). */
const FONTS=[
 {id:'paytone',name:'Paytone One',css:"'Paytone One',sans-serif",w:400,label:'Đậm tròn · mặc định'},
 {id:'anton',name:'Anton',css:"'Anton',sans-serif",w:400,label:'Poster hẹp'},
 {id:'oswald',name:'Oswald',css:"'Oswald',sans-serif",w:700,label:'Tạp chí cao'},
 {id:'montserrat',name:'Montserrat',css:"'Montserrat',sans-serif",w:900,label:'Hiện đại đậm'},
 {id:'bevn',name:'Be Vietnam Pro',css:"'Be Vietnam Pro',sans-serif",w:800,label:'Gọn gàng'},
 {id:'playfair',name:'Playfair Display',css:"'Playfair Display',serif",w:800,label:'Cổ điển'},
 {id:'playfairi',name:'Playfair Italic',css:"'Playfair Display',serif",w:600,it:1,label:'Nghiêng sang'},
 {id:'lora',name:'Lora',css:"'Lora',serif",w:700,label:'Sách văn học'},
 {id:'cormorant',name:'Cormorant',css:"'Cormorant Garamond',serif",w:600,it:1,label:'Nghệ thuật mảnh'},
 {id:'dancing',name:'Dancing Script',css:"'Dancing Script',cursive",w:700,label:'Bút máy'},
 {id:'charm',name:'Charm',css:"'Charm',cursive",w:700,label:'Thư pháp mềm'},
 {id:'pangolin',name:'Pangolin',css:"'Pangolin',cursive",w:400,label:'Viết tay'},
 {id:'patrick',name:'Patrick Hand',css:"'Patrick Hand',cursive",w:400,label:'Nét bút dạ'},
 {id:'sriracha',name:'Sriracha',css:"'Sriracha',cursive",w:400,label:'Cọ vẽ'},
 {id:'mali',name:'Mali',css:"'Mali',cursive",w:700,label:'Tròn dễ thương'}];
const fontOf=id=>FONTS.find(f=>f.id===id)||FONTS[0];
const GF="https://fonts.googleapis.com/css2?family=Paytone+One&family=Anton&family=Oswald:wght@700&family=Mulish:wght@700;800;900&family=Nunito:wght@600;700;800;900&family=Be+Vietnam+Pro:wght@500;800&family=Playfair+Display:ital,wght@0,800;1,600&family=Lora:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@1,600&family=Dancing+Script:wght@700&family=Charm:wght@700&family=Pangolin&family=Patrick+Hand&family=Sriracha&family=Mali:wght@700&display=swap";

/* cover templates: bg, title colour, subtitle colour, mode center|bleed */
const TPL=[
 {id:'hanoi',name:'Hà Nội · sen Hồ Tây',bg:'#E9D3E6',ink:'#FFFFFF',sub:'#B76E9E',title:'HÀ NỘI',subt:'SEN HỒ TÂY',art:'lotus'},
 {id:'hoian',name:'Hội An · đèn lồng',bg:'#F7EEDF',ink:'#E0533F',sub:'#E0533F',title:'HỘI AN',subt:'ĐÊM ĐÈN LỒNG',art:'lantern'},
 {id:'saigon',name:'Sài Gòn · cà phê sữa đá',bg:'#D7ECEE',ink:'#FFFFFF',sub:'#6B9CA3',title:'SÀI GÒN',subt:'CÀ PHÊ SỮA ĐÁ',art:'phin'},
 {id:'dalat',name:'Đà Lạt · cẩm tú cầu',bg:'#E3E7F6',ink:'#7B8FD1',sub:'#7B8FD1',title:'ĐÀ LẠT',subt:'MÙA MƯA CỦA TỤI MÌNH',art:'hydrangea'},
 {id:'beach',name:'Biển mùa hè',bg:'#BFE6EE',ink:'#FFFFFF',sub:'#3E8FA6',title:'BIỂN',subt:'MÙA HÈ CỦA HAI ĐỨA',art:'starfish',mode:'bleed'},
 {id:'vespa',name:'Vespa · phượt cùng nhau',bg:'#FBE3EA',ink:'#E8577A',sub:'#E8577A',title:'HAI ĐỨA',subt:'PHƯỢT CÙNG NHAU',art:'vespa'},
 {id:'camera',name:'Máy ảnh film',bg:'#F3E9DA',ink:'#6E6A6C',sub:'#D96886',title:'TỤI MÌNH',subt:'CUỘN FILM ĐẦU TIÊN',art:'camera'},
 {id:'ticket',name:'Vé tàu Bắc – Nam',bg:'#FCEBD0',ink:'#E36B4F',sub:'#C98A3C',title:'CHUYẾN TÀU',subt:'HÀ NỘI — SÀI GÒN',art:'ticket'},
 {id:'tulips',name:'Bó tulip tháng Ba',bg:'#FDE7EC',ink:'#E8577A',sub:'#F08FA8',title:'LOVE U',subt:'THÁNG BA',art:'tulips'},
 {id:'ringbox',name:'Hộp nhẫn cầu hôn',bg:'#F4E7EE',ink:'#8E4A6A',sub:'#B57A95',title:'YES!',subt:'NGÀY ANH NGỎ LỜI',art:'ringbox'},
 {id:'vinyl',name:'Đĩa than · bài hát chung',bg:'#F7E0B5',ink:'#FFFFFF',sub:'#C6873A',title:'BÀI HÁT',subt:'CỦA CHÚNG MÌNH',art:'vinyl',mode:'bleed'},
 {id:'moon',name:'Trăng sao · ngắm sao',bg:'#2F3554',ink:'#F3D57E',sub:'#C9B677',title:'NGẮM SAO',subt:'ĐÊM HÔM ĐÓ',art:'moon'},
 {id:'umbrella',name:'Chung một chiếc ô',bg:'#DCE9F4',ink:'#5C8FC0',sub:'#5C8FC0',title:'MƯA',subt:'CHUNG MỘT CHIẾC Ô',art:'umbrella'},
 {id:'letter',name:'Lá thư tay',bg:'#F8E9D6',ink:'#C9433C',sub:'#C98A5E',title:'GỬI EM',subt:'NHỮNG LÁ THƯ TAY',art:'letter'},
 {id:'cat',name:'Mèo nhà',bg:'#FFE9CF',ink:'#FFFFFF',sub:'#D9853A',title:'NHÀ MÌNH',subt:'HAI NGƯỜI MỘT MÈO',art:'cat',mode:'bleed'},
 {id:'bubbletea',name:'Trà sữa hẹn hò',bg:'#F3E3D3',ink:'#B07A55',sub:'#E8577A',title:'TRÀ SỮA',subt:'BUỔI HẸN ĐẦU TIÊN',art:'bubbletea'},
 {id:'cake',name:'Bánh kem sinh nhật',bg:'#FCE3E8',ink:'#E8577A',sub:'#F08FA8',title:'HAPPY',subt:'SINH NHẬT EM',art:'cake'},
 {id:'suitcase',name:'Vali yêu xa',bg:'#DDEFEA',ink:'#3F7A74',sub:'#5FA8A0',title:'YÊU XA',subt:'2.000 KM',art:'suitcase'},
 /* bìa địa danh (dùng bộ 57 hình) */
 {id:'hue',name:'Huế · chùa Thiên Mụ',bg:'#E4DDF1',ink:'#FFFFFF',sub:'#8B74B8',title:'HUẾ',subt:'CHÙA THIÊN MỤ',art:'chua-thien-mu-hue',place:1},
 {id:'danang',name:'Đà Nẵng · cầu Rồng',bg:'#D9EFEC',ink:'#E07A2E',sub:'#4F9C96',title:'ĐÀ NẴNG',subt:'CẦU RỒNG',art:'cau-rong-da-nang',place:1},
 {id:'thaprua',name:'Hà Nội · Tháp Rùa',bg:'#DCEFEA',ink:'#FFFFFF',sub:'#4F9C96',title:'HÀ NỘI',subt:'THÁP RÙA · HỒ GƯƠM',art:'thap-rua-ha-noi',place:1},
 {id:'motcot',name:'Hà Nội · chùa Một Cột',bg:'#F6E7D6',ink:'#C9443A',sub:'#A0674B',title:'HÀ NỘI',subt:'CHÙA MỘT CỘT',art:'chua-mot-cot-ha-noi',place:1},
 {id:'haiphong',name:'Hải Phòng · hoa phượng',bg:'#FCE3DC',ink:'#E0533F',sub:'#D9526B',title:'HẢI PHÒNG',subt:'MÙA HOA PHƯỢNG',art:'hoa-phuong-hai-phong',place:1},
 {id:'halong',name:'Hạ Long · vịnh di sản',bg:'#CFEAF0',ink:'#FFFFFF',sub:'#3E8FA6',title:'HẠ LONG',subt:'VỊNH CỦA HAI ĐỨA',art:'vinh-ha-long-quang-ninh',place:1},
 {id:'sapa',name:'Sa Pa · ruộng bậc thang',bg:'#E6F0D8',ink:'#6E9A52',sub:'#4F7A3E',title:'SA PA',subt:'RUỘNG BẬC THANG',art:'ruong-bac-thang-sa-pa',place:1},
 {id:'ngomon',name:'Huế · Ngọ Môn',bg:'#F7E3E6',ink:'#C9443A',sub:'#B57A95',title:'HUẾ',subt:'NGỌ MÔN · ĐẠI NỘI',art:'ngo-mon-hue',place:1},
 {id:'cauvang',name:'Đà Nẵng · Cầu Vàng',bg:'#E3EEDC',ink:'#DDA543',sub:'#6E9A52',title:'ĐÀ NẴNG',subt:'CẦU VÀNG · BÀ NÀ',art:'cau-vang-da-nang',place:1},
 {id:'chuacau',name:'Hội An · Chùa Cầu',bg:'#FBEBCF',ink:'#C9443A',sub:'#C98A3C',title:'HỘI AN',subt:'CHÙA CẦU',art:'chua-cau-hoi-an',place:1},
 {id:'gadalat',name:'Đà Lạt · ga xe lửa',bg:'#E9E3F4',ink:'#9A88C8',sub:'#7E6AB0',title:'ĐÀ LẠT',subt:'GA XE LỬA CŨ',art:'ga-da-lat',place:1},
 {id:'benthanh',name:'Sài Gòn · chợ Bến Thành',bg:'#FCEBD9',ink:'#E07A2E',sub:'#A0674B',title:'SÀI GÒN',subt:'CHỢ BẾN THÀNH',art:'cho-ben-thanh-tp-hcm',place:1},
 {id:'365',name:'Kỷ niệm 1 năm',bg:'#8E1A43',ink:'#FCEFD9',sub:'#F2A7BE',title:'365',subt:'NGÀY BÊN NHAU',font:'anton',textOnly:1,big:150},
 {id:'story',name:'Our Story',bg:'#EDE3D5',ink:'#2B2224',sub:'#8A7A6E',title:'Our Story',subt:'VOL. 01 · 2024 — 2026',font:'playfairi',textOnly:1,big:62},
];
const CUSTOM={id:'custom',name:'Tự thiết kế',bg:'#F4F1EC',ink:'#2E2E2E',sub:'#8E8E8A',title:'TÊN CUỐN SÁCH',subt:'DÒNG PHỤ',art:'heart',custom:1};
const tplOf=id=>id==='custom'?CUSTOM:(TPL.find(t=>t.id===id)||TPL[0]);
const BG_SWATCHES=['#D4E8DE','#F6E3B4','#FAD7C7','#CDEBF2','#EEDFCB','#F9D4DE','#E7E2F4','#DCE9CC','#FCE4EA','#F2E8DA','#2F3A56','#1F2A44','#8E1A43','#FFFFFF'];
const INK_SWATCHES=['#2E2E2E','#FFFFFF','#E0457B','#C0392B','#B4532A','#6B4423','#2F6B57','#1F6FA3','#5B3F9E','#F6D7A7','#F5E6B8'];
const CHAPTERS=[{no:'01',t:'Khởi đầu',bg:'#FCE4EA',ink:'#B23A5B'},{no:'02',t:'Hành trình',bg:'#F6EBCD',ink:'#8A5A12'},{no:'03',t:'Hiện tại & lời hứa',bg:'#E0EAD9',ink:'#3E5B2A'}];
const vnd=n=>Math.round(n).toLocaleString('vi-VN').replace(/,/g,'.')+'đ';
const dep=p=>Math.round(p*DEPOSIT/100)*100;
const strip=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');

/* ===== editorial layout engine (A–F), 100% photos, fits the tier's page budget ===== */
const LAYOUTS={A:{n:'Hero',need:1},B:{n:'Đôi dọc',need:2},C:{n:'Collage lệch',need:3},D:{n:'Toàn cảnh',need:2},E:{n:'Dải ba ảnh',need:3},F:{n:'Mở chương',need:1}};
const orient=p=>{const r=p.w/p.h;return r>1.15?'L':r<.87?'P':'S'};
function autoLayout(photos,pages,notes){
  const budget=Math.floor((pages-2)/2);
  const per=[1,2,3].map(c=>photos.filter(p=>p.ch===c).length), total=per.reduce((a,b)=>a+b,0)||1;
  const mins=per.map(n=>n?1+Math.ceil(Math.max(0,n-2)/3):0);
  const extra=Math.max(0,budget-mins.reduce((a,b)=>a+b,0));
  const cb=mins.map((m,i)=>m+Math.floor(extra*per[i]/total));
  let rest=budget-cb.reduce((a,b)=>a+b,0); for(let i=0;rest>0;i=(i+1)%3){if(per[i]){cb[i]++;rest--}}
  const out=[];
  [1,2,3].forEach(ch=>{
    const q=photos.filter(p=>p.ch===ch); if(!q.length) return;
    const nts=(notes&&notes[ch])||[];
    const tight=cb[ch-1]<1+Math.ceil((q.length-1)/3);
    out.push({L:'F',ch,ph:q.splice(0,tight?2:1).map(p=>p.id),note:nts[0]||''});
    let prev='F',made=1,ni=1;
    while(q.length){
      const [a,b]=q.map(orient), left=Math.max(1,cb[ch-1]-made), need=q.length/left;
      let pick;
      if(ni<nts.length&&prev!=='A'&&need<=2.2) pick='A';
      else if(left<=1&&q.length<=3) pick=q.length===3?(a==='P'?'C':'E'):q.length===2?(a==='L'?'D':'B'):'A';
      else{const c=[];if(a==='L'&&q.length>=2)c.push('D');if(a==='P'&&q.length>=3)c.push('C');if(a==='P'&&b==='P')c.push('B');if(q.length>=3)c.push('E');if(q.length>=2)c.push('B');c.push('A');
        let best=1e9;c.forEach((k,i)=>{const s=Math.abs(Math.min(LAYOUTS[k].need,q.length)-Math.min(3,need+.25))+(k===prev?.7:0)+i*.08;if(s<best){best=s;pick=k}})}
      const s={L:pick,ch,ph:q.splice(0,Math.min(LAYOUTS[pick].need,q.length)).map(p=>p.id)};
      if(pick==='A'&&ni<nts.length)s.note=nts[ni++];
      out.push(s);prev=pick;made++;
    }
  });
  return out;
}
/* frames per page [x,y,w,h] in % */
const FR={A:{L:[[9,9,82,66]],R:[]},B:{L:[[14,15,72,62]],R:[[14,15,72,62]]},C:{L:[[9,9,82,76]],R:[[10,8,62,38],[30,52,60,38]]},
 D:{L:[[0,0,100,100]],R:[[24,30,52,34]]},E:{L:[[30,6,40,27],[30,37,40,27],[30,68,40,27]],R:[]},F:{L:[],R:[[10,10,80,70]]},F2:{L:[],R:[[12,8,76,40],[12,52,76,40]]}};
