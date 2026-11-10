import Phaser from 'phaser';
import { groundY } from '../levels/level01';
import type { Rect } from '../combat/ratRules';
import { dripAt,touchesDrip } from './roofRules';
export class RoofFungus extends Phaser.GameObjects.Image {
  private startedAt:number|null=null;
  private elapsed=0;
  private drop:Phaser.GameObjects.Image;
  constructor(scene:Phaser.Scene,x:number,y:number){
    super(scene,x,y,'roof-fungus');scene.add.existing(this);
    this.setDisplaySize(58,32).setOrigin(.5,.35).setDepth(23);
    scene.add.image(x,groundY(x)-1,'drip-puddle').setDisplaySize(76,15).setDepth(21);
    this.drop=scene.add.image(x,y+22,'acid-bubble').setTint(0x221426).setDepth(24).setVisible(false);
  }
  animate(playerX:number){
    if(this.startedAt===null && Math.abs(playerX-this.x)<350)this.startedAt=this.scene.time.now;
    if(this.startedAt===null)return;
    this.elapsed=this.scene.time.now-this.startedAt;
    const d=dripAt(this.elapsed,this.x,this.y,groundY(this.x));this.drop.setVisible(!!d);
    if(d)this.drop.setPosition(d.x,d.y).setAlpha(d.alpha).setDisplaySize(d.splash?d.radius*2:d.radius*1.6,d.splash?6:d.radius*2.8);
  }
  touches(player:Rect){return this.startedAt!==null && touchesDrip(player,this.elapsed,this.x,this.y,groundY(this.x));}
}
