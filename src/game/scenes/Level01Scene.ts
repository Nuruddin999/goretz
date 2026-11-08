import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { groundY, isGap, level01 } from '../levels/level01';

export class Level01Scene extends Phaser.Scene {
  private player!: Player;
  private finished = false;
  private progress!: Phaser.GameObjects.Graphics;
  private shadow!: Phaser.GameObjects.Ellipse;
  private hudCamera!: Phaser.Cameras.Scene2D.Camera;
  constructor() { super('Level01'); }
  create() {
    this.finished = false;
    this.physics.resume();
    this.physics.world.setBounds(0, -200, level01.width, level01.height + 500);
    this.cameras.main.setBounds(0, 0, level01.width, level01.height).setZoom(0.7);
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
    const worldObjects = [...this.children.list];
    this.drawHud();
    // HUD stays at normal size while the world is zoomed out.
    this.hudCamera = this.cameras.add(0, 0, 1280, 720);
    this.hudCamera.ignore(worldObjects);
    this.cameras.main.ignore(this.children.list.filter(o => !worldObjects.includes(o)));
    const restart = () => this.scene.restart();
    this.input.keyboard!.on('keydown-R', restart);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard!.off('keydown-R', restart));
  }

  private drawBackdrop() {
    this.add.image(-500, -250, 'geo-sky').setOrigin(0).setDisplaySize(2300, 1400).setScrollFactor(0).setDepth(-100);
    this.add.image(-180, 15, 'geo-mountains').setOrigin(0).setScale(1).setScrollFactor(0.13, 0.08).setDepth(-80);
    this.add.image(-120, 315, 'geo-hills').setOrigin(0).setScale(1).setScrollFactor(0.26, 0.18).setDepth(-70);
    for (const [x,y,scale] of [[130,105,0.7],[920,155,0.7],[1630,75,1]]) {
      this.add.image(x,y,'geo-cloud').setOrigin(0).setScale(scale / 2).setScrollFactor(0.06,0).setDepth(-90).setAlpha(0.85);
    }
    for (const [x,y,key] of [[195,490,'house-small'],[330,500,'house-terrace'],[1100,570,'house-small'],[1230,590,'house-balcony']] as const) {
      this.add.image(x,y,key).setOrigin(0.5,1).setScale(0.15).setTint(0x96a8a0).setScrollFactor(0.3,0.2).setDepth(-60);
    }
  }
  private drawVillage() {
    const g=this.add.graphics().setDepth(1);
    for(const h of level01.houses){
      const y=Math.round(groundY(h.x)/3)*3;
      // Terraces are stacked masonry, with dark joints and lit upper edges.
      g.fillStyle(0x514e56).fillRect(h.x-168,y-27,336,30);
      for(let row=0;row<2;row++)for(let i=0;i<12;i++){
        const x=h.x-165+i*27+(row%2)*3,sy=y-25+row*12;
        g.fillStyle(i%3?0xa38e79:0xbaa287).fillRect(x,sy,24,9);
        g.fillStyle(0xd1b393).fillRect(x,sy,21,3);
      }
      this.add.image(Math.round(h.x/3)*3,y-3,h.key).setOrigin(.5,1).setScale(0.5).setDepth(3);
    }
    for(const x of [60,690,1500,2290,3110,4030,4710])this.add.image(x,groundY(x)-3,'geo-tree').setOrigin(.5,1).setScale(0.5).setDepth(2);
    for(const x of [570,920,1290,1770,2120,2560,2930,3380,3900,4220,4580,5150])this.add.image(x,groundY(x),'geo-shrub').setOrigin(.5,1).setScale(0.5).setDepth(4);
    // Place the pond on the flat terrace, above the walking surface.
    const pondX=2630;
    this.add.image(pondX,groundY(pondX)-36,'geo-pond').setOrigin(.5).setScale(.5).setDepth(4);
    for(const fx of [790,815,840,3070,3095,3120]){
      const fy=Math.round(groundY(fx)/3)*3;
      g.fillStyle(0x403e47).fillRect(fx,fy-45,9,42);
      g.fillStyle(0xae8e6e).fillRect(fx,fy-45,6,39).fillRect(fx-9,fy-30,30,6);
      g.fillStyle(0xdbc096).fillRect(fx-9,fy-30,30,3);
    }
  }
  private drawTerrain() {
    this.add.image(0,0,'geo-terrain').setOrigin(0).setScale(1).setDepth(10);
    const g=this.add.graphics().setDepth(11);
    g.fillStyle(0x306e83).fillRect(3630,1170,129,330);
    for(let y=1176;y<1480;y+=24){g.fillStyle(0x84c0c0).fillRect(3642+y%17,y,57,3);}
    const y=groundY(3575);
    g.fillStyle(0x3a3b49).fillRect(3567,y-63,9,63);
    g.fillStyle(0xa18465).fillRect(3534,y-66,84,30);
    g.fillStyle(0xd9be8c).fillRect(3534,y-66,84,3);
    this.add.text(3577,y-50,'ПРЫЖОК →',{fontFamily:'monospace',fontSize:'10px',color:'#292e40'}).setOrigin(.5).setDepth(20);
    // Few warm flowers along the trail give a scale reference and color accent.
    for(const x of [500,1260,2090,2850,4210,4790]){
      const y=groundY(x)+24;
      g.fillStyle(0x425c4c).fillRect(x,y-12,3,15);
      g.fillStyle(0xd79081).fillRect(x-3,y-15,9,6);
      g.fillStyle(0xf4d39b).fillRect(x,y-15,3,3);
    }
  }
  private drawFinish() {
    const { x, y } = level01.finish;
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x9b744e).fillRoundedRect(x, y - 145, 9, 145, 4);
    g.fillStyle(0xd58d61).fillPoints([{ x: x + 9, y: y - 139 }, { x: x + 77, y: y - 139 }, { x: x + 63, y: y - 117 }, { x: x + 77, y: y - 95 }, { x: x + 9, y: y - 95 }], true);
  }
  private drawHud() {
    const g = this.add.graphics().setScrollFactor(0).setDepth(100);
    g.fillStyle(0x142c40, 0.93).fillRect(24, 24, 310, 84);
    this.add.text(44, 39, 'ГОРЕЦ', { fontFamily: 'monospace', fontSize: '24px', fontStyle: 'bold', color: '#f2d5ac' }).setScrollFactor(0).setDepth(101);
    this.add.text(44, 73, '01  /  СПУСК В СЕЛЕНИЕ', { fontFamily: 'monospace', fontSize: '13px', color: '#9db9b6', letterSpacing: 2 }).setScrollFactor(0).setDepth(101);
    g.fillStyle(0x142c40, 0.92).fillRect(894, 24, 362, 52);
    this.add.text(914, 36, 'Дойди до нижнего селения', { fontFamily: 'monospace', fontSize: '16px', color: '#f2d5ac' }).setScrollFactor(0).setDepth(101);
    g.fillStyle(0x425b6a).fillRoundedRect(914, 61, 320, 4, 2);
    this.progress = this.add.graphics().setScrollFactor(0).setDepth(102);
    g.fillStyle(0x142c40, 0.94).fillRect(230, 665, 820, 34);
    this.add.text(640, 682, 'A / D  или  ← →    •    Пробел — прыжок    •    R — заново', { fontFamily: 'monospace', fontSize: '15px', color: '#b9caca' }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }
  update(time: number, delta: number) {
    if (this.finished) return;
    this.player.update(time, delta);
    const floor = groundY(this.player.x);
    this.shadow.setPosition(this.player.x, floor + 3).setVisible(!isGap(this.player.x));
    this.shadow.setAlpha(Phaser.Math.Clamp(1 - (floor - this.player.y) / 400, 0.1, 1));
    this.progress.clear().fillStyle(0x88c4b7).fillRoundedRect(914, 61, 320 * Phaser.Math.Clamp(this.player.x / level01.finish.x, 0.01, 1), 4, 2);
    if (this.player.y > level01.height + 100) { this.scene.restart(); return; }
    if (this.player.x > level01.finish.x - 20 && this.player.y > level01.finish.y - 140) {
      const beforeOverlay = [...this.children.list];
      this.finished = true; this.player.setVelocity(0); this.physics.pause();
      this.add.rectangle(640, 360, 1280, 720, 0x344e51, 0.25).setScrollFactor(0).setDepth(110);
      const panel = this.add.graphics().setScrollFactor(0).setDepth(111);
      panel.fillStyle(0x19364a).fillRect(300, 255, 680, 210);
      this.add.text(640, 308, 'Тропа пройдена', { fontFamily: 'monospace', fontSize: '36px', color: '#f2d5ac' }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
      this.add.text(640, 371, 'Впереди — нижнее селение', { fontFamily: 'monospace', fontSize: '21px', color: '#b9caca' }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
      this.add.text(640, 423, 'R — пройти снова', { fontFamily: 'monospace', fontSize: '16px', color: '#b9caca' }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
      this.cameras.main.ignore(this.children.list.filter(o => !beforeOverlay.includes(o)));
    }
  }
}
