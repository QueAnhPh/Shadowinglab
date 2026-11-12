// Hình minh họa từ vựng cho PPT: Fluent Emoji Flat (MIT, Microsoft) tô lại theo bảng màu của giáo án.
// npm i @iconify-json/fluent-emoji-flat @iconify/utils  →  node render_pics.js map.json pics
// map.json = {"<số từ>": "<tên icon fluent-emoji-flat>"}; tra tên: icones.js.org/collection/fluent-emoji-flat
const { getIconData, iconToSVG, iconToHTML } = require('@iconify/utils');
const set = require('@iconify-json/fluent-emoji-flat/icons.json');
const sharp = require('/opt/npm-tools/node_modules/sharp');
const fs = require('fs');
const map = require(process.argv[2] || './map.json');
// brand palette with light/base/dark steps
const P = ['FFFFFF','FFF8EF','FDEEE9','F6D9C7','E9D3B8','C9A27E','8B5E3C','5C3B24',
 'F4A58C','E4572E','B23A1A','F9D49A','F2A541','C47F1F','CFE3C0','A9C98F','6A994E','3F6A2C','2F6B55','1F4E3D',
 'BFDCEA','7FB3CC','3A86A8','245B75','D7C6EA','8E5BB5','5E3A80','D9DED9','9AA39C','5C655F','1E2A24'];
const rgb = h => [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
const toLab = ([r,g,b]) => { const f=c=>{c/=255;return c>0.04045?((c+0.055)/1.055)**2.4:c/12.92}; let R=f(r),G=f(g),B=f(b);
 let X=(R*0.4124+G*0.3576+B*0.1805)/0.95047,Y=R*0.2126+G*0.7152+B*0.0722,Z=(R*0.0193+G*0.1192+B*0.9505)/1.08883;
 const t=v=>v>0.008856?Math.cbrt(v):7.787*v+16/116; X=t(X);Y=t(Y);Z=t(Z); return [116*Y-16,500*(X-Y),200*(Y-Z)]; };
const PL = P.map(h=>[h,toLab(rgb(h))]);
const near = h => { if (h.length===3) h=h.split('').map(c=>c+c).join(''); const L=toLab(rgb(h)); let b=null,bd=1e9;
 for (const [ph,pl] of PL){ const d=(L[0]-pl[0])**2*0.6+(L[1]-pl[1])**2+(L[2]-pl[2])**2; if(d<bd){bd=d;b=ph;} } return b; };
(async () => {
 const OUT = process.argv[3] || 'pics'; fs.mkdirSync(OUT,{recursive:true});
 for (const [k,name] of Object.entries(map)) {
  const d = getIconData(set, name); const r = iconToSVG(d, { height: 512 });
  let svg = iconToHTML(r.body, r.attributes);
  svg = svg.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (m,h)=>'#'+near(h.toUpperCase()));
  await sharp(Buffer.from(svg)).resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(`${OUT}/${k}.png`);
 }
 console.log('done', Object.keys(map).length);
})();
