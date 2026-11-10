const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(p,deps={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,Math,require:n=>deps[n]});return m.exports;}
const {acidPools,acidFrameAt,acidPhaseAt,acidBubblesAt,touchesBubble,acidCycle}=load('src/game/hazards/acidRules.ts');
const {groundY,level01}=load('src/game/levels/level01.ts');
assert.equal(acidPhaseAt(0),'warning');assert.equal(acidPhaseAt(999),'warning');
assert.equal(acidPhaseAt(1000),'emission');assert.equal(acidPhaseAt(2800),'clearing');
assert.equal(acidPhaseAt(4600),'safe');assert.equal(acidPhaseAt(7799),'safe');assert.equal(acidPhaseAt(7800),'warning');
for(const pool of acidPools){
 const floor=groundY(pool.x);
 assert.ok(pool.x>level01.gaps[0].to);
 assert.equal(acidBubblesAt(999,pool.x,floor).length,0,'full warning before danger');
 const first=acidBubblesAt(1000,pool.x,floor)[0];
 const rising=acidBubblesAt(1500,pool.x,floor)[0];
 assert.ok(rising.y<first.y,'bubbles rise');
 assert.ok(acidBubblesAt(2500,pool.x,floor)[0].alpha<1,'old bubbles evaporate');
 assert.equal(touchesBubble({x:first.x-14,y:floor-94,width:28,height:94},first),true);
 assert.equal(touchesBubble({x:first.x-14,y:floor-94,width:28,height:94},{...first,alpha:0}),false);
 assert.equal(touchesBubble({x:first.x-100,y:first.y-100,width:28,height:94},first),false);
 for(let t=4600;t<acidCycle;t+=16)assert.equal(acidBubblesAt(t,pool.x,floor).length,0,'safe phase must have no remaining bubbles');
 // Walk through the entire asset without jumping during the safe window.
 let x=pool.x-80;
 for(let t=4600;t<6200;t+=1000/60){
  x+=290/60;
  const player={x:x-14,y:floor-94,width:28,height:94};
  assert.equal(acidBubblesAt(t,pool.x,floor).some(b=>touchesBubble(player,b)),false);
 }
 assert.ok(x>pool.x+250,'safe phase allows crossing with room to spare');
 for(let t=0;t<acidCycle;t+=125)assert.equal(JSON.stringify(acidBubblesAt(t,pool.x,floor)),JSON.stringify(acidBubblesAt(t+acidCycle,pool.x,floor)),'repeatable cycle');
}
assert.equal(acidFrameAt(960),0);
console.log('Acid checks passed: warning, rising bubbles, evaporation, contact, safe walking, no late bubbles and cyclic timing.');

// Exercise the actual hazard object and its approach-triggered scene clock.
const node=()=>({setDepth(){return this},setVisible(){return this},setOrigin(){return this},setPosition(){return this},setDisplaySize(){return this},setAlpha(){return this},setText(s){this.text=s;return this},setColor(){return this}});
class Sprite {constructor(scene,x,y){Object.assign(this,{scene,x,y});}setOrigin(){return this}setScale(){return this}setDepth(){return this}setFrame(f){this.frame=f;return this}}
const terrain=load('src/game/levels/level01.ts');
const rules=load('src/game/hazards/acidRules.ts');
const {AcidJug}=load('src/game/hazards/AcidJug.ts',{phaser:{default:{GameObjects:{Sprite}}},'../levels/level01':terrain,'./acidRules':rules});
const scene={time:{now:20000},add:{existing(){},image:node,text:node}};
const jug=new AcidJug(scene,4660);
jug.animate(20000,150);assert.equal(jug.startedAt,null);
jug.animate(20000,4300);assert.equal(jug.label.text,'БУРЛИТ… ПОДОЖДИ');
scene.time.now=20999;jug.animate(20999,4300);assert.equal(jug.bubbles.length,0);
scene.time.now=21000;jug.animate(21000,4300);assert.ok(jug.bubbles.length>0);
scene.time.now=24600;jug.animate(24600,4700);assert.equal(jug.label.text,'ПРОХОДИ');assert.equal(jug.bubbles.length,0);
assert.equal(jug.touches({x:4730,y:1046,width:28,height:94}),false);
console.log('Hazard integration checks passed: distant idle, full first warning, active bubbles and safe passage.');
