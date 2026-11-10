import Phaser from 'phaser';
import { groundY, isGap } from '../levels/level01';
import { patrolDirection, type RatRoute } from '../combat/ratRules';

export class Rat extends Phaser.Physics.Arcade.Sprite {
  alive = true;
  private direction = -1;
  private distance = 0;
  constructor(scene: Phaser.Scene, private route: RatRoute) {
    super(scene, route.x, groundY(route.x), 'rat', 0);
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setOrigin(.5, 240 / 256).setScale(.18).setDepth(25);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false); body.moves = false;
    this.setSize(280, 132).setOffset(40, 108);
    this.update(0);
  }
  update(delta: number) {
    if (!this.alive) return;
    this.direction = patrolDirection(this.x, this.direction, this.route, isGap);
    const dx = this.direction * this.route.speed * Math.min(delta, 50) / 1000;
    this.setPosition(this.x + dx, groundY(this.x + dx));
    this.setFlipX(this.direction < 0);
    this.setOffset(this.direction < 0 ? 40 : 192, 108);
    this.distance += Math.abs(dx);
    this.setFrame(Math.floor(this.distance / 9) % 4);
    (this.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }
  defeat() {
    if (!this.alive) return;
    this.alive = false;
    this.body!.enable = false;
    this.scene.tweens.add({ targets: this, scaleY: .055, alpha: 0, duration: 250, onComplete: () => this.setVisible(false) });
  }
}
