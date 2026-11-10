const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(p,deps={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,Math,require:n=>deps[n]});return m.exports;}
const rules=load('src/game/hazards/acidRules.ts');
const {acidPools,acidBubblesAt,touchesBubble,acidCycle}=rules;
const terrain=load('src/game/levels/level01.ts');
for(const pool of acidPools){
 const floor=terrain.groundY(pool.x);
 assert.equal(acidBubblesAt(0,pool.x,floor).length,1,'first approach immediately demonstrates one bubble');
 for(let t=0;t<acidCycle*3;t+=13)assert.ok(acidBubblesAt(t,pool.x,floor).length<=1,'never stack bubbles');
 assert.ok(acidBubblesAt(800,pool.x,floor)[0].y<acidBubblesAt(0,pool.x,floor)[0].y);
 assert.ok(acidBubblesAt(1300,pool.x,floor)[0].alpha<1);
 for(let t=1400;t<3200;t+=16)assert.equal(acidBubblesAt(t,pool.x,floor).length,0);
 assert.equal(acidBubblesAt(3200,pool.x,floor).length,1,'fixed repeat interval');
 const first=acidBubblesAt(0,pool.x,floor)[0];
 assert.equal(touchesBubble({x:first.x-14,y:floor-94,width:28,height:94},first),true);
 assert.equal(touchesBubble({x:first.x-14,y:floor-94,width:28,height:94},{...first,alpha:0}),false);
 let x=pool.x-80;
 for(let t=1400;t<3000;t+=1000/60){x+=290/60;assert.equal(acidBubblesAt(t,pool.x,floor).some(b=>touchesBubble({x:x-14,y:floor-94,width:28,height:94},b)),false);}
 assert.ok(x>pool.x+250);
}
const node=()=>({setDepth(){return this},setVisible(){return this},setOrigin(){return this},setPosition(){return this},setDisplaySize(){return this},setAlpha(){return this}});
class Sprite{constructor(scene,x,y){Object.assign(this,{scene,x,y});}setOrigin(){return this}setScale(){return this}setDepth(){return this}setFrame(){return this}}
let textCalls=0;
const scene={time:{now:20000},add:{existing(){},image:node,text(){textCalls++;throw Error('hazard must not create instructional text')}}};
const {AcidJug}=load('src/game/hazards/AcidJug.ts',{phaser:{default:{GameObjects:{Sprite}}},'../levels/level01':terrain,'./acidRules':rules});
const jug=new AcidJug(scene,4660);jug.animate(20000,150);assert.equal(jug.startedAt,null);
jug.animate(20000,4400);assert.equal(jug.bubbles.length,1);
scene.time.now=21400;jug.animate(21400,4400);assert.equal(jug.bubbles.length,0);
scene.time.now=23200;jug.animate(23200,4400);assert.equal(jug.bubbles.length,1);
assert.equal(textCalls,0);
const roof=load('src/game/hazards/roofRules.ts',{'../levels/level01':terrain,'./acidRules':rules});
for(const leak of roof.roofLeaks){
 const floor=terrain.groundY(leak.x);
 assert.equal(leak.x,terrain.level01.houses[2].x+137,'right eave of the pre-ravine house');
 const gap=terrain.level01.gaps[0];
 assert.ok(gap.from-leak.x>=120,'room to stop after the drop and prepare a jump');
 assert.equal(terrain.groundY(leak.x+100),floor,'standing area before ravine stays flat');
 assert.equal(terrain.groundY(terrain.level01.houses[2].x-144),terrain.groundY(terrain.level01.houses[2].x+144),'house rests on a flat terrace');
 assert.ok(leak.y<floor-100,'source sits above the walking path');
 assert.equal(roof.dripAt(0,leak.x,leak.y,floor).falling,false);
 const d=roof.dripAt(900,leak.x,leak.y,floor);assert.equal(d.falling,true);
 assert.equal(roof.touchesDrip({x:d.x-14,y:d.y-40,width:28,height:94},900,leak.x,leak.y,floor),true);
 for(let t=1300;t<2800;t+=10)assert.equal(roof.touchesDrip({x:leak.x-14,y:floor-94,width:28,height:94},t,leak.x,leak.y,floor),false,'puddle/splash cannot hurt');
 assert.equal(roof.dripAt(2000,leak.x,leak.y,floor),null);
 assert.equal(JSON.stringify(roof.dripAt(900,leak.x,leak.y,floor)),JSON.stringify(roof.dripAt(3700,leak.x,leak.y,floor)));
}
console.log('Hazard checks passed: immediate single bubble, constant cadence, rising/evaporation, safe passage, no labels, falling drop, harmless puddle/splash and repeat timing.');
