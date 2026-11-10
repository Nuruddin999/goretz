import Phaser from 'phaser';
export function prepareDripTexture(scene:Phaser.Scene){
  if(scene.textures.exists('drip-puddle'))return;
  const source=scene.textures.get('acid-jug').getSourceImage() as HTMLImageElement;
  const canvas=document.createElement('canvas');canvas.width=460;canvas.height=25;
  canvas.getContext('2d')!.drawImage(source,280,160,460,25,0,0,460,25);
  scene.textures.addCanvas('drip-puddle',canvas)!.setFilter(Phaser.Textures.FilterMode.LINEAR);
}
