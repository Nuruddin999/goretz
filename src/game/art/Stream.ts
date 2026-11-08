import Phaser from 'phaser';

export function streamBanks(y:number):{left:number;right:number}{
  const sway=Math.sin(y/72)*7;
  const half=34+Math.min(y/360,1)*23;
  return {left:65+sway-half,right:65+sway+half};
}

// A stream at the bottom of the existing ravine. Visual only; physics is unchanged.
export class Stream extends Phaser.GameObjects.Graphics {
  constructor(scene:Phaser.Scene){
    super(scene);scene.add.existing(this);this.setPosition(3630,1160).setDepth(11);
    this.animate(0);
  }
  animate(time:number){
    this.clear();
    const left:Phaser.Types.Math.Vector2Like[]=[],right:Phaser.Types.Math.Vector2Like[]=[];
    for(let y=0;y<=360;y+=6){const b=streamBanks(y);left.push({x:b.left,y});right.push({x:b.right,y});}
    this.fillStyle(0x68c8d2).fillPoints([...left,...right.reverse()],true);
    // Pale moving reflections follow the local river banks and never cross them.
    for(let i=0;i<10;i++){
      const y=(i*38+time*.027)%360;
      const b=streamBanks(y),width=b.right-b.left;
      const points:Phaser.Types.Math.Vector2Like[]=[];
      for(let j=0;j<=12;j++){
        const x=b.left+width*.18+width*.64*j/12;
        points.push({x,y:y+Math.sin(j*.6+time*.0015+i)*2.5});
      }
      this.lineStyle(i%3?1.4:2.2,i%3?0xa2e5e5:0xd2f4ec,.65).strokePoints(points);
    }
    this.lineStyle(2,0xabe5df,.45).strokePoints(left);
    this.lineStyle(2,0xabe5df,.35).strokePoints(right);
  }
}
