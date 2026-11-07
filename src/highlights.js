export const TEAM_ASSETS=['amber-fox','blue-comet','crimson-volt','silver-heron','nova-pulse','iron-clover'];
export class Highlights {
 constructor(){this.targetId=null;this.started=0;this.time=-1;}
 select(r){if(r.time<this.time){this.targetId=null;this.started=0;}this.time=r.time;const p=r.player;
 if(p.state!=='track'){this.targetId=null;return {kind:p.state==='finished'?'finish':'pit',ids:[0],label:p.state==='service'?'피트 정비':p.state==='pit-exit'?'피트아웃':'피트인'};}
 if(this.targetId!==null){const c=r.cars[this.targetId];if(c.state==='track'&&Math.abs(c.distance-p.distance)<65&&r.time-this.started<7)return {kind:'battle',ids:[0,c.id],label:`배틀 · ${c.name}`};this.targetId=null;}
 const nearest=r.cars.slice(1).filter(c=>c.state==='track'&&c.finishTime===null&&Math.abs(c.distance-p.distance)<32).sort((a,b)=>Math.abs(a.distance-p.distance)-Math.abs(b.distance-p.distance))[0];
 if(nearest){this.targetId=nearest.id;this.started=r.time;return {kind:'battle',ids:[0,nearest.id],label:`배틀 · ${nearest.name}`};}
 const pass=r.passes[0];if(pass&&r.time-pass.time<2)return {kind:'battle',ids:[0,pass.carId],label:`${pass.direction==='overtake'?'추월':'피추월'} · ${r.cars[pass.carId].name}`};
 return {kind:'cruise',ids:r.order.filter(c=>c.state==='track'&&c.finishTime===null).slice(0,4).map(c=>c.id),label:'서킷 고정 카메라'};
 }
}
