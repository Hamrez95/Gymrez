import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { PNG } from 'pngjs';
const source = 'docs/mockups/pace';
const output = 'docs/implementation/evidence/T01';
const boxes = {
 '00': [[11,155,850,834],[880,154,310,834],[1213,154,316,834]],
 '01': [[11,155,850,834],[879,154,313,835],[1212,154,314,835]],
 '02': [[24,94,479,907],[530,94,475,907],[1033,94,478,907]],
 '03': [[12,135,823,843],[852,135,313,845],[1188,135,336,845]],
 '04': [[36,80,975,453],[1044,80,455,455],[36,549,758,456],[813,549,684,456]],
 '05': [[12,155,850,834],[880,154,313,835],[1212,154,314,835]],
 '06': [[12,155,850,834],[880,154,313,835],[1212,154,314,835]],
 '07': [[12,155,850,834],[880,154,313,835],[1212,154,314,835]]
};
await fs.mkdir(output,{recursive:true});
const report=[];
for(const filename of (await fs.readdir(source)).filter(name=>name.endsWith('.png')).sort()){
 const bytes=await fs.readFile(path.join(source,filename)), png=PNG.sync.read(bytes), prefix=filename.slice(0,2);
 const panels=[];
 for(const [i,[x,y,width,height]] of boxes[prefix].entries()){
  if(x+width>png.width||y+height>png.height) throw new Error('Crop outside '+filename);
  const crop=new PNG({width,height});
  PNG.bitblt(png,crop,x,y,width,height,0,0);
  const cropName=prefix+'-panel-'+(i+1)+'.png';
  await fs.writeFile(path.join(output,cropName),PNG.sync.write(crop));
  panels.push({file:cropName,x,y,width,height,method:'manual visible app bounds, ±2px; status bar/frame excluded where possible'});
 }
 const colors=new Map();
 for(let y=210;y<350;y++)for(let x=380;x<650;x++){
  const j=(y*png.width+x)*4, rgb=[...png.data.subarray(j,j+3)], hex='#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('');
  colors.set(hex,(colors.get(hex)||0)+1);
 }
 report.push({source:filename,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),width:png.width,height:png.height,panels,sampledRegion:{x:380,y:210,width:270,height:140},mostFrequentExactColors:[...colors].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([hex,count])=>({hex,count}))});
}
await fs.writeFile(path.join(output,'reference-manifest.json'),JSON.stringify({note:'Raster measurements, not original Figma tokens. Font identity cannot be recovered exactly from PNG.',references:report},null,2)+'\n');
console.log('Verified',report.length,'sources;',report.reduce((n,r)=>n+r.panels.length,0),'native panel crops. Original PNGs untouched.');
