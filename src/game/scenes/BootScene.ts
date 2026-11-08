import Phaser from 'phaser';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    // Временные текстуры: после выбора стиля заменяются PNG-ассетами.
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff).fillRect(0, 0, 8, 8); g.generateTexture('solid', 8, 8); g.clear();
    g.fillStyle(0x202e34).fillRect(12, 48, 10, 16).fillRect(27, 48, 10, 16);
    g.fillStyle(0x785d46).fillRoundedRect(8, 22, 32, 30, 5);
    g.fillStyle(0xd6b18a).fillCircle(24, 16, 11);
    g.fillStyle(0xddd5c5).fillRoundedRect(11, 0, 26, 13, 4);
    g.fillStyle(0x394047).fillRect(9, 38, 30, 5);
    g.generateTexture('player', 48, 64); g.destroy();
    this.scene.start('Level01');
  }
}
