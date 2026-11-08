import Phaser from 'phaser';
import { createPlayerTexture } from '../art/playerTexture';
import { createEnvironmentTextures } from '../art/pixelEnvironment';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    createEnvironmentTextures(this);
    createPlayerTexture(this);
    this.scene.start('Level01');
  }
}
