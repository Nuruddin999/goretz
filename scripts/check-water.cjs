const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps={}){
 const m={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports:m.exports,module:m,require:n=>deps[n]});return m.exports;
}
const loop=load('src/game/art/waterLoop.ts');
const {waterFrameAt,bakeWaterLoop,WATER_FRAME_COUNT,WATER_FRAME_MS,WATER_ATLAS_COLUMNS}=loop;
assert.equal(WATER_FRAME_COUNT,24);
const cycle=WATER_FRAME_COUNT*WATER_FRAME_MS;
assert.equal(waterFrameAt(0),0);assert.equal(waterFrameAt(WATER_FRAME_MS-1),0);
assert.equal(waterFrameAt(WATER_FRAME_MS),1);assert.equal(waterFrameAt(cycle-1),23);
assert.equal(waterFrameAt(cycle),0);assert.equal(waterFrameAt(-1),0);
// Deliberately incompatible tile edges and invisible white RGB: regressions for
// the square cut and milky halo visible with the old independently shifted frames.
const w=24,h=12,tile=new Uint8ClampedArray(w*h*4);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 const i=(y*w+x)*4;tile[i]=y<3?255:20+x*4;tile[i+1]=y<3?255:140;tile[i+2]=255;tile[i+3]=y<3?0:255;
}
const atlas=bakeWaterLoop(tile,w,h);
const pixel=(frame,x,y)=>{
 const ox=(frame%WATER_ATLAS_COLUMNS)*atlas.frameWidth,oy=Math.floor(frame/WATER_ATLAS_COLUMNS)*h;
 const i=((oy+y)*atlas.width+ox+x)*4;return Array.from(atlas.data.subarray(i,i+4));
};
for(let frame=0;frame<WATER_FRAME_COUNT;frame++)for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 assert.deepEqual(pixel(frame,x,y),pixel(frame,x+w,y),'two wave periods must match exactly');
 if(y<3)assert.deepEqual(pixel(frame,x,y),[0,0,0,0],'transparent air must not retain white RGB');
}
for(let y=0;y<h;y++)assert.deepEqual(pixel(0,0,y),pixel(0,w-1,y),'tile edges must have no discontinuity');
const differences=[];
for(let f=0;f<WATER_FRAME_COUNT;f++){
 let d=0;for(let y=3;y<h;y++)for(let x=0;x<w;x++)d+=Math.abs(pixel(f,x,y)[0]-pixel((f+1)%WATER_FRAME_COUNT,x,y)[0]);
 differences.push(d);
}
assert.ok(differences[23]<=Math.max(...differences.slice(0,23)),'last-to-first must not jump more than another step');
const stream=load('src/game/art/Stream.ts',{'./waterLoop':loop,phaser:{default:{GameObjects:{Sprite:class{}}}},'../levels/level01':{groundY:()=>1010,level01:{gaps:[{from:3630,to:3760}]}}});
assert.equal(stream.waterSurfaceY(),1140);
console.log('Water checks passed: 24 phases, cyclic boundary, identical repeat periods, transparent air, seamless edges.');
