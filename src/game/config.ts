import Phaser from 'phaser';
import { VIEW_WIDTH, VIEW_HEIGHT, RENDER_SCALE } from './display';
import { IllustratedBackdrop } from './scenes/IllustratedBackdrop';
import { BootScene } from './scenes/BootScene';
import { Level01Scene } from './scenes/Level01Scene';
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, parent: 'game', width: VIEW_WIDTH * RENDER_SCALE, height: VIEW_HEIGHT * RENDER_SCALE,
  backgroundColor: '#193d58',
  pixelArt: false, antialias: true, roundPixels: false,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1400 }, debug: false } },
  scene: [BootScene, IllustratedBackdrop, Level01Scene],
};
