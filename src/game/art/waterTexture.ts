import Phaser from 'phaser';
import { bakeWaterLoop, WATER_ATLAS_COLUMNS, WATER_FRAME_COUNT } from './waterLoop';

export function prepareWaterTexture(scene:Phaser.Scene){
  if(scene.textures.exists('water-animation'))return;
  const source=scene.textures.get('water-sheet').getSourceImage() as HTMLImageElement;
  // One complete wave period from the first illustration. Other generated cells
  // are deliberately unused: their levels and phases do not form a coherent cycle.
  const period=193,frameHeight=508;
  const sample=document.createElement('canvas');sample.width=period;sample.height=frameHeight;
  const sampleContext=sample.getContext('2d')!;
  sampleContext.drawImage(source,2,2,period,frameHeight,0,0,period,frameHeight);
  const atlas=bakeWaterLoop(sampleContext.getImageData(0,0,period,frameHeight).data,period,frameHeight);
  const canvas=document.createElement('canvas');canvas.width=atlas.width;canvas.height=atlas.height;
  const context=canvas.getContext('2d')!,pixels=context.createImageData(atlas.width,atlas.height);
  pixels.data.set(atlas.data);context.putImageData(pixels,0,0);
  const texture=scene.textures.addCanvas('water-animation',canvas)!;
  for(let i=0;i<WATER_FRAME_COUNT;i++)texture.add(i,0,(i%WATER_ATLAS_COLUMNS)*atlas.frameWidth,Math.floor(i/WATER_ATLAS_COLUMNS)*atlas.frameHeight,atlas.frameWidth,atlas.frameHeight);
  texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
}
