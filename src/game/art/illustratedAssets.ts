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
  const cv=document.createElement('canvas');cv.width=level01.width;cv.height=1900;
  const c=cv.getContext('2d')!;
  const sections=[[0,level01.gaps[0].from],[level01.gaps[0].to,level01.width]];
  for(const [from,to]of sections){
    c.save();c.beginPath();c.moveTo(from,groundY(from)-4);
    for(const p of level01.ground)if(p.x>from&&p.x<to)c.lineTo(p.x,p.y-4);
    c.lineTo(to,groundY(to)-4);c.lineTo(to,1900);c.lineTo(from,1900);c.closePath();c.clip();
    const pattern=c.createPattern(soil,'repeat')!;
    pattern.setTransform(new DOMMatrix().scale(.32));c.fillStyle=pattern;c.fillRect(from,0,to-from,1900);
    // The cap uses artwork too; no coded polygons pretending to be grass.
    for(let x=from;x<to;x+=48){
      const length=Math.min(48,to-x),y=groundY(x),angle=Math.atan2(groundY(x+length)-y,length);
      c.save();c.translate(x,y-4);c.rotate(angle);
      const width=length/Math.cos(angle);
      c.drawImage(grass,(x/.3)%source.width,0,width/.3,200,0,0,width+1,45);c.restore();
    }
    c.restore();
  }
  scene.textures.addCanvas('geo-terrain',cv)!.setFilter(Phaser.Textures.FilterMode.LINEAR);
}
