import Phaser from 'phaser';
import { groundY } from '../levels/level01';
import type { Rect } from '../combat/ratRules';
import { acidFrameAt, acidBubblesAt, acidPhaseAt, touchesBubble, type AcidBubble } from './acidRules';
export class AcidJug extends Phaser.GameObjects.Sprite {
  private startedAt: number | null = null;
  private bubbles: AcidBubble[] = [];
  private orbs: Phaser.GameObjects.Image[];
  private label: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, groundY(x), 'acid-jug', 0);
    scene.add.existing(this);
    this.setOrigin(0, 186/192).setScale(.25).setDepth(22);
    this.orbs = Array.from({length:7}, () => scene.add.image(0,0,'acid-bubble').setDepth(24).setVisible(false));
    this.label = scene.add.text(x+96,groundY(x)-325,'',{
      fontFamily:'sans-serif',fontSize:'22px',fontStyle:'bold',color:'#e4f6ed',
      stroke:'#233349',strokeThickness:5,
    }).setOrigin(.5).setDepth(26);
  }
  animate(_time: number, playerX: number) {
    // First encounter always begins with a full warning, even if the player
    // has waited elsewhere in the level. All later cycles use the scene clock.
    if(this.startedAt === null && Math.abs(playerX-this.x)<400) this.startedAt=this.scene.time.now;
    if(this.startedAt === null) return;
    const elapsed=this.scene.time.now-this.startedAt;
    const phase=acidPhaseAt(elapsed);
    this.setFrame(phase==='safe' ? 0 : acidFrameAt(elapsed));
    this.bubbles=acidBubblesAt(elapsed,this.x,groundY(this.x));
    this.orbs.forEach((orb,i)=>{
      const b=this.bubbles[i];orb.setVisible(!!b);
      if(b)orb.setPosition(b.x,b.y).setDisplaySize(b.radius*2,b.radius*2).setAlpha(b.alpha);
    });
    this.label.setText(phase==='safe' ? 'ПРОХОДИ' : phase==='warning' ? 'БУРЛИТ… ПОДОЖДИ' : 'ОПАСНЫЕ ПУЗЫРИ');
    this.label.setColor(phase==='safe' ? '#b9f2d0' : phase==='warning' ? '#ffd593' : '#e1b3ff');
  }
  touches(player: Rect): boolean { return this.bubbles.some(b=>touchesBubble(player,b)); }
}
