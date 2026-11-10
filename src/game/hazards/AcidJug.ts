import Phaser from 'phaser';
import { groundY } from '../levels/level01';
import type { Rect } from '../combat/ratRules';
import { acidFrameAt, acidBubblesAt, touchesBubble, type AcidBubble } from './acidRules';
export class AcidJug extends Phaser.GameObjects.Sprite {
  private startedAt: number | null = null;
  private bubbles: AcidBubble[] = [];
  private orb: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, groundY(x), 'acid-jug', 0);
    scene.add.existing(this);
    this.setOrigin(0, 186/192).setScale(.25).setDepth(22);
    this.orb=scene.add.image(0,0,'acid-bubble').setDepth(24).setVisible(false);
  }
  animate(_time: number, playerX: number) {
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
