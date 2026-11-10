import Phaser from 'phaser';
import { groundY, level01 } from '../levels/level01';

export function riverSurface(x:number):number{return 14+Math.sin((x+60)/250*Math.PI)*7;}

// A horizontal river on the canyon floor, hidden under the banks at both ends.
// Its source and destination continue behind terrain, instead of ending in mid-air.
export class Stream extends Phaser.GameObjects.Graphics {
  constructor(scene:Phaser.Scene){
    super(scene);scene.add.existing(this);
    const gap=level01.gaps[0];
    this.setPosition(gap.from,groundY((gap.from+gap.to)/2)+300).setDepth(9);
    this.animate(0);
  }
  animate(time:number){
    this.clear();
    const upper:Phaser.Types.Math.Vector2Like[]=[],lower:Phaser.Types.Math.Vector2Like[]=[];
    for(let x=-60;x<=190;x+=5){const y=riverSurface(x);upper.push({x,y});lower.push({x,y:y+27});}
    this.fillStyle(0x59b9c8).fillPoints([...upper,...lower.slice().reverse()],true);
    this.lineStyle(2,0xb4e9df,.65).strokePoints(upper);
    for(let i=0;i<6;i++){
      const x=-60+((i*47+time*.018)%210),y=riverSurface(x)+9+(i%2)*8;
      const points:Phaser.Types.Math.Vector2Like[]=[];
      for(let j=0;j<=8;j++)points.push({x:x+j*4,y:y+Math.sin(j*.65+time*.002+i)*1.2});
      this.lineStyle(1.3,0xd2f4ec,.7).strokePoints(points);
    }
  }
}
