function productionSheet() {
  const t = tierOf(S.tier),
    b = S.book,
    tp = tplOf(b.tpl);
  const L = [];
  L.push('OUR ARCHIVE · PHIẾU LỆNH SẢN XUẤT');
  L.push('mã đơn: ' + (S.code || '(chưa đặt)'));
  L.push(
    'quy cách: B5 nhỡ 165×235mm · bìa cứng matte · ruột mỹ thuật 200gsm · ' +
      t.pages +
      ' trang · gáy ' +
      t.spine,
  );
  L.push('mẫu bìa: ' + tp.name + ' · nền ' + b.spreads[0].R.bg);
  b.spreads.forEach((sp, i) => {
    L.push('');
    L.push('[' + spreadLabel(i, b) + ']' + (sp.lay ? ' bố cục ' + sp.lay + ' · chương 0' + sp.ch : ''));
    ['L', 'R'].forEach((s) => {
      const pg = sp[s];
      if (pg.dark) {
        L.push('  ' + s + ': giấy lót');
        return;
      }
      (pg.frames || []).forEach((f, k) =>
        L.push(`  ${s} khung ${k + 1} [${f.f.join(',')}%]: ${f.ph || 'TRỐNG'}`),
      );
      (pg.els || []).forEach((e) =>
        L.push(
          e.k === 't'
            ? `  ${s} chữ "${e.text.replace(/\n/g, ' / ')}" · ${fontOf(e.font).name} ${e.size} · ${e.color} · (${Math.round(e.x)}%,${Math.round(e.y)}%)`
            : `  ${s} hình "${ART[e.art].name}" · rộng ${Math.round(e.w)}% · (${Math.round(e.x)}%,${Math.round(e.y)}%)${e.flip ? ' · lật' : ''}`,
        ),
      );
    });
  });
  L.push('');
  L.push(
    'giá gói: ' +
      vnd(t.price) +
      ' · quà: ' +
      t.gift +
      (S.order
        ? ' · tổng đơn ' +
          vnd(S.order.total) +
          ' · đã/cần chuyển khoản ' +
          vnd(S.order.payNow) +
          ' · COD ' +
          vnd(S.order.cod)
        : ''),
  );
  return L.join('\n');
}
