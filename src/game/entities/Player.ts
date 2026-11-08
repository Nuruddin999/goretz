import Phaser from 'phaser';
export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<'A' | 'D' | 'W', Phaser.Input.Keyboard.Key>;
  private groundedAt = -Infinity;
  private jumpAt = -Infinity;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setSize(28, 56).setOffset(10, 8).setMaxVelocity(320, 1000);
    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('A,D,W') as typeof this.keys;
  }
  update(time: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down) this.groundedAt = time;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) || Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W)) this.jumpAt = time;
    const direction = Number(this.cursors.right.isDown || this.keys.D.isDown) - Number(this.cursors.left.isDown || this.keys.A.isDown);
    this.setVelocityX(direction * 290);
    if (direction) this.setFlipX(direction < 0);
    if (time - this.jumpAt < 130 && time - this.groundedAt < 100) {
      this.setVelocityY(-580); this.jumpAt = -Infinity; this.groundedAt = -Infinity;
    }
    if ((Phaser.Input.Keyboard.JustUp(this.cursors.space) || Phaser.Input.Keyboard.JustUp(this.cursors.up) || Phaser.Input.Keyboard.JustUp(this.keys.W)) && body.velocity.y < -220) this.setVelocityY(-220);
  }
}
