import Phaser from 'phaser';
import { Rat } from '../entities/Rat';
import { contact, ratRoutes } from '../combat/ratRules';
import { Player } from '../entities/Player';
import { VIEW_WIDTH, VIEW_HEIGHT, RENDER_SCALE } from '../display';
import { Stream, waterSurfaceY } from '../art/Stream';
import { groundY, isGap, level01 } from '../levels/level01';

export class Level01Scene extends Phaser.Scene {
  private player!: Player;
  private stream!: Stream;
  private rats: Rat[] = [];
  private healthLabel!: Phaser.GameObjects.Text;
  private finished = false;
  private progress!: Phaser.GameObjects.Graphics;
  private shadow!: Phaser.GameObjects.Ellipse;
  private hudCamera!: Phaser.Cameras.Scene2D.Camera;
  constructor() { super('Level01'); }
  create() {
    this.finished = false;
    this.physics.resume();
    this.physics.world.setBounds(0, -200, level01.width, level01.height + 500);
    this.cameras.main.setBounds(0, 0, level01.width, level01.height).setZoom(0.58 * RENDER_SCALE);
    this.drawBackdrop();
    this.drawVillage();
    this.drawTerrain();
    this.shadow = this.add.ellipse(level01.spawn.x, groundY(level01.spawn.x), 49, 9, 0x385c45, 0.2).setDepth(29);
    this.player = new Player(this, level01.spawn.x, level01.spawn.y);
    this.rats = ratRoutes.map(route => new Rat(this, route));
    const resolve = () => {
      if (this.finished) return;
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      const descending = body.velocity.y;
      const previousBottom = body.prev.y + body.height;
      this.player.resolveTerrain();
      for (const rat of this.rats) {
        if (!rat.alive) continue;
        const enemy = rat.body as Phaser.Physics.Arcade.Body;
        const result = contact({x:body.x,y:body.y,width:body.width,height:body.height},
          {x:enemy.x,y:enemy.y,width:enemy.width,height:enemy.height},previousBottom,descending);
        if (result === 'stomp') { rat.defeat(); this.player.bounce(); break; }
        if (result === 'hurt' && this.player.receiveHit(this.time.now,body.center.x < enemy.center.x ? -1 : 1)) {
          this.healthLabel.setText('♥ '.repeat(this.player.health.remaining) + '♡ '.repeat(3-this.player.health.remaining));
          this.cameras.main.shake(100, .002);
          if (this.player.health.remaining === 0) {
            this.finished = true; this.physics.pause();
            this.time.delayedCall(400, () => this.scene.restart());
          }
          break;
        }
      }
    };
    this.physics.world.on(Phaser.Physics.Arcade.Events.WORLD_STEP, resolve);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.physics.world.off(Phaser.Physics.Arcade.Events.WORLD_STEP, resolve));
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -170, 95);
    this.drawFinish();
    const worldObjects = [...this.children.list];
    this.drawHud();
    // HUD stays at normal size while the world is zoomed out.
    this.hudCamera = this.cameras.add(0, 0, VIEW_WIDTH * RENDER_SCALE, VIEW_HEIGHT * RENDER_SCALE).setZoom(RENDER_SCALE).setOrigin(0, 0);
    this.hudCamera.ignore(worldObjects);
    this.cameras.main.ignore(this.children.list.filter(o => !worldObjects.includes(o)));
    const restart = () => this.scene.restart();
    this.input.keyboard!.on('keydown-R', restart);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard!.off('keydown-R', restart));
  }

  private drawBackdrop() {
    this.scene.launch('IllustratedBackdrop');
    this.scene.sendToBack('IllustratedBackdrop');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.scene.stop('IllustratedBackdrop'));
  }
  private drawVillage() {
    const g=this.add.graphics().setDepth(1);
    for(const h of level01.houses){
      const y=groundY(h.x);
      // The illustration already has a stone footing. Its visible base, not the
      // transparent texture margin, sits on the ground. No oversized gray slab.
      this.add.image(h.x,y+8,h.key).setOrigin(.5,1).setScale(.5).setDepth(3);
    }
    for(const x of level01.trees)this.add.image(x,Math.max(groundY(x-70),groundY(x+70))+8,'geo-tree').setOrigin(.5,1).setScale(0.5).setDepth(2);
    for(const x of level01.shrubs)this.add.image(x,Math.max(groundY(x-45),groundY(x+45))+8,'geo-shrub').setOrigin(.5,1).setScale(0.5).setDepth(4);
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
    this.stream=new Stream(this);
    const signX=3280;
    this.add.image(signX,groundY(signX)+2,'jump-sign').setOrigin(.5,1).setScale(.42).setDepth(20);
    for(const x of level01.rocks){
      const slope=Math.atan2(groundY(x+30)-groundY(x-30),60);
      this.add.image(x,groundY(x)+2,'illustrated-rock').setOrigin(.5,62/70).setScale(.5).setRotation(slope).setDepth(12);
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
    this.add.text(44, 39, 'ГОРЕЦ', { resolution: RENDER_SCALE, fontFamily: 'monospace', fontSize: '24px', fontStyle: 'bold', color: '#f2d5ac' }).setScrollFactor(0).setDepth(101);
    this.add.text(44, 73, '01  /  СПУСК В СЕЛЕНИЕ', { resolution: RENDER_SCALE, fontFamily: 'monospace', fontSize: '13px', color: '#9db9b6', letterSpacing: 2 }).setScrollFactor(0).setDepth(101);
    g.fillStyle(0x142c40, 0.92).fillRect(894, 24, 362, 52);
    this.add.text(914, 36, 'Дойди до нижнего селения', { resolution: RENDER_SCALE, fontFamily: 'monospace', fontSize: '16px', color: '#f2d5ac' }).setScrollFactor(0).setDepth(101);
    g.fillStyle(0x425b6a).fillRoundedRect(914, 61, 320, 4, 2);
    this.progress = this.add.graphics().setScrollFactor(0).setDepth(102);
    this.healthLabel = this.add.text(914, 87, '♥ ♥ ♥', { resolution: RENDER_SCALE, fontFamily: 'sans-serif', fontSize: '27px', color: '#f4a18e', stroke: '#142c40', strokeThickness: 4 }).setScrollFactor(0).setDepth(101);
    this.add.text(640, 641, 'Прыгай крысе на спину. Столкновение сбоку — урон.', { resolution: RENDER_SCALE, fontFamily: 'sans-serif', fontSize: '17px', color: '#ffffff', stroke: '#142c40', strokeThickness: 4 }).setOrigin(.5).setScrollFactor(0).setDepth(101);
    g.fillStyle(0x142c40, 0.94).fillRect(230, 665, 820, 34);
    this.add.text(640, 682, 'A / D  или  ← →    •    Пробел — прыжок    •    R — заново', { resolution: RENDER_SCALE, fontFamily: 'monospace', fontSize: '15px', color: '#b9caca' }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }
  update(time: number, delta: number) {
    if (this.finished) return;
    this.player.update(time, delta);
    for (const rat of this.rats) rat.update(delta);
    this.stream.animate(time);
    const floor = groundY(this.player.x);
    this.shadow.setPosition(this.player.x, floor + 3).setVisible(!isGap(this.player.x));
    this.shadow.setAlpha(Phaser.Math.Clamp(1 - (floor - this.player.y) / 400, 0.1, 1));
    this.progress.clear().fillStyle(0x88c4b7).fillRoundedRect(914, 61, 320 * Phaser.Math.Clamp(this.player.x / level01.finish.x, 0.01, 1), 4, 2);
    if(isGap(this.player.x) && this.player.y+54>=waterSurfaceY()){this.scene.restart();return;}
    if (this.player.y > level01.height + 100) { this.scene.restart(); return; }
    if (this.player.x > level01.finish.x - 20 && this.player.y > level01.finish.y - 140) {
      const beforeOverlay = [...this.children.list];
      this.finished = true; this.player.setVelocity(0); this.physics.pause();
      this.add.rectangle(640, 360, 1280, 720, 0x344e51, 0.25).setScrollFactor(0).setDepth(110);
      const panel = this.add.graphics().setScrollFactor(0).setDepth(111);
      panel.fillStyle(0x19364a).fillRect(300, 255, 680, 210);
      this.add.text(640, 308, 'Тропа пройдена', { resolution: RENDER_SCALE, fontFamily: 'monospace', fontSize: '36px', color: '#f2d5ac' }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
      this.add.text(640, 371, 'Впереди — нижнее селение', { resolution: RENDER_SCALE, fontFamily: 'monospace', fontSize: '21px', color: '#b9caca' }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
      this.add.text(640, 423, 'R — пройти снова', { resolution: RENDER_SCALE, fontFamily: 'monospace', fontSize: '16px', color: '#b9caca' }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
      this.cameras.main.ignore(this.children.list.filter(o => !beforeOverlay.includes(o)));
    }
  }
}
