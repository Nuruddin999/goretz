import Phaser from 'phaser';
import { groundY } from '../levels/level01';
import type { Rect } from '../combat/ratRules';
import { acidFrameAt, acidBubblesAt, touchesBubble, type AcidBubble } from './acidRules';
export class AcidJug extends Phaser.GameObjects.Sprite {
  private startedAt: number | null = null;
  private bubbles: AcidBubble[] = [];
  private vapor: Phaser.GameObjects.Image[];
  private orb: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, groundY(x), 'acid-jug', 0);
    scene.add.existing(this);
    this.setOrigin(0, 186/192).setScale(.25).setDepth(22);
    this.vapor=[0,1,2].map(()=>scene.add.image(x,groundY(x),'poison-vapor').setOrigin(.5,1).setDepth(23));
    this.orb=scene.add.image(0,0,'acid-bubble').setDepth(24).setVisible(false);
  }
  animate(_time: number, playerX: number) {
    // Decorative vapor stays visible between bubble releases; it never deals damage.
    this.vapor.forEach((wisp,i)=>{
      const phase=((this.scene.time.now+i*900)%2700)/2700;
      wisp.setPosition(this.x+75+i*39+Math.sin(phase*Math.PI*2+i)*5,groundY(this.x)-3-phase*18)
        .setDisplaySize(22+phase*15,30+phase*24).setAlpha(.58*Math.sin(phase*Math.PI));
    });
    // Demonstrate the danger immediately on the first approach, then keep a
    // fixed cadence independent of player movement. Never stack bubbles.
    if(this.startedAt === null && Math.abs(playerX-this.x)<280) this.startedAt=this.scene.time.now;
    if(this.startedAt === null) return;
    const elapsed=this.scene.time.now-this.startedAt;
    this.bubbles=acidBubblesAt(elapsed,this.x,groundY(this.x));
    this.setFrame(this.bubbles.length ? acidFrameAt(elapsed) : 0);
    const b=this.bubbles[0];this.orb.setVisible(!!b);
    if(b)this.orb.setPosition(b.x,b.y).setDisplaySize(b.radius*2,b.radius*2).setAlpha(b.alpha);
  }
  touches(player: Rect): boolean { return this.bubbles.some(b=>touchesBubble(player,b)); }
}
