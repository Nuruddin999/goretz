import Phaser from 'phaser';
import { createPlayerTexture } from '../art/playerTexture';
import { createGeometricTextures } from '../art/geometricEnvironment';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    createGeometricTextures(this);
    createPlayerTexture(this);
    this.scene.start('Level01');
  }
}
