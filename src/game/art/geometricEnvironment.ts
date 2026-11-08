import Phaser from 'phaser';
import { groundY, isGap, level01 } from '../levels/level01';

// High-resolution geometric textures. No low-resolution pixel grid or copied assets.
type Context = CanvasRenderingContext2D;
function rect(c: Context, color: string, x: number, y: number, w: number, h: number) { c.fillStyle=color;c.fillRect(x,y,w,h); }
function polygon(c: Context, color: string, points: number[][]) { c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill(); }
function line(c:Context,color:string,width:number,points:number[][]){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function texture(scene:Phaser.Scene,key:string,w:number,h:number,paint:(c:Context)=>void){
  if(scene.textures.exists(key))return;
  // Small foreground objects are rasterised at 2x and displayed at half scale.
  const density = w <= 300 && h <= 300 ? 2 : 1;
  const canvas=document.createElement('canvas');canvas.width=w*density;canvas.height=h*density;
  const ctx=canvas.getContext('2d')!;ctx.scale(density,density);
  paint(ctx);scene.textures.addCanvas(key,canvas);
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
}
function clipPolygon(c:Context,points:number[][]){
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
}
function house(c:Context,variant:number){
  // The structural lines remain Dagestani: flat coping, stone walls, arcades, timber galleries.
  polygon(c,'#344b59',[[24,53],[65,35],[260,35],[260,280],[65,280],[24,264]]);
  polygon(c,'#65776f',[[24,53],[65,35],[65,280],[24,264]]);
  rect(c,'#b5b496',65,48,192,232);
  polygon(c,'#a6a88e',[[65,48],[257,48],[257,280],[199,280]]);
  rect(c,'#d3caa5',65,48,135,6);
  // Quiet large-scale masonry geometry, rather than noisy blocks.
  c.save();c.beginPath();c.rect(65,54,192,226);c.clip();
  for(let y=65;y<277;y+=30){line(c,'#929c89',1,[[66,y],[256,y]]);for(let x=80+(y%60===5?0:24);x<250;x+=48)line(c,'#929c89',1,[[x,y],[x,y+29]]);}
  c.restore();
  rect(c,'#243d4f',19,38,247,15);rect(c,'#d9d1b0',19,34,247,5);
  polygon(c,'#7f9487',[[19,34],[55,21],[258,21],[266,34]]);
  line(c,'#c9dfc8',2,[[22,34],[264,34]]);
  const window=(x:number,y:number)=>{
    rect(c,'#6c8078',x-5,y-5,38,51);rect(c,'#233f50',x,y,28,40);
    const light=c.createLinearGradient(x,y,x+25,y+40);light.addColorStop(0,'#54aaa9');light.addColorStop(1,'#c7dcaf');c.fillStyle=light;c.fillRect(x+3,y+3,22,34);
    rect(c,'#435c60',x+13,y+1,2,38);rect(c,'#435c60',x+1,y+20,26,2);rect(c,'#d8d0aa',x-5,y+43,38,3);
    polygon(c,'#7f8e7c',[[x+33,y-4],[x+43,y],[x+43,y+42],[x+33,y+45]]);
  };
  window(94,79);window(196,79);window(195,199);
  c.fillStyle='#243d4d';c.beginPath();c.moveTo(99,280);c.lineTo(99,215);c.quadraticCurveTo(128,164,157,215);c.lineTo(157,280);c.fill();
  rect(c,'#748375',107,219,42,61);rect(c,'#9a9d7e',111,222,34,58);
  for(const x of [118,128,138])line(c,'#5f736b',2,[[x,223],[x,278]]);
  rect(c,'#d8cb95',139,248,4,4);line(c,'#c6c9a5',3,[[98,281],[159,281]]);
  if(variant===1){
    rect(c,'#2c4550',70,138,195,63);polygon(c,'#809385',[[63,136],[89,124],[275,124],[266,139]]);
    line(c,'#c1c7a3',3,[[64,136],[266,136]]);
    for(const x of [76,166,256]){rect(c,'#445e5e',x,138,7,83);rect(c,'#a6b095',x,139,2,81);}
    for(let x=86;x<258;x+=13)rect(c,'#9bab91',x,190,3,27);
    rect(c,'#d0cba4',73,187,192,4);rect(c,'#344d54',69,216,202,9);line(c,'#aab89b',2,[[69,216],[271,216]]);
  }
  if(variant===2){polygon(c,'#4e6972',[[17,38],[58,11],[221,11],[270,38]]);polygon(c,'#71908f',[[17,35],[58,9],[221,9],[270,35]]);line(c,'#b5c9b6',3,[[20,35],[266,35]]);}
  rect(c,'#4a655e',250,152,4,126);
  for(let y=160;y<275;y+=18)polygon(c,'#74966e',[[251,y],[239,y-7],[235,y-1],[249,y+5]]);
  rect(c,'#324b54',172,219,3,29);rect(c,'#9db8a1',169,227,9,17);rect(c,'#e7dfaf',171,230,5,10);
}
export const distantHillRidge: number[][] = [[0,430],[400,250],[790,130],[1080,320],[1420,420],[1900,230],[2230,120],[2600,330],[3000,240]];
export function distantHillY(x:number):number{
  for(let i=1;i<distantHillRidge.length;i++){
    const [ax,ay]=distantHillRidge[i-1],[bx,by]=distantHillRidge[i];
    if(x<=bx)return ay+(by-ay)*(Math.max(ax,x)-ax)/(bx-ax);
  }
  return distantHillRidge[distantHillRidge.length-1][1];
}
export function createGeometricTextures(scene:Phaser.Scene){
  ['house-terrace','house-balcony','house-small'].forEach((k,i)=>texture(scene,k,288,288,c=>house(c,i)));
  texture(scene,'geo-sky',8,720,c=>{const g=c.createLinearGradient(0,0,0,720);g.addColorStop(0,'#193d58');g.addColorStop(.6,'#668e9d');g.addColorStop(1,'#adc2b1');c.fillStyle=g;c.fillRect(0,0,8,720);});
  texture(scene,'geo-mountains',3000,900,c=>{
    const peaks=[[0,660],[190,510],[330,570],[610,170],[770,355],[860,302],[1110,590],[1370,95],[1525,350],[1645,265],[1850,610],[2110,220],[2320,470],[2490,310],[2720,590],[3000,430],[3000,900],[0,900]];
    polygon(c,'#638291',peaks);
    c.save();clipPolygon(c,peaks);
    polygon(c,'#405e79',[[610,170],[650,490],[850,900],[280,900],[330,570]]);
    polygon(c,'#3b5873',[[1370,95],[1400,550],[1645,265],[1600,660],[1870,900],[980,900]]);
    polygon(c,'#4b6d80',[[2110,220],[2160,630],[2490,310],[2450,750],[2700,900],[1850,900]]);
    polygon(c,'#a3bcb6',[[530,283],[610,170],[770,355],[700,320],[666,345],[633,267],[595,315],[577,270]]);
    polygon(c,'#bbd1c4',[[1266,277],[1370,95],[1525,350],[1430,282],[1404,314],[1360,202],[1325,277],[1300,242]]);
    line(c,'#789eaa',2,[[610,170],[650,490],[850,900]]);line(c,'#91b4b7',2,[[1370,95],[1400,550],[1645,265]]);
    c.restore();
  });
  texture(scene,'geo-hills',3000,690,c=>{
    const silhouette=[...distantHillRidge,[3000,690],[0,690]];
    polygon(c,'#316c70',silhouette);c.save();clipPolygon(c,silhouette);
    polygon(c,'#27565f',[[0,520],[400,250],[560,570],[790,130],[900,540],[1420,560],[1900,230],[2040,540],[2230,120],[2400,590],[3000,400],[3000,690],[0,690]]);
    line(c,'#4a8580',2,[[0,430],[400,250],[790,130],[1080,320],[1420,420],[1900,230],[2230,120]]);
    c.restore();
  });
  texture(scene,'geo-tree',168,240,c=>{
    // Branches sit behind a joined crown built from circular lobes.
    polygon(c,'#2b4950',[[77,238],[81,113],[96,113],[94,238]]);
    polygon(c,'#82947b',[[79,238],[84,133],[87,238]]);
    line(c,'#385951',8,[[85,174],[49,125]]);line(c,'#385951',7,[[89,157],[125,107]]);
    const crown=()=>{
      c.beginPath();
      for(const [x,y,r] of [[41,111,36],[78,68,44],[125,106,36],[87,131,43]]){
        c.moveTo(x+r,y);c.arc(x,y,r,0,Math.PI*2);
      }
      c.rect(30,126,109,35);
    };
    crown();c.fillStyle='#315f55';c.fill();
    c.save();crown();c.clip();
    c.fillStyle='#4e8466';c.beginPath();c.ellipse(66,100,65,64,-.25,0,Math.PI*2);c.fill();
    c.fillStyle='#78a171';c.beginPath();c.arc(72,64,39,Math.PI,Math.PI*2);c.fill();
    c.beginPath();c.arc(36,109,29,Math.PI,Math.PI*2);c.fill();
    c.fillStyle='#659368';c.beginPath();c.arc(120,104,30,Math.PI,Math.PI*2);c.fill();
    c.fillStyle='#416f5c';c.beginPath();c.ellipse(112,154,43,27,0,0,Math.PI*2);c.fill();
    c.restore();
  });
  texture(scene,'geo-shrub',96,48,c=>{polygon(c,'#264f50',[[0,48],[7,24],[26,9],[45,17],[60,3],[86,22],[96,48]]);polygon(c,'#4d8264',[[7,24],[26,9],[45,17],[29,36],[60,3],[68,31],[86,22],[96,48],[0,48]]);line(c,'#83a76e',2,[[8,24],[26,10],[45,18]]);});
  texture(scene,'geo-cloud',288,72,c=>{polygon(c,'#9cb8bc',[[0,62],[60,45],[100,18],[146,11],[177,31],[226,35],[288,62]]);polygon(c,'#c2d2c6',[[20,58],[100,18],[146,11],[177,31],[127,27],[88,48]]);});
  texture(scene,'geo-terrain',level01.width,1900,c=>{
    // Draw each connected bank as continuous paths, not fractional 1px columns.
    const sections=[[0,level01.gaps[0].from],[level01.gaps[0].to,level01.width]];
    const surfaces=sections.map(([from,to])=>[
      [from,groundY(from)],...level01.ground.filter(p=>p.x>from&&p.x<to).map(p=>[p.x,p.y]),[to,groundY(to)],
    ]);
    for(const surface of surfaces){
      const from=surface[0][0],to=surface[surface.length-1][0];
      polygon(c,'#293f4c',[...surface.map(([x,y])=>[x,y-3]),[to,1900],[from,1900]]);
      polygon(c,'#376355',[...surface.map(([x,y])=>[x,y+7]),...surface.slice().reverse().map(([x,y])=>[x,y+40])]);
      polygon(c,'#8da96d',[...surface.map(([x,y])=>[x,y-3]),...surface.slice().reverse().map(([x,y])=>[x,y+8])]);
      line(c,'#c2c199',3,surface.map(([x,y])=>[x,y-1.5]));
    }
    // Large facets with hairline seams keep the cross-section crisp and restrained.
    for(let x=0;x<level01.width;x+=84){if(isGap(x)||isGap(x+70))continue;const y=groundY(x);
      polygon(c,x%168?'#304b55':'#35535b',[[x,y+42],[x+78,y+64],[x+50,y+190],[x+10,y+218]]);
      line(c,'#44645f',1,[[x,y+42],[x+78,y+64],[x+50,y+190]]);
      polygon(c,'#25444d',[[x+13,y+222],[x+52,y+194],[x+80,y+310],[x,y+337]]);
    }
    for(let x=12;x<level01.width;x+=43){if(isGap(x))continue;const y=groundY(x);line(c,'#b1c185',1,[[x,y+16],[x-3,y+8],[x,y+12],[x+4,y+6]]);}
  });
}
