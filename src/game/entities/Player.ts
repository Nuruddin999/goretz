import Phaser from 'phaser';
import { groundY, isGap, level01 } from '../levels/level01';
export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<'A' | 'D' | 'W', Phaser.Input.Keyboard.Key>;
  private groundedAt = -Infinity;
  private jumpAt = -Infinity;
  private grounded = false;
  private stride = 0;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'highlander', 6);
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setScale(3).setDepth(30);
    this.setSize(10, 34).setOffset(11, 4).setMaxVelocity(320, 1000);
    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('A,D,W') as typeof this.keys;
  }
  update(time: number, delta: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.grounded) this.groundedAt = time;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) || Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W)) this.jumpAt = time;
    const direction = Number(this.cursors.right.isDown || this.keys.D.isDown) - Number(this.cursors.left.isDown || this.keys.A.isDown);
    this.setVelocityX(direction * 290);
    if (direction) this.setFlipX(direction < 0);
    if (time - this.jumpAt < 130 && time - this.groundedAt < 100) {
      this.setVelocityY(-580); this.jumpAt = -Infinity; this.groundedAt = -Infinity; this.grounded = false;
    }
    if ((Phaser.Input.Keyboard.JustUp(this.cursors.space) || Phaser.Input.Keyboard.JustUp(this.cursors.up) || Phaser.Input.Keyboard.JustUp(this.keys.W)) && body.velocity.y < -220) this.setVelocityY(-220);
    this.stride += delta * 0.012;
    this.setFrame(!this.grounded ? 7 : direction ? Math.floor(this.stride) % 6 : 6);
  }
  // Arcade rectangles cannot represent slopes. Resolve the feet against the
  // same piecewise-linear surface used for drawing, after each physics step.
  resolveTerrain() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const half = body.halfWidth;
    body.position.x = Phaser.Math.Clamp(body.position.x, 0, level01.width - body.width);
    const footX = body.position.x + half;
    const floor = groundY(footX);
    const previousFloor = groundY(body.prev.x + half);
    const oldBottom = body.prev.y + body.height;
    const canFollowSlope = this.grounded && body.velocity.y >= 0;
    if (!isGap(footX) && body.velocity.y >= 0 &&
      (canFollowSlope || (oldBottom <= previousFloor + 12 && body.bottom >= floor))) {
      body.position.y = floor - body.height;
      body.velocity.y = 0;
      body.blocked.down = true;
      this.grounded = true;
    } else this.grounded = false;
  }
}
