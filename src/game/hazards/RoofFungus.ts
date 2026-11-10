import Phaser from 'phaser';
import { groundY } from '../levels/level01';
import type { Rect } from '../combat/ratRules';
import { dripAt,touchesDrip } from './roofRules';
export class RoofFungus extends Phaser.GameObjects.Image {
  private startedAt:number|null=null;
  private elapsed=0;
  private drop:Phaser.GameObjects.Image;
  constructor(scene:Phaser.Scene,x:number,y:number){
    super(scene,x,y+4,'roof-slug');scene.add.existing(this);
    // Keep the original cottage. Only its last column gets a damaged overlay.
    scene.add.image(x-8,y-7,'roof-damaged-corner').setOrigin(.5,0).setDisplaySize(32,groundY(x)-y+7).setDepth(20);
    // Widen the damage at ground level, with shelf fungi beside the puddle.
    scene.add.image(x+8,groundY(x)+1,'lower-ruin-overlay').setOrigin(1,1).setDisplaySize(72,82).setDepth(20);
    // The bottom of the lip is the fixed pivot, so breathing never detaches the drop.
    this.setOrigin(.815,1).setDisplaySize(128,37).setDepth(23);
    scene.add.image(x,groundY(x)-1,'drip-puddle').setDisplaySize(76,15).setDepth(21);
    this.drop=scene.add.image(x,y+22,'acid-bubble').setTint(0x221426).setDepth(24).setVisible(false);
  }
  animate(playerX:number){
    this.setDisplaySize(128,37*(1+.035*Math.sin(this.scene.time.now/550)));
    if(this.startedAt===null && Math.abs(playerX-this.x)<350)this.startedAt=this.scene.time.now;
    if(this.startedAt===null)return;
    this.elapsed=this.scene.time.now-this.startedAt;
    const d=dripAt(this.elapsed,this.x,this.y-4,groundY(this.x));this.drop.setVisible(!!d);
    if(d)this.drop.setPosition(d.x,d.y).setAlpha(d.alpha).setDisplaySize(d.splash?d.radius*2:d.radius*1.6,d.splash?6:d.radius*2.8);
  }
  touches(player:Rect){return this.startedAt!==null && touchesDrip(player,this.elapsed,this.x,this.y-4,groundY(this.x));}
}
