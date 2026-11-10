export const WATER_FRAME_COUNT=24;
export const WATER_FRAME_MS=50;
export const WATER_ATLAS_COLUMNS=6;
export function waterFrameAt(time:number):number{
  return Math.floor(Math.max(0,time)/WATER_FRAME_MS)%WATER_FRAME_COUNT;
}

/** Bake every phase from ONE periodic illustration, not independent generated frames.
 * Work in premultiplied alpha so transparent pixels cannot create pale rectangles.
 */
export function bakeWaterLoop(source:Uint8ClampedArray,period:number,height:number){
  if(source.length!==period*height*4 || period<4 || height<1)throw new Error('Invalid water tile');
  const tile=new Float32Array(source.length);
  const feather=Math.min(16,Math.floor(period/4));
  for(let y=0;y<height;y++)for(let x=0;x<period;x++){
    const i=(y*period+x)*4,a=source[i+3]/255;
    const left=y*period*4,right=(y*period+period-1)*4;
    const al=source[left+3]/255,ar=source[right+3]/255;
    const distance=Math.min(x,period-1-x);
    const mix=distance<feather ? .5+.5*Math.cos(Math.PI*distance/feather) : 0;
    for(let channel=0;channel<3;channel++){
      const edge=(source[left+channel]*al+source[right+channel]*ar)/2;
      tile[i+channel]=source[i+channel]*a*(1-mix)+edge*mix;
    }
    tile[i+3]=a*(1-mix)+(al+ar)/2*mix;
  }
  const frameWidth=period*2;
  const width=frameWidth*WATER_ATLAS_COLUMNS;
  const rows=Math.ceil(WATER_FRAME_COUNT/WATER_ATLAS_COLUMNS);
  const data=new Uint8ClampedArray(width*height*rows*4);
  for(let frame=0;frame<WATER_FRAME_COUNT;frame++){
    const shift=period*frame/WATER_FRAME_COUNT;
    const ox=(frame%WATER_ATLAS_COLUMNS)*frameWidth,oy=Math.floor(frame/WATER_ATLAS_COLUMNS)*height;
    for(let y=0;y<height;y++)for(let x=0;x<frameWidth;x++){
      const u=(x+shift)%period,base=Math.floor(u),fraction=u-base;
      const l=(y*period+base)*4,r=(y*period+(base+1)%period)*4;
      const dest=((oy+y)*width+ox+x)*4;
      const a=tile[l+3]*(1-fraction)+tile[r+3]*fraction;
      if(a<=0)continue;
      for(let channel=0;channel<3;channel++)data[dest+channel]=(tile[l+channel]*(1-fraction)+tile[r+channel]*fraction)/a;
      data[dest+3]=a*255;
    }
  }
  return {data,width,height:height*rows,frameWidth,frameHeight:height};
}
