// Exercise the real Player terrain resolver without requiring a GPU or browser.
// Run after installing dependencies: node scripts/check-terrain.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const module = {exports:{}};
  vm.runInNewContext(code,{exports:module.exports,module,require:name=>dependencies[name]},{filename:file});
  return module.exports;
}
const terrain=load('src/game/levels/level01.ts',{});
const {Player}=load('src/game/entities/Player.ts',{
  phaser:{default:{Physics:{Arcade:{Sprite:class{}}},Math:{Clamp:(v,a,b)=>Math.max(a,Math.min(b,v))}}},
  '../levels/level01':terrain,
  '../combat/ratRules':load('src/game/combat/ratRules.ts',{'../levels/level01':terrain}),
});
function actor(x) {
  const p=Object.create(Player.prototype);
  p.grounded=true;
  p.body={position:{x:x-14,y:terrain.groundY(x)-94},prev:{x:x-14,y:terrain.groundY(x)-94},halfWidth:14,width:28,height:94,velocity:{x:0,y:0},blocked:{down:false},get bottom(){return this.position.y+this.height}};
  return p;
}
function step(p,dx=0) {
  const b=p.body;
  b.prev={...b.position};
  b.position.x+=dx;
  b.velocity.y+=1400/60;
  b.position.y+=b.velocity.y/60;
  p.resolveTerrain();
}
// Walk continuously downhill and back uphill: no jumps and no floating feet.
for(const direction of [1,-1]) {
  const p=actor(direction===1?100:3500);
  for(let i=0;i<680;i++) {
    step(p,direction*5);
    const x=p.body.position.x+14;
    assert.ok(Math.abs(p.body.bottom-terrain.groundY(x))<0.001,'feet must follow the slope');
  }
}
// Running off the ravine must make the player fall rather than snap to air.
const falling=actor(4025);
for(let i=0;i<15;i++) step(falling,5);
assert.equal(falling.grounded,false);
assert.ok(falling.body.bottom>terrain.groundY(4100)+20);
// A full jump must clear the ravine and land on the far bank.
const jumping=actor(3985);
jumping.grounded=false; jumping.body.velocity.y=-580;
let crossed=false;
for(let i=0;i<60;i++) {
  step(jumping,290/60);
  if(jumping.body.position.x+14>4160 && jumping.grounded) crossed=true;
}
assert.ok(crossed,'jump must reach the far bank');
// Landing from above works; approaching below the surface never teleports up.
const landing=actor(1300); landing.grounded=false;landing.body.position.y-=50;
for(let i=0;i<40;i++)step(landing);
assert.equal(landing.grounded,true);
const below=actor(1300);below.grounded=false;below.body.position.y+=100;
step(below);assert.equal(below.grounded,false);
console.log('Terrain checks passed: downhill, uphill, ravine fall, ravine jump, landing, no upward teleport.');
