import Phaser from 'phaser';
import { prepareWaterTexture } from '../art/waterTexture';
import { prepareIllustratedAssets } from '../art/illustratedAssets';
export class BootScene extends Phaser.Scene {
  constructor(){super('Boot');}
  preload(){
    const root=`${import.meta.env.BASE_URL}assets/illustrated/`;
    this.load.image('environment-source',root+'environment.webp');
    this.load.image('hero-source',root+'hero.webp');
    this.load.image('illustrated-mountains',root+'mountains.webp');
    this.load.image('ground-source',root+'ground.webp');
    this.load.image('drip-puddle',root+'drip-puddle.webp');
    this.load.image('roof-slug',root+'roof-slug.webp');
    this.load.image('roof-damaged-corner',root+'roof-damaged-corner.webp');
    this.load.image('roof-fungus',root+'roof-fungus.webp');
    this.load.image('acid-bubble',root+'acid-bubble.webp');
    this.load.spritesheet('acid-jug',root+'acid-jug.webp',{frameWidth:768,frameHeight:192});
    this.load.spritesheet('rat',root+'rat-run.webp',{frameWidth:512,frameHeight:256});
    this.load.image('water-sheet',root+'water-sheet.webp');
    this.add.text(this.scale.width/2,this.scale.height/2,'Загрузка рисунков…',{fontFamily:'sans-serif',fontSize:'22px',color:'#ffffff'}).setOrigin(.5);
  }
  create(){
    // Reuse the broken masonry and fungi at the foot of the same corner.
    const corner=this.textures.get('roof-damaged-corner');
    const source=corner.getSourceImage();
    const baseY=Math.floor(source.height*.55);
    corner.add('infected-base',0,0,baseY,source.width,source.height-baseY);
    prepareWaterTexture(this);
    prepareIllustratedAssets(this);this.scene.start('Level01');
  }
}
