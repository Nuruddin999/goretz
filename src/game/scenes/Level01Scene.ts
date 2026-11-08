import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { level01 } from '../levels/level01';
export class Level01Scene extends Phaser.Scene {
  private player!: Player;
  private finished = false;
  constructor() { super('Level01'); }
  create() {
    this.finished = false;
    const { width, height } = level01;
    this.physics.world.setBounds(0, -200, width, height + 400);
    this.cameras.main.setBounds(0, 0, width, height);
    const distant = this.add.graphics().setScrollFactor(0.15);
    distant.fillStyle(0xadb8b3).fillCircle(960, 125, 53);
    for (let i = 0; i < 8; i++) {
      const x = i * 360 - 200;
      distant.fillStyle(0x526d74).fillTriangle(x, 720, x + 250, 125 + (i % 3) * 65, x + 580, 720);
      distant.fillStyle(0xa7b7b5).fillTriangle(x + 198, 240 + (i % 3) * 65, x + 250, 125 + (i % 3) * 65, x + 320, 245 + (i % 3) * 65);
    }
    const middle = this.add.graphics().setScrollFactor(0.4);
    for (let i = 0; i < 10; i++) middle.fillStyle(0x38545a).fillTriangle(i * 420 - 100, 1100, i * 420 + 180, 360 + (i % 2) * 90, i * 420 + 540, 1100);
    const platforms = this.physics.add.staticGroup();
    for (const p of level01.platforms) {
      const platform = platforms.create(p.x, p.y, 'solid') as Phaser.Physics.Arcade.Image;
      platform.setDisplaySize(p.width, p.height).setTint(0x414747).refreshBody();
      this.add.rectangle(p.x, p.y - p.height / 2 + 6, p.width, 12, 0x9b9476);
      for (let x = p.x - p.width / 2 + 20; x < p.x + p.width / 2; x += 55) this.add.rectangle(x, p.y - p.height / 2 + 32, 27, 3, 0x62645a);
    }
    // Дома у начала тропы — только декорации.
    const houses = this.add.graphics();
    for (const [x, y] of [[190,420],[365,420],[2670,800]]) {
      houses.fillStyle(0x706c5c).fillRect(x - 42, y - 85, 84, 85);
      houses.fillStyle(0x3b4443).fillRect(x - 51, y - 93, 102, 12);
      houses.fillStyle(0x243337).fillRect(x - 9, y - 39, 19, 39).fillRect(x + 19, y - 64, 12, 17);
    }
    this.player = new Player(this, level01.spawn.x, level01.spawn.y);
    this.physics.add.collider(this.player, platforms);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09, -130, 70);
    const marker = this.add.rectangle(level01.finish.x, level01.finish.y - 55, 8, 100, 0xd7bc7e);
    this.add.triangle(marker.x + 28, marker.y - 33, 0, 0, 48, 15, 0, 30, 0xd7bc7e);
    const textStyle = { fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#efe7d4' };
    this.add.text(32, 25, 'ГОРЕЦ / 01 — ГОРНАЯ ТРОПА', { ...textStyle, fontSize: '24px' }).setScrollFactor(0);
    this.add.text(32, 62, 'Доберись до флага у нижнего селения', textStyle).setScrollFactor(0);
    this.add.text(32, 676, 'A / D или ← → — движение    •    Пробел / W / ↑ — прыжок    •    R — заново', textStyle).setScrollFactor(0);
    this.input.keyboard!.on('keydown-R', () => this.scene.restart());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard!.removeAllListeners('keydown-R'));
  }
  update(time: number) {
    if (this.finished) return;
    this.player.update(time);
    if (this.player.y > level01.height + 100) { this.scene.restart(); return; }
    if (this.player.x > level01.finish.x - 40 && this.player.y > 730) {
      this.finished = true; this.player.setVelocity(0); this.physics.pause();
      this.add.rectangle(640, 360, 760, 220, 0x14292f, 0.95).setScrollFactor(0);
      this.add.text(640, 335, 'Тропа пройдена', { fontFamily: 'Arial', fontSize: '38px', color: '#ead7ac' }).setOrigin(0.5).setScrollFactor(0);
      this.add.text(640, 395, 'Впереди — нижнее селение. Нажми R, чтобы пройти снова.', { fontFamily: 'Arial', fontSize: '20px', color: '#ece9df' }).setOrigin(0.5).setScrollFactor(0);
    }
  }
}
