import Phaser from 'phaser';
// Normalise the illustrated phases so the generated grid plays as a consistent loop.
export const WATER_FRAME_WIDTH=380;
export const WATER_FRAME_HEIGHT=508;
export const WATER_PHASE_SHIFTS=[0,18,25,35,38,225,217,211] as const;
const verticalOffsets=[0,0,0,0,1,0,0,2];
export function prepareWaterTexture(scene:Phaser.Scene){
  if(scene.textures.exists('water-animation'))return;
  const source=scene.textures.get('water-sheet').getSourceImage() as HTMLImageElement;
  const w=WATER_FRAME_WIDTH,h=WATER_FRAME_HEIGHT;
  const canvas=document.createElement('canvas');canvas.width=w*8;canvas.height=h;
  const c=canvas.getContext('2d')!;
  WATER_PHASE_SHIFTS.forEach((shift,i)=>{
    const sx=(i%4)*384+2,sy=Math.floor(i/4)*512+2,dy=verticalOffsets[i];
    c.save();c.beginPath();c.rect(i*w,0,w,h);c.clip();
    c.drawImage(source,sx,sy,w-shift,h,i*w+shift,dy,w-shift,h);
    if(shift)c.drawImage(source,sx+w-shift,sy,shift,h,i*w,dy,shift,h);
    c.restore();
  });
  const t=scene.textures.addCanvas('water-animation',canvas)!;
  for(let i=0;i<8;i++)t.add(i,0,i*w,0,w,h);
  t.setFilter(Phaser.Textures.FilterMode.LINEAR);
}
