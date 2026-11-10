import Phaser from 'phaser';
import { groundY } from '../levels/level01';
import { acidFrameAt } from './acidRules';
export class AcidJug extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, groundY(x), 'acid-jug', 0);
    scene.add.existing(this);
    this.setOrigin(0, 186/192).setScale(.25).setDepth(22);
  }
  animate(time: number) { this.setFrame(acidFrameAt(time)); }
}
