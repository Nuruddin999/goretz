import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { groundY, isGap, level01 } from '../levels/level01';

type G = Phaser.GameObjects.Graphics;
export class Level01Scene extends Phaser.Scene {
  private player!: Player;
  private finished = false;
  private progress!: Phaser.GameObjects.Graphics;
  private shadow!: Phaser.GameObjects.Ellipse;
  constructor() { super('Level01'); }
  create() {
    this.finished = false;
    this.physics.resume();
    this.physics.world.setBounds(0, -200, level01.width, level01.height + 500);
    this.cameras.main.setBounds(0, 0, level01.width, level01.height);
    this.drawBackdrop();
    this.drawVillage();
    this.drawTerrain();
    this.shadow = this.add.ellipse(level01.spawn.x, groundY(level01.spawn.x), 49, 9, 0x385c45, 0.2).setDepth(29);
    this.player = new Player(this, level01.spawn.x, level01.spawn.y);
    const resolve = () => this.player.resolveTerrain();
    this.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, resolve);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, resolve));
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -170, 95);
    this.drawFinish();
    this.drawHud();
    const restart = () => this.scene.restart();
    this.input.keyboard!.on('keydown-R', restart);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard!.off('keydown-R', restart));
  }

  private drawBackdrop() {
    this.add.rectangle(640, 360, 1280, 720, 0xa6dcf5).setScrollFactor(0).setDepth(-100);
    const clouds = this.add.graphics().setScrollFactor(0.06, 0).setDepth(-90);
    for (const [x, y, scale] of [[250, 110, 1], [1090, 155, 0.75], [1630, 85, 0.8]]) {
      clouds.fillStyle(0xfff4df).fillRoundedRect(x, y, 140 * scale, 34 * scale, 17 * scale);
      clouds.fillCircle(x + 43 * scale, y, 31 * scale).fillCircle(x + 85 * scale, y + 2 * scale, 24 * scale);
    }
    const mountains = this.add.graphics().setScrollFactor(0.13, 0.08).setDepth(-80);
    const peaks = [{ x: -150, y: 205, w: 980 }, { x: 470, y: 120, w: 1080 }, { x: 1290, y: 230, w: 920 }];
    for (const p of peaks) {
      const curve = new Phaser.Curves.Spline([
        new Phaser.Math.Vector2(p.x, 620), new Phaser.Math.Vector2(p.x + p.w * 0.22, p.y + 180),
        new Phaser.Math.Vector2(p.x + p.w * 0.5, p.y), new Phaser.Math.Vector2(p.x + p.w * 0.76, p.y + 185),
        new Phaser.Math.Vector2(p.x + p.w, 620),
      ]).getPoints(60);
      mountains.fillStyle(0x99b5ed).fillPoints(curve, true);
      const summit = p.x + p.w * 0.5;
      const snow = new Phaser.Curves.Spline([
        new Phaser.Math.Vector2(summit - 115, p.y + 69), new Phaser.Math.Vector2(summit - 60, p.y + 22),
        new Phaser.Math.Vector2(summit, p.y), new Phaser.Math.Vector2(summit + 61, p.y + 24), new Phaser.Math.Vector2(summit + 118, p.y + 69),
        new Phaser.Math.Vector2(summit + 55, p.y + 61), new Phaser.Math.Vector2(summit + 18, p.y + 70),
        new Phaser.Math.Vector2(summit - 30, p.y + 60), new Phaser.Math.Vector2(summit - 75, p.y + 73),
      ]).getPoints(60);
      mountains.fillStyle(0xfff4df).fillPoints(snow, true);
    }
    const hills = this.add.graphics().setScrollFactor(0.26, 0.18).setDepth(-70);
    this.hill(hills, -600, 620, 1600, 320, 0x79af70);
    this.hill(hills, 450, 690, 1750, 290, 0x83b971);
    this.hill(hills, 1650, 630, 1800, 300, 0x79af70);
    // Small distant terraces form another plane, without crowding the skyline.
    for (const [x, y, key] of [[160, 478, 'house-small'], [320, 482, 'house-terrace'], [1040, 570, 'house-small'], [1210, 585, 'house-balcony'] ] as const) {
      this.add.image(x, y, key).setOrigin(0.5, 1).setScale(0.22).setTint(0xe5e2bd).setAlpha(0.8).setScrollFactor(0.3, 0.2).setDepth(-60);
    }
  }
  private hill(g: G, x: number, y: number, width: number, rise: number, color: number) {
    const curve = new Phaser.Curves.Spline([
      new Phaser.Math.Vector2(x, y), new Phaser.Math.Vector2(x + width * 0.5, y - rise), new Phaser.Math.Vector2(x + width, y),
    ]).getPoints(80);
    curve.push(new Phaser.Math.Vector2(x + width, 1800), new Phaser.Math.Vector2(x, 1800));
    g.fillStyle(color).fillPoints(curve, true);
  }
  private tree(g: G, x: number, y: number, scale = 1) {
    g.fillStyle(0x9b704f).fillRoundedRect(x - 8 * scale, y - 99 * scale, 16 * scale, 100 * scale, 5 * scale);
    g.lineStyle(9 * scale, 0x9b704f).lineBetween(x, y - 45 * scale, x - 30 * scale, y - 78 * scale);
    g.lineBetween(x, y - 60 * scale, x + 28 * scale, y - 94 * scale);
    g.fillStyle(0x5c963e);
    for (const [dx, dy, r] of [[-36, -107, 34], [30, -112, 40], [0, -141, 45]]) g.fillCircle(x + dx * scale, y + dy * scale, r * scale);
    g.fillStyle(0x7ab545).fillCircle(x - 24 * scale, y - 131 * scale, 31 * scale).fillCircle(x + 17 * scale, y - 151 * scale, 29 * scale);
  }
  private drawVillage() {
    const g = this.add.graphics().setDepth(1);
    // Terrace walls and buildings share the hillside baseline.
    for (const h of level01.houses) {
      const y = groundY(h.x);
      g.fillStyle(0xbfaa7e).fillRoundedRect(h.x - 170, y - 20, 340, 28, 7);
      for (let i = 0; i < 8; i++) g.fillStyle(i % 2 ? 0xdac59b : 0xe6d1a5).fillRoundedRect(h.x - 165 + i * 42, y - 18, 38, 15, 5);
      this.add.image(h.x, y - 5, h.key).setOrigin(0.5, 1).setScale(h.scale / 2).setDepth(3);
    }
    for (const x of [60, 680, 1500, 2290, 3110, 4030, 4710]) this.tree(g, x, groundY(x) - 8, x % 3 === 0 ? 0.9 : 0.7);
    // Sparse shrubs: large clean shapes, no noisy procedural textures.
    for (const x of [570, 920, 1290, 1770, 2120, 2560, 2930, 3380, 3900, 4220, 4580, 5150]) this.shrub(g, x, groundY(x) - 4, 1);
    this.drawPond(g, 2390, groundY(2390) - 10);
    // A few broken fence boards suggest the village has been abandoned.
    for (const x of [790, 815, 840, 3070, 3095, 3120]) {
      const y = groundY(x) - 8;
      g.fillStyle(0xae8258).fillRoundedRect(x, y - 43, 8, 40, 3);
      g.fillStyle(0xc69865).fillRoundedRect(x - 10, y - 31, 30, 7, 3);
    }
  }
  private shrub(g: G, x: number, y: number, scale: number) {
    g.fillStyle(0x649e43).fillCircle(x - 17 * scale, y - 9 * scale, 16 * scale).fillCircle(x + 14 * scale, y - 12 * scale, 20 * scale).fillCircle(x - 1 * scale, y - 24 * scale, 21 * scale);
    g.fillStyle(0x7bb84d).fillCircle(x - 7 * scale, y - 25 * scale, 14 * scale);
  }
  private drawPond(g: G, x: number, y: number) {
    g.fillStyle(0x6da84b).fillEllipse(x, y, 210, 43);
    g.fillStyle(0x67bfc4).fillEllipse(x, y - 3, 182, 32);
    g.fillStyle(0x9edbd6).fillRoundedRect(x - 62, y - 11, 52, 6, 3).fillRoundedRect(x + 18, y, 42, 5, 2);
    g.fillStyle(0xb7b593).fillEllipse(x - 104, y - 5, 32, 24).fillEllipse(x - 86, y + 1, 22, 15);
  }
  private drawTerrain() {
    const g = this.add.graphics().setDepth(10);
    const sections = [[0, 3630], [3760, level01.width]];
    for (const [from, to] of sections) {
      const points: Phaser.Math.Vector2[] = [];
      for (let x = from; x <= to; x += 10) points.push(new Phaser.Math.Vector2(x, groundY(x)));
      points.push(new Phaser.Math.Vector2(to, groundY(to)));
      const fill = [...points, new Phaser.Math.Vector2(to, 1900), new Phaser.Math.Vector2(from, 1900)];
      g.fillStyle(0x86ba4b).fillPoints(fill, true);
      // Solid earth below the grassy shoulder, never floating islands.
      const earth = points.map(p => new Phaser.Math.Vector2(p.x, p.y + 100));
      earth.push(new Phaser.Math.Vector2(to, 1900), new Phaser.Math.Vector2(from, 1900));
      g.fillStyle(0xb8956d).fillPoints(earth, true);
      const darker = points.map(p => new Phaser.Math.Vector2(p.x, p.y + 132));
      darker.push(new Phaser.Math.Vector2(to, 1900), new Phaser.Math.Vector2(from, 1900));
      g.fillStyle(0xa78460).fillPoints(darker, true);
      // Walking surface is a warm, continuous footpath.
      g.lineStyle(32, 0xd8b476).strokePoints(points);
      g.lineStyle(23, 0xf0cd8d).strokePoints(points);
      // Broad sparse stones, deterministic and low-detail.
      for (let x = from + 65; x < to - 25; x += 145) {
        g.fillStyle(0xbd9c74).fillRoundedRect(x, groundY(x) + 157, 36, 12, 6);
        g.fillStyle(0x977657).fillRoundedRect(x + 60, groundY(x + 60) + 210, 26, 10, 5);
      }
      for (let x = from + 25; x < to - 25; x += 90) {
        const y = groundY(x) + 43;
        g.lineStyle(3, 0x6ba144).lineBetween(x, y, x - 4, y - 9);
        g.lineBetween(x + 3, y, x + 8, y - 7);
      }
    }
    // One deliberate jump over a narrow stream-fed ravine.
    g.fillStyle(0x5dafbd).fillRoundedRect(3630, 1170, 130, 320, 10);
    g.fillStyle(0x8dd7d3).fillRoundedRect(3647, 1187, 72, 6, 3).fillRoundedRect(3666, 1210, 59, 6, 3);
    const postY = groundY(3575);
    g.fillStyle(0x9d7852).fillRoundedRect(3567, postY - 61, 8, 61, 3);
    g.fillStyle(0xf3d59a).fillRoundedRect(3536, postY - 65, 83, 31, 6);
    this.add.text(3577, postY - 50, 'ПРЫЖОК →', { fontFamily: 'Arial', fontSize: '10px', color: '#775b43' }).setOrigin(0.5).setDepth(20);
  }
  private drawFinish() {
    const { x, y } = level01.finish;
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x9b744e).fillRoundedRect(x, y - 145, 9, 145, 4);
    g.fillStyle(0xd58d61).fillPoints([{ x: x + 9, y: y - 139 }, { x: x + 77, y: y - 139 }, { x: x + 63, y: y - 117 }, { x: x + 77, y: y - 95 }, { x: x + 9, y: y - 95 }], true);
  }
  private drawHud() {
    const g = this.add.graphics().setScrollFactor(0).setDepth(100);
    g.fillStyle(0xfff5df, 0.93).fillRoundedRect(24, 24, 310, 84, 16);
    this.add.text(44, 39, 'ГОРЕЦ', { fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#465e56' }).setScrollFactor(0).setDepth(101);
    this.add.text(44, 73, '01  /  СПУСК В СЕЛЕНИЕ', { fontFamily: 'Arial', fontSize: '13px', color: '#7b866c', letterSpacing: 2 }).setScrollFactor(0).setDepth(101);
    g.fillStyle(0xfff5df, 0.92).fillRoundedRect(894, 24, 362, 52, 14);
    this.add.text(914, 36, 'Дойди до нижнего селения', { fontFamily: 'Arial', fontSize: '16px', color: '#465e56' }).setScrollFactor(0).setDepth(101);
    g.fillStyle(0xd9d8b4).fillRoundedRect(914, 61, 320, 4, 2);
    this.progress = this.add.graphics().setScrollFactor(0).setDepth(102);
    g.fillStyle(0xfff5df, 0.94).fillRoundedRect(303, 665, 674, 34, 12);
    this.add.text(640, 682, 'A / D  или  ← →    •    Пробел — прыжок    •    R — заново', { fontFamily: 'Arial', fontSize: '15px', color: '#576851' }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }
  update(time: number, delta: number) {
    if (this.finished) return;
    this.player.update(time, delta);
    const floor = groundY(this.player.x);
    this.shadow.setPosition(this.player.x, floor + 3).setVisible(!isGap(this.player.x));
    this.shadow.setAlpha(Phaser.Math.Clamp(1 - (floor - this.player.y) / 400, 0.1, 1));
    this.progress.clear().fillStyle(0x7fac58).fillRoundedRect(914, 61, 320 * Phaser.Math.Clamp(this.player.x / level01.finish.x, 0.01, 1), 4, 2);
    if (this.player.y > level01.height + 100) { this.scene.restart(); return; }
    if (this.player.x > level01.finish.x - 20 && this.player.y > level01.finish.y - 140) {
      this.finished = true; this.player.setVelocity(0); this.physics.pause();
      this.add.rectangle(640, 360, 1280, 720, 0x344e51, 0.25).setScrollFactor(0).setDepth(110);
      const panel = this.add.graphics().setScrollFactor(0).setDepth(111);
      panel.fillStyle(0xfff3d9).fillRoundedRect(300, 255, 680, 210, 24);
      this.add.text(640, 308, 'Тропа пройдена', { fontFamily: 'Arial', fontSize: '36px', color: '#4e6754' }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
      this.add.text(640, 371, 'Впереди — нижнее селение', { fontFamily: 'Arial', fontSize: '21px', color: '#758360' }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
      this.add.text(640, 423, 'R — пройти снова', { fontFamily: 'Arial', fontSize: '16px', color: '#8b8d72' }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
    }
  }
}
