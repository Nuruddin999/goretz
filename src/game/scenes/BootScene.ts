import Phaser from 'phaser';
import { prepareIllustratedAssets } from '../art/illustratedAssets';
export class BootScene extends Phaser.Scene {
  constructor(){super('Boot');}
  preload(){
    const root=`${import.meta.env.BASE_URL}assets/illustrated/`;
    this.load.image('environment-source',root+'environment.webp');
    this.load.image('hero-source',root+'hero.webp');
    this.load.image('illustrated-mountains',root+'mountains.webp');
    this.load.image('ground-source',root+'ground.webp');
    this.add.text(this.scale.width/2,this.scale.height/2,'Загрузка рисунков…',{fontFamily:'sans-serif',fontSize:'22px',color:'#ffffff'}).setOrigin(.5);
  }
  create(){prepareIllustratedAssets(this);this.scene.start('Level01');}
}
