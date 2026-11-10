import Phaser from 'phaser';
import { environmentBounds, heroBounds } from './assetBounds';
import { groundY, level01 } from '../levels/level01';

// The artwork lives in WebP files. Canvas only extracts/alines sprites and maps
// the illustrated ground texture onto the existing collision profile.
export function prepareIllustratedAssets(scene:Phaser.Scene){
  const env=scene.textures.get('environment-source').getSourceImage() as HTMLImageElement;
  const object=(key:string,bounds:readonly number[],w:number,h:number)=>{
    if(scene.textures.exists(key))return;
    const cv=document.createElement('canvas');cv.width=w*2;cv.height=h*2;
    const c=cv.getContext('2d')!;
    const [sx,sy,sw,sh]=bounds;
    const scale=Math.min((cv.width-12)/sw,(cv.height-16)/sh);
    const dw=sw*scale,dh=sh*scale;
    c.drawImage(env,sx,sy,sw,sh,(cv.width-dw)/2,cv.height-16-dh,dw,dh);
    scene.textures.addCanvas(key,cv)!.setFilter(Phaser.Textures.FilterMode.LINEAR);
  };
  object('house-balcony',environmentBounds.house,288,288);
  object('house-terrace',environmentBounds.house,288,288);
  object('house-small',environmentBounds.cottage,288,220);
  object('geo-tree',environmentBounds.tree,256,280);
  object('geo-shrub',environmentBounds.bush,112,64);
  object('illustrated-rock',environmentBounds.rock,115,70);
  object('illustrated-props',environmentBounds.props,100,74);

  if(!scene.textures.exists('highlander')){
    const source=scene.textures.get('hero-source').getSourceImage() as HTMLImageElement;
    const cv=document.createElement('canvas');cv.width=384*8;cv.height=512;
    const c=cv.getContext('2d')!;
    heroBounds.forEach(([sx,sy,sw,sh],i)=>{
      const scale=.93;
      c.drawImage(source,sx,sy,sw,sh,i*384+(384-sw*scale)/2,500-sh*scale,sw*scale,sh*scale);
    });
    const t=scene.textures.addCanvas('highlander',cv)!;
    for(let i=0;i<8;i++)t.add(i,0,i*384,0,384,512);
    t.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
  if(scene.textures.exists('geo-terrain'))return;
  const source=scene.textures.get('ground-source').getSourceImage() as HTMLImageElement;
  const soil=document.createElement('canvas');soil.width=source.width;soil.height=source.height-200;
  soil.getContext('2d')!.drawImage(source,0,200,source.width,source.height-200,0,0,soil.width,soil.height);
  const grass=document.createElement('canvas');grass.width=source.width*2;grass.height=200;
  for(let i=0;i<2;i++)grass.getContext('2d')!.drawImage(source,0,0,source.width,200,i*source.width,0,source.width,200);
  // Resample the illustrated cap once, then remap pixels in a single buffer.
  // Thousands of cropped drawImage calls can cause large temporary allocations.
  const flat=document.createElement('canvas');flat.width=Math.round(source.width*.3);flat.height=45;
  flat.getContext('2d')!.drawImage(grass,0,0,source.width,200,0,0,flat.width,45);
  const flatPixels=new Uint32Array(flat.getContext('2d')!.getImageData(0,0,flat.width,45).data.buffer);
  const minGrassY=Math.floor(Math.min(...level01.ground.map(p=>p.y)))-4;
  const bandHeight=Math.ceil(Math.max(...level01.ground.map(p=>p.y)))-minGrassY+46;
  const mappedGrass=document.createElement('canvas');mappedGrass.width=level01.width;mappedGrass.height=bandHeight;
  const mappedContext=mappedGrass.getContext('2d')!,mapped=mappedContext.createImageData(level01.width,bandHeight);
  const pixels=new Uint32Array(mapped.data.buffer);
  for(let x=0;x<level01.width;x++){
    const top=Math.floor(groundY(x)-4)-minGrassY;
    const sx=Math.floor(((x/.3)%source.width)*flat.width/source.width);
    for(let row=0;row<45;row++)pixels[(top+row)*level01.width+x]=flatPixels[row*flat.width+sx];
  }
  mappedContext.putImageData(mapped,0,0);
  const cv=document.createElement('canvas');cv.width=level01.width;cv.height=1900;
  const c=cv.getContext('2d')!;
  const sections=[[0,level01.gaps[0].from],[level01.gaps[0].to,level01.width]];
  for(const [from,to]of sections){
    c.save();c.beginPath();c.moveTo(from,groundY(from)-4);
    for(const p of level01.ground)if(p.x>from&&p.x<to)c.lineTo(p.x,p.y-4);
    c.lineTo(to,groundY(to)-4);
    // The playable lip stays at the collision edge; the cliff below has a rocky contour.
    if(to<level01.width){
      const top=groundY(to);
      for(const [dx,dy]of [[-5,40],[-13,90],[-8,155],[-21,250],[-14,390],[-26,1900]])c.lineTo(to+dx,Math.min(1900,top+dy));
    }
    c.lineTo(to,1900);c.lineTo(from,1900);
    if(from>0){
      const top=groundY(from);
      for(const [dx,dy]of [[21,390],[12,250],[19,155],[8,90],[5,40]])c.lineTo(from+dx,top+dy);
    }
    c.closePath();c.clip();
    const pattern=c.createPattern(soil,'repeat')!;
    pattern.setTransform(new DOMMatrix().scale(.32));c.fillStyle=pattern;c.fillRect(from,0,to-from,1900);
    // Map the continuous source strip column-by-column onto the collision profile.
    // Rotating separate 48px patches left triangular holes at slope transitions.
    c.drawImage(mappedGrass,0,minGrassY);
    c.restore();
  }
  const gap=level01.gaps[0],riverbed=groundY((gap.from+gap.to)/2)+330;
  c.save();c.beginPath();c.moveTo(gap.from-50,riverbed+12);
  c.quadraticCurveTo((gap.from+gap.to)/2,riverbed-10,gap.to+50,riverbed+12);
  c.lineTo(gap.to+50,1900);c.lineTo(gap.from-50,1900);c.closePath();c.clip();
  const bed=c.createPattern(soil,'repeat')!;bed.setTransform(new DOMMatrix().scale(.32));
  c.fillStyle=bed;c.fillRect(gap.from-50,riverbed-15,gap.to-gap.from+100,1900-riverbed+15);c.restore();
  // Wooden direction marker prepared at 2x, using the existing illustrated wood texture.
  const sign=document.createElement('canvas');sign.width=224;sign.height=224;
  const sc=sign.getContext('2d')!;sc.scale(2,2);
  sc.fillStyle='#493123';sc.fillRect(47,34,12,78);sc.fillStyle='#a46d3c';sc.fillRect(49,34,7,78);
  sc.save();sc.beginPath();sc.moveTo(5,3);sc.lineTo(94,3);sc.lineTo(108,23);sc.lineTo(94,43);sc.lineTo(5,43);sc.closePath();sc.clip();
  const [px,py]=environmentBounds.props;
  sc.drawImage(env,px+60,py+110,200,70,5,3,104,40);
  sc.fillStyle='rgba(229,174,99,.55)';sc.fillRect(5,3,104,40);
  sc.strokeStyle='#f1cf94';sc.lineWidth=2;sc.beginPath();sc.moveTo(7,5);sc.lineTo(92,5);sc.lineTo(104,23);sc.stroke();
  sc.restore();sc.strokeStyle='#5b3c28';sc.lineWidth=2;sc.beginPath();sc.moveTo(5,3);sc.lineTo(94,3);sc.lineTo(108,23);sc.lineTo(94,43);sc.lineTo(5,43);sc.closePath();sc.stroke();
  for(const x of [12,86]){sc.fillStyle='#564b3d';sc.beginPath();sc.arc(x,11,2,0,Math.PI*2);sc.fill();}
  sc.fillStyle='#493123';sc.font='bold 12px sans-serif';sc.textAlign='center';sc.fillText('ПРЫЖОК',51,28);
  scene.textures.addCanvas('jump-sign',sign)!.setFilter(Phaser.Textures.FilterMode.LINEAR);
  scene.textures.addCanvas('geo-terrain',cv)!.setFilter(Phaser.Textures.FilterMode.LINEAR);
}
