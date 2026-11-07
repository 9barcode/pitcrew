import {Race} from './simulation.js';
export const OVERTAKE_TEAMS=['amber-fox','blue-comet'];
// Angle changes follow actual longitudinal separation, not a free-running movie.
export function overtakeAnimation(race,shot){
 if(shot.kind!=='battle'||shot.ids.length!==2||!shot.ids.includes(0)||!shot.ids.includes(1))return null;
 const gap=race.cars[1].distance-race.player.distance;
 const phase=gap>6?'approach':gap>=-6?'alongside':'departure';
 const row={approach:0,alongside:1,departure:2}[phase];
 return {phase,row,frame:Math.floor(race.time*9)%3,targetId:1,gap};
}
export function createOvertakeDemo(){const race=new Race;race.player.distance=100;race.player.speed=84;race.player.base=88;race.cars[1].distance=127;race.cars[1].speed=80;race.cars[1].base=82;for(const c of race.cars.slice(2)){c.distance=400+c.id*55;c.speed=80;}race.demoTargetId=1;race.event('추월 시연 · 앰버 폭스 vs 블루 코멧 · 실제 경기 상태로 재생');race.step(0);return race;}
