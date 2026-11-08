import Phaser from 'phaser';
import { createPlayerTexture } from '../art/playerTexture';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    for (const key of ['house-terrace', 'house-balcony', 'house-small']) {
      this.load.svg(key, `${import.meta.env.BASE_URL}assets/environment/${key}.svg`, { scale: 2 });
    }
  }
  create() {
    createPlayerTexture(this);
    this.scene.start('Level01');
  }
}
