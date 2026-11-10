const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies={}) {
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const module={exports:{}};
  vm.runInNewContext(code,{module,exports:module.exports,require:name=>dependencies[name]},{filename:file});
  return module.exports;
}
const rules=load('src/game/combat/ratRules.ts');
const {groundY,isGap}=load('src/game/levels/level01.ts');
const {contact,Health,patrolDirection,ratRoutes}=rules;
const rat={x:100,y:100,width:50,height:25};
assert.equal(contact({x:110,y:40,width:28,height:65},rat,95,200),'stomp');
assert.equal(contact({x:110,y:90,width:28,height:65},rat,140,200),'hurt','side contact is not a stomp');
assert.equal(contact({x:110,y:50,width:28,height:65},rat,110,-200),'hurt','upward contact cannot defeat a rat');
assert.equal(contact({x:0,y:50,width:28,height:65},rat,95,200),'none');
const health=new Health();
assert.equal(health.hit(0),true); assert.equal(health.remaining,2);
assert.equal(health.hit(1199),false); assert.equal(health.remaining,2);
assert.equal(health.hit(1200),true); assert.equal(health.remaining,1);
assert.equal(health.hit(2400),true); assert.equal(health.remaining,0);
assert.equal(health.hit(4000),false); assert.equal(health.remaining,0);
// Simulate 90 seconds for every real route: patrol stays on solid ground and
// turns at both ends, including at low framerate.
for (const route of ratRoutes) {
  let x=route.x,direction=-1,turns=0;
  for(let i=0;i<1800;i++) {
    const next=patrolDirection(x,direction,route,isGap);
    if(next!==direction)turns++;
    direction=next; x+=direction*route.speed*.05;
    assert.ok(x>=route.from && x<=route.to);
    assert.equal(isGap(x-30)||isGap(x+30),false);
    assert.equal(groundY(x-30),groundY(x+30),'first-level routes use predictable flat ground');
  }
  assert.ok(turns>=2);
}
const edge={x:3610,from:3400,to:3900,speed:60};
assert.equal(patrolDirection(3610,1,edge,isGap),-1,'turn before entering an unplanned gap');
// Exercise the actual Player methods: health gates knockback, and stomping
// clears coyote/buffer state so the next terrain step cannot cancel the bounce.
const {Player}=load('src/game/entities/Player.ts',{
  phaser:{default:{Physics:{Arcade:{Sprite:class{}}}}},
  '../combat/ratRules':rules,'../levels/level01':{groundY,isGap},
});
const player=Object.create(Player.prototype);player.health=new Health();
player.setVelocity=(x,y)=>{player.velocity={x,y};};
player.setVelocityY=y=>{player.velocity.y=y;};
assert.equal(player.receiveHit(0,-1),true);
assert.equal(player.velocity.x,-230);assert.equal(player.velocity.y,-260);
assert.equal(player.receiveHit(100,1),false);assert.equal(player.velocity.x,-230);
player.bounce();assert.equal(player.velocity.y,-400);assert.equal(player.grounded,false);
assert.equal(player.groundedAt,-Infinity);
console.log('Rat checks passed: stomps, side/upward hits, invulnerability, death, six patrols, ledges, knockback and bounce.');
