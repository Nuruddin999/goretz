import Phaser from 'phaser';
import { groundY, level01 } from '../levels/level01';

export const WATER_FRAME_COUNT=8;
export const WATER_FRAME_MS=125;
export function waterFrameAt(time:number):number{return Math.floor(Math.max(0,time)/WATER_FRAME_MS)%WATER_FRAME_COUNT;}
export function waterSurfaceY():number{
  const gap=level01.gaps[0];return groundY((gap.from+gap.to)/2)+130;
}

// Real image frames: a cyan wave surface with a blue body down to the riverbed.
// Ends overlap the banks and are occluded by the foreground terrain (depth 10).
export class Stream extends Phaser.GameObjects.Sprite {
  constructor(scene:Phaser.Scene){
    const gap=level01.gaps[0],height=500;
    super(scene,gap.from-60,waterSurfaceY()-97/508*height,'water-animation',0);
    scene.add.existing(this);
    this.setOrigin(0).setDisplaySize(gap.to-gap.from+120,height).setDepth(9);
  }
  animate(time:number){this.setFrame(waterFrameAt(time));}
}
