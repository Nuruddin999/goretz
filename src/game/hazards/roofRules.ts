import { level01, groundY } from '../levels/level01';
import { touchesBubble } from './acidRules';
import type { Rect } from '../combat/ratRules';
// The right eave of the house immediately before the ravine. Values match house-small's illustrated
// 288x220 footprint at scale .5; the growth sits over the lip, not in the sky.
const house=level01.houses[2];
export const roofLeaks=[{x:house.x+137,y:groundY(house.x)-126}];
export const dripCycle=2800;
export function dripAt(time:number,x:number,y:number,floor:number){
  const age=Math.max(0,time)%dripCycle,origin=y+4;
  if(age<600){const radius=2+6*age/600;return {x,y:origin+radius*1.4,radius,alpha:1,falling:false,splash:false};}
  if(age<1300){const t=(age-600)/700;return {x,y:origin+11.2+(floor-8-origin-11.2)*(.18*t+.82*t*t),radius:8,alpha:1,falling:true,splash:false};}
  if(age<1600)return {x,y:floor-2,radius:8+(age-1300)/20,alpha:1-(age-1300)/300,falling:false,splash:true};
  return null;
}
export function touchesDrip(player:Rect,time:number,x:number,y:number,floor:number){
  const drop=dripAt(time,x,y,floor);
  return !!drop && drop.falling && touchesBubble(player,drop);
}
