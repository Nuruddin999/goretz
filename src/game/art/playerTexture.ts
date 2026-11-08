import Phaser from 'phaser';
// Original 32x40 pixel sprite, eight poses. Nearest-neighbour scale is 3x.
export function createPlayerTexture(scene: Phaser.Scene) {
  if (scene.textures.exists('highlander')) return;
  const canvas=document.createElement('canvas'); canvas.width=32*8; canvas.height=40;
  const c=canvas.getContext('2d')!;
  const block=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  for(let f=0;f<8;f++){
    c.save(); c.translate(f*32,0);
    const stride=[0,2,3,0,-2,-3,0,0][f],jump=f===7;
    const bob=f===1||f===4?-1:0;c.translate(0,bob);
    // Back arm, two independently posed legs, strong readable outline.
    block('#273344',9,17,4,12);block('#a15d4e',10,18,2,8);block('#d7a27a',10,26,3,3);
    block('#273344',12-stride,28,5,9);block('#476273',13-stride,29,3,7);
    block('#202e40',10-stride,36-(jump?3:0),7,2);
    block('#273344',18+stride,28,5,9);block('#557181',19+stride,29,3,7);
    block('#202e40',18+stride,36-(jump?5:0),7,2);
    block('#283344',10,15,14,15);block('#a05d51',11,17,12,11);block('#c47d60',18,17,4,10);
    block('#e5c59b',15,16,5,2);block('#e5c59b',16,18,3,2);
    block('#33424f',10,27,14,3);block('#d5b579',17,27,3,2);
    // Front arm is separated from the coat by a shadow edge.
    const arm=jump?-3:Math.round(stride/2);
    block('#273344',23,18+arm,4,10);block('#c78765',23,18+arm,3,8);block('#f0bc88',23,26+arm,4,3);
    block('#283344',13,5,12,11);block('#e5af82',14,7,10,8);
    block('#f4cb96',21,8,3,5);block('#273344',22,9,2,2);block('#e5af82',24,11,2,2);
    block('#6e4b47',14,13,10,3);block('#b37b60',15,13,7,1);
    // Papakha: clustered fleece pixels, a lit crown and shaded lower band.
    block('#293847',10,1,16,7);block('#d3c8b4',11,1,14,6);block('#f1e4c4',11,1,13,3);
    block('#fff0ce',12,0,3,2);block('#fff0ce',17,0,3,2);block('#e4d6b9',23,2,2,3);
    block('#9c9d98',11,6,14,2);block('#fff0d0',14,2,2,1);block('#c5bca8',18,4,2,1);
    c.restore();
  }
  scene.textures.addCanvas('highlander',canvas);
  const texture=scene.textures.get('highlander');
  for(let i=0;i<8;i++)texture.add(i,0,i*32,0,32,40);
}
