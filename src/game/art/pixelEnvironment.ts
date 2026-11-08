import Phaser from 'phaser';
import { groundY, isGap, level01 } from '../levels/level01';

// All artwork has a real low-resolution pixel grid, enlarged with nearest sampling.
// This keeps highlights, masonry, foliage and silhouettes on the same pixel scale.
export const ART_SCALE = 3;
export const ink = '#263448';
type Paint = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
function texture(scene: Phaser.Scene, key: string, w: number, h: number, paint: Paint) {
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!; ctx.imageSmoothingEnabled = false;
  paint(ctx, w, h); scene.textures.addCanvas(key, canvas);
}
function rect(c: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function poly(c: CanvasRenderingContext2D, color: string, points: number[][]) {
  c.fillStyle = color; c.beginPath(); points.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath(); c.fill();
}
function random(seed: number) { let s = seed; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function house(c: CanvasRenderingContext2D, variant: number) {
  const r = random(59 + variant);
  // Stepped silhouette and a dark side wall ground the sandstone facade.
  rect(c, ink, 10, 17, 76, 78); rect(c, '#866c76', 12, 19, 15, 74);
  rect(c, '#cfac8a', 27, 19, 57, 74);
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 7; col++) {
      const x = 28 + col * 9 - (row % 2) * 4, y = 20 + row * 7;
      if (x > 27 && x + 7 < 84) {
        rect(c, ['#dcb995', '#c49d81', '#caa787', '#d5b18d'][Math.floor(r()*4)], x, y, 7, 5);
        if (r() > .45) rect(c, '#e6c9a1', x, y, 6, 1);
      }
    }
  }
  // Broad roof coping, highlights and its cast shadow.
  rect(c, '#634f61', 8, 16, 80, 5); rect(c, '#b68b76', 7, 13, 82, 4);
  rect(c, '#f0d3a2', 8, 12, 80, 2); rect(c, '#e3bd90', 13, 9, 71, 3);
  rect(c, '#96747a', 13, 11, 71, 1);
  const window = (x: number, y: number) => {
    rect(c, '#886b69', x-2, y-2, 13, 17); rect(c, '#3b4054', x, y, 9, 12);
    rect(c, '#58717a', x+1, y+1, 6, 4); rect(c, '#e6bc7e', x+1, y+6, 6, 5);
    rect(c, '#c7a47f', x+4, y, 1, 12); rect(c, '#ead0a4', x-2, y+13, 13, 2);
  };
  window(38, 29); window(65, 29);
  if (variant !== 1) window(65, 64);
  // Recessed arch and plank door.
  poly(c, '#3b3549', [[35,94],[35,68],[38,63],[42,60],[47,60],[51,63],[54,68],[54,94]]);
  rect(c, '#886850', 38, 70, 13, 24); rect(c, '#a9825f', 39, 67, 11, 3);
  for (const x of [40,44,48]) rect(c, '#5b4b49', x, 71, 1, 23);
  rect(c, '#e1ba79', 48, 80, 2, 2); rect(c, '#e9cfaa', 34, 93, 22, 2);
  if (variant === 1) {
    // Wooden balcony: posts, shaded recess and a visibly pixelled railing.
    rect(c, '#43394a', 28, 46, 61, 20); rect(c, '#88604f', 26, 43, 66, 3);
    rect(c, '#d7ab79', 26, 42, 66, 1);
    for (const x of [29,56,86]) { rect(c, '#6d4c49', x, 44, 3, 28); rect(c, '#ba8b63', x, 44, 1, 25); }
    for (let x=30;x<89;x+=5) rect(c, '#c0966d', x, 61, 2, 9);
    rect(c, '#ddba88', 27, 59, 65, 2); rect(c, '#78564e', 26, 70, 67, 4);
  }
  if (variant === 2) {
    poly(c, '#5a5368', [[6,17],[19,3],[76,3],[91,17]]);
    poly(c, '#b87e70', [[8,14],[21,1],[74,1],[88,14]]);
    for (let x=20;x<78;x+=8) rect(c, '#dc9e80', x, 5, 5, 2);
    rect(c, '#e8b18b', 9, 14, 80, 2);
  }
  // Creeping leaves and a tiny warm lantern, restrained detail rather than noise.
  for (let y=54;y<90;y+=5) { rect(c,'#42665a',79,y,2,5);rect(c,'#719557',76+(y%3),y,5,2); }
  rect(c,'#414052',59,76,2,8);rect(c,'#e4a963',58,79,4,5);rect(c,'#ffe0a3',59,80,2,2);
  rect(c, '#465c50', 10, 93, 22, 2); rect(c, '#7a9c58', 12, 91, 4, 3);
}
export function createEnvironmentTextures(scene: Phaser.Scene) {
  ['house-terrace','house-balcony','house-small'].forEach((key,i) => texture(scene,key,96,96,c=>house(c,i)));
  texture(scene,'pixel-sky',4,240,(c,w,h)=>{
    for(let y=0;y<h;y++) { const t=y/h; const a=[77,133,171],b=[181,204,211];const rgb=a.map((v,i)=>Math.round(v+(b[i]-v)*t));rect(c,`rgb(${rgb.join(',')})`,0,y,w,1); }
  });
  texture(scene,'pixel-mountains',1000,300,c=>{
    const r=random(32);
    const ridge=[[0,206],[55,175],[88,145],[124,173],[196,98],[217,58],[239,85],[267,73],[314,126],[352,145],[417,107],[454,38],[477,65],[503,57],[546,123],[605,161],[662,102],[689,71],[715,110],[743,95],[807,176],[879,113],[913,84],[949,149],[1000,182],[1000,300],[0,300]];
    poly(c,'#7d91b5',ridge);
    poly(c,'#637aa2',[[196,98],[217,58],[229,136],[270,196],[314,126],[353,239],[188,280],[104,300],[0,300]]);
    poly(c,'#566e98',[[454,38],[466,143],[493,185],[503,57],[518,158],[559,201],[600,300],[359,300],[417,107]]);
    poly(c,'#687fa5',[[689,71],[702,157],[743,95],[782,220],[864,300],[615,300]]);
    poly(c,'#d3d7db',[[176,124],[217,58],[239,85],[267,73],[284,94],[264,91],[244,109],[232,92],[223,118],[213,96],[199,125],[194,113]]);
    poly(c,'#f0e6db',[[420,103],[454,38],[477,65],[503,57],[521,91],[500,80],[487,104],[471,80],[461,97],[453,74],[439,103],[432,94]]);
    poly(c,'#c7d0da',[[669,111],[689,71],[715,110],[704,103],[696,116],[688,96],[679,113]]);
    // Deliberate sparse highlights on rock faces, clustered in the same facets.
    for(let i=0;i<150;i++){const x=Math.floor(r()*1000),y=170+Math.floor(r()*100);rect(c,'#8499b8',x,y,2+Math.floor(r()*8),1);}
  });
  texture(scene,'pixel-hills',1000,230,c=>{
    poly(c,'#427b78',[[0,145],[120,84],[174,95],[260,51],[338,94],[435,125],[517,77],[628,93],[740,45],[853,102],[925,80],[1000,126],[1000,230],[0,230]]);
    poly(c,'#386966',[[0,173],[120,84],[138,139],[260,51],[286,154],[435,159],[517,77],[541,165],[740,45],[755,134],[925,80],[947,170],[1000,156],[1000,230],[0,230]]);
    for(let x=0;x<1000;x+=15) {const y=165+(x*19%29);poly(c,'#315e62',[[x,y-15],[x+5,y-23],[x+10,y-15],[x+8,y-15],[x+13,y-8],[x+7,y-8],[x+7,y],[x+4,y],[x+4,y-8],[x-2,y-8],[x+2,y-15]]);}
  });
  texture(scene,'pixel-tree',56,80,c=>{
    rect(c,'#343c49',25,27,6,53);rect(c,'#866b58',26,37,3,42);
    poly(c,'#435b56',[[28,53],[15,41],[16,37],[28,45],[40,30],[43,32],[31,50]]);
    const r=random(50);
    const clusters=[[6,25,23,17],[12,12,25,22],[29,18,22,22],[18,2,23,22],[4,36,22,13],[29,33,20,13]];
    for(const [x,y,w,h]of clusters){rect(c,'#294e50',x+2,y+4,w,h);rect(c,'#507c55',x,y,w,h-3);rect(c,'#719752',x+3,y+1,w-6,5);}
    for(let i=0;i<35;i++){const x=8+Math.floor(r()*36),y=13+Math.floor(r()*25);rect(c,i%3?'#619052':'#9bb764',x,y,3,2);}
  });
  texture(scene,'pixel-shrub',32,16,c=>{
    poly(c,'#315552',[[0,16],[0,9],[4,9],[4,5],[9,5],[9,2],[18,2],[18,5],[25,5],[25,8],[31,8],[31,16]]);
    rect(c,'#659050',4,7,23,6);rect(c,'#8db35f',10,3,8,3);rect(c,'#a8c66d',5,7,5,2);rect(c,'#476f4e',16,11,13,4);
  });
  texture(scene,'pixel-cloud',96,24,c=>{
    poly(c,'#c4d2d8',[[0,24],[0,17],[10,17],[10,10],[24,10],[24,4],[43,4],[43,0],[58,0],[58,6],[72,6],[72,12],[88,12],[88,17],[96,17],[96,24]]);
    rect(c,'#e9e2d8',12,13,68,5);rect(c,'#f3e7d4',29,7,31,5);rect(c,'#e9e2d8',0,20,96,3);
  });
  texture(scene,'pixel-terrain',Math.ceil(level01.width/3),Math.ceil(1900/3),(c,w,h)=>{
    const r=random(908);
    for(let x=0;x<w;x++) {
      if(isGap(x*3))continue;
      const y=Math.round(groundY(x*3)/3);
      rect(c,'#4a454e',x,y+17,1,h-y);rect(c,'#77665c',x,y+9,1,13);
      rect(c,'#476e4d',x,y+4,1,7);rect(c,'#88a858',x,y+2,1,4);
      rect(c,'#d0ab78',x,y-2,1,5);rect(c,'#f0d09a',x,y-3,1,1);
      if(x%3===0){rect(c,'#bad07c',x,y+5,1,2);rect(c,'#365d4a',x,y+9,1,3);}
    }
    // Chunky stone clusters: lit tops, dark crevices, occasional moss.
    for(let row=0;row<75;row++)for(let col=0;col<w/13;col++){
      const x=Math.floor(col*13+(row%2)*6),y=Math.floor(row*9+15);
      const surface=groundY(x*3)/3;
      if(y<surface+20||isGap(x*3)||isGap((x+11)*3))continue;
      const shade=Math.floor(r()*3);const colors=['#685b59','#5b5256','#746359'];
      poly(c,colors[shade],[[x+2,y],[x+10,y],[x+12,y+3],[x+10,y+7],[x+1,y+7],[x,y+3]]);
      rect(c,['#897363','#77685e','#95806a'][shade],x+2,y,7,1);
      if(r()>.7)rect(c,'#354d49',x+1,y+2,3,2);
    }
    for(let x=4;x<w;x+=5){if(isGap(x*3))continue;const y=Math.round(groundY(x*3)/3);rect(c,'#b6c374',x,y+8,2,1);if(x%4===0){rect(c,'#7a9b55',x,y+12,1,4);rect(c,'#51724b',x+1,y+12,2,2);}}
  });
}
