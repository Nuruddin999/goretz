const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(p){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports});return m.exports;}
const {acidPools,touchesAcid,acidFrameAt}=load('src/game/hazards/acidRules.ts');
const {groundY,level01}=load('src/game/levels/level01.ts');
for(const pool of acidPools){
 const floor=groundY(pool.x);
 assert.equal(groundY(pool.from-80),floor);assert.equal(groundY(pool.to+140),floor,'room to land on flat ground');
 assert.equal(touchesAcid({x:pool.from,y:floor-94,width:28,height:94},pool.from,pool.to,floor),true);
 assert.equal(touchesAcid({x:pool.from,y:floor-160,width:28,height:94},pool.from,pool.to,floor),false);
 let x=pool.from-70,feet=floor,vy=-580,touched=false;
 for(let i=0;i<60;i++){
  x+=290/60;vy+=1400/60;feet=Math.min(floor,feet+vy/60);
  if(touchesAcid({x:x-14,y:feet-94,width:28,height:94},pool.from,pool.to,floor))touched=true;
 }
 assert.equal(touched,false,'normal jump clears the acid');assert.ok(x-14>pool.to);
 for(const h of level01.houses)assert.ok(h.x+144<pool.x || h.x-144>pool.x+192,'hazard has no house behind it');
}
assert.equal(acidFrameAt(0),0);assert.equal(acidFrameAt(959),7);assert.equal(acidFrameAt(960),0);assert.equal(acidFrameAt(1920),0);
console.log('Acid checks passed: contact, airborne safety, full jump, landing room, open backdrop and animation loop.');
