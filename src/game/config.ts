import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { Level01Scene } from './scenes/Level01Scene';
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, parent: 'game', width: 1280, height: 720,
  backgroundColor: '#4d85ab',
  pixelArt: true, antialias: false, roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1400 }, debug: false } },
  scene: [BootScene, Level01Scene],
};
