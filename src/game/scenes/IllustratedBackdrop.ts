import Phaser from 'phaser';
export class IllustratedBackdrop extends Phaser.Scene {
  constructor(){super('IllustratedBackdrop');}
  create(){
    const width=this.scale.width,height=this.scale.height;
    const source=this.textures.get('illustrated-mountains').getSourceImage() as HTMLImageElement;
    this.add.image(width/2,height/2,'illustrated-mountains').setScale(Math.max(width/source.width,height/source.height));
  }
}
