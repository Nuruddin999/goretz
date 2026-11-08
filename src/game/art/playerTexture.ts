import Phaser from 'phaser';

// Native geometric artwork drawn once at 2x resolution; every pose includes both arms.
export function createPlayerTexture(scene: Phaser.Scene) {
  if (scene.textures.exists('highlander')) return;
  const canvas = document.createElement('canvas');
  canvas.width = 96 * 2 * 8; canvas.height = 112 * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);
  const rounded = (x: number, y: number, w: number, h: number, r: number, color: string) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill();
  };
  for (let frame = 0; frame < 8; frame++) {
    ctx.save(); ctx.translate(frame * 96, 0);
    const stride = frame < 6 ? Math.sin(frame / 6 * Math.PI * 2) : 0;
    const jump = frame === 7;
    const bob = frame < 6 ? Math.abs(stride) * 1.5 : 0;
    ctx.translate(0, -bob);
    const limb = (x: number, y: number, angle: number, w: number, h: number, color: string, hand = false) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      rounded(-w / 2, 0, w, h, w / 2, color);
      if (hand) rounded(-w / 2, h - 3, w, 10, 4, '#e5ae7c');
      else rounded(-w / 2 - 1, h - 6, w + 8, 10, 4, '#334550');
      ctx.restore();
    };
    limb(43, 72, jump ? 0.5 : stride * 0.48, 12, 28, '#344653');
    limb(56, 72, jump ? -0.6 : -stride * 0.48, 12, 28, '#405564');
    limb(35, 45, jump ? 0.7 : -stride * 0.48 + 0.1, 12, 32, '#3b5a64', true);
    rounded(34, 40, 33, 43, 8, '#527a78');
    rounded(49, 42, 14, 38, 5, '#80a49a');
    ctx.fillStyle = '#edcf9f'; ctx.beginPath(); ctx.moveTo(44, 41); ctx.lineTo(53, 57); ctx.lineTo(59, 41); ctx.fill();
    rounded(32, 70, 37, 7, 3, '#4d5050'); rounded(48, 70, 7, 7, 2, '#d3b66d');
    limb(64, 45, jump ? -0.9 : stride * 0.48 - 0.08, 12, 32, '#80a49a', true);
    rounded(40, 17, 27, 28, 10, '#edba88');
    ctx.fillStyle = '#edba88'; ctx.beginPath(); ctx.arc(67, 32, 5, 0, Math.PI * 2); ctx.fill();
    rounded(40, 35, 26, 11, 5, '#655348');
    ctx.fillStyle = '#344550'; ctx.beginPath(); ctx.arc(61, 28, 2, 0, Math.PI * 2); ctx.fill();
    rounded(34, 4, 37, 20, 7, '#f6e9cc');
    rounded(34, 19, 38, 7, 3, '#dfd1b0');
    // Three broad fleece shapes, deliberately no noisy fur texture.
    ctx.fillStyle = '#fff3d9'; ctx.fillRect(36, 3, 31, 6);
    ctx.restore();
  }
  scene.textures.addCanvas('highlander', canvas);
  const texture = scene.textures.get('highlander');
  for (let i = 0; i < 8; i++) texture.add(i, 0, i * 192, 0, 192, 224);
}
