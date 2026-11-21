/* Build dashboard.html (thay build.sh cũ; chạy được trên Windows).
   Cách chạy:  npm install   rồi   node build.js
   Ra 1 file dashboard.html tự chứa (font Montserrat + Mulish nhúng sẵn, mở offline được). */
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const D = __dirname, nm = path.join(D, 'node_modules');
const run = (c) => execSync(c, { cwd: D, stdio: 'inherit' });
run(`"${process.execPath}" "${path.join(nm, 'tailwindcss', 'lib', 'cli.js')}" -i src/in.css -o build.css --minify`);
require('esbuild').buildSync({
  entryPoints: [path.join(D, 'src', 'main.jsx')], bundle: true, minify: true, format: 'iife',
  define: { 'process.env.NODE_ENV': '"production"' }, outfile: path.join(D, 'bundle.js'), logLevel: 'warning',
  loader: { '.jsx': 'jsx', '.svg': 'dataurl' },
});
/* nhúng font: chỉ subset latin + latin-ext + vietnamese */
function embed(pkg, weights) {
  let out = '';
  for (const w of weights) {
    for (const sub of ['vietnamese', 'latin-ext', 'latin']) {
      const file = path.join(nm, '@fontsource', pkg, 'files', `${pkg}-${sub}-${w}-normal.woff2`);
      if (!fs.existsSync(file)) continue;
      const fam = pkg === 'montserrat' ? 'Montserrat' : 'Mulish';
      const range = { vietnamese: 'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB', 'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF', latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' }[sub];
      out += `@font-face{font-family:'${fam}';font-style:normal;font-display:swap;font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(file).toString('base64')}) format('woff2');unicode-range:${range}}`;
    }
  }
  return out;
}
const fonts = embed('montserrat', [400, 500, 600, 700, 800]) + embed('mulish', [800, 900]);
const css = fs.readFileSync(path.join(D, 'build.css'), 'utf8');
const js = fs.readFileSync(path.join(D, 'bundle.js'), 'utf8').replace(/<\/script/g, '<\\/script');
const html = `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Our Archive · Dashboard khởi nghiệp</title>
<style>${fonts}</style><style>${css}</style></head><body style="margin:0;background:#fff"><div id="root"></div><script>${js}</script></body></html>`;
fs.writeFileSync(path.join(D, 'dashboard.html'), html);
fs.unlinkSync(path.join(D, 'bundle.js')); fs.unlinkSync(path.join(D, 'build.css'));
console.log('dashboard.html', Math.round(html.length / 1024), 'KB');
