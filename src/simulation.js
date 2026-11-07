export const LENGTH=1800, LAPS=3, ENTRY=.66*LENGTH, BOX=.75*LENGTH, EXIT=.86*LENGTH;
const names=['앰버 폭스','블루 코멧','크림슨 볼트','실버 헤론','노바 펄스','아이언 클로버'];
const colors=['#ffbc42','#4cb8ff','#ff616e','#d8e6ee','#b68aff','#6cdbb1'];
export class Race {
 constructor(delay=0){this.time=0;this.done=false;this.events=[];this.delay=delay;this.cars=names.map((name,i)=>({id:i,name,color:colors[i],distance:-i*9,speed:0,state:'track',pitRequested:false,pitted:false,service:0,serviceTotal:0,finishTime:null,tyre:1,lane:0,base:83-i*.22}));this.order=[...this.cars];}
 requestPit(){const c=this.cars[0];if(c.pitted||c.state!=='track'||this.done)return false;c.pitRequested=true;return true;}
 addDelay(){const c=this.cars[0];if(this.done||c.pitted)return false;this.delay+=2;if(c.state==='service')c.serviceTotal+=2;return true;}
 event(text){this.events.unshift({time:this.time,text});this.events.length=Math.min(this.events.length,8);}
 step(dt){if(this.done)return;this.time+=dt;
 const leaders=[...this.cars].sort((a,b)=>b.distance-a.distance);
 for(const c of this.cars){if(c.finishTime!==null)continue;const pos=((c.distance%LENGTH)+LENGTH)%LENGTH,lap=Math.floor(Math.max(0,c.distance)/LENGTH);
 if(!c.pitted&&lap>=1)c.pitRequested=true;
 if(c.state==='service'){c.speed=0;c.service+=dt;if(c.service>=c.serviceTotal){c.state='pit-exit';c.pitted=true;c.tyre=1;this.event(`${c.name} 정비 완료 · ${c.serviceTotal.toFixed(2)}초`);}continue;}
 const corner=Math.abs(Math.sin(pos/LENGTH*Math.PI*2))>.65;
 let target=c.state==='track'?c.base*(corner?.72:1)*(0.92+.08*c.tyre):30;
 let lane=0;
 if(c.state==='track'){
 const front=leaders.find(o=>o!==c&&o.state==='track'&&o.distance>c.distance&&o.distance-c.distance<24);
 if(front){if(!corner){lane=1;target+=2;}else{target=Math.min(target,Math.max(25,front.speed));}}
 // Pit exit yields to traffic in the merge zone instead of teleporting through it.
 }
 if(c.state==='pit-exit'&&pos>EXIT-15&&this.cars.some(o=>o!==c&&o.state==='track'&&Math.abs(o.distance-c.distance)<12))target=8;
 c.lane+=(lane-c.lane)*Math.min(1,dt*3);c.speed+=(target-c.speed)*Math.min(1,dt*1.6);
 let next=c.distance+c.speed*dt;
 const lapBase=Math.floor(Math.max(0,c.distance)/LENGTH)*LENGTH;
 if(c.state==='track'&&c.pitRequested&&!c.pitted&&c.distance<=lapBase+ENTRY&&next>=lapBase+ENTRY){c.state='pit-entry';next=lapBase+ENTRY;this.event(`${c.name} 피트 진입`);}
 if(c.state==='pit-entry'&&next>=lapBase+BOX){next=lapBase+BOX;c.state='service';c.service=0;c.serviceTotal=c.id===0?4.8+this.delay:5.2+c.id*.12;this.event(`${c.name} 정비 시작`);}
 if(c.state==='pit-exit'&&next>=lapBase+EXIT){c.state='track';c.pitRequested=false;this.event(`${c.name} 본선 합류`);}
 c.distance=next;c.tyre=Math.max(.5,c.tyre-dt*.0009);
 if(c.distance>=LENGTH*LAPS){const over=c.distance-LENGTH*LAPS;c.finishTime=this.time-over/Math.max(1,c.speed);c.distance=LENGTH*LAPS;c.speed=0;c.state='finished';this.event(`${c.name} 완주`);}
 }
 this.order=[...this.cars].sort((a,b)=>a.finishTime!==null&&b.finishTime!==null?a.finishTime-b.finishTime:a.finishTime!==null?-1:b.finishTime!==null?1:b.distance-a.distance);
 this.done=this.cars.every(c=>c.finishTime!==null);
 }
 get player(){return this.cars[0];}
 get rank(){return this.order.indexOf(this.player)+1;}
}
// One world-position function drives broadcast and minimap. Pit progress uses the
// same race-distance coordinate as the main route, so no merge-position jump occurs.
export function location(c){const a=c.distance/LENGTH*Math.PI*2;const pit=c.state.startsWith('pit')||c.state==='service';const p=((c.distance%LENGTH)+LENGTH)%LENGTH;const blend=pit?Math.max(0,Math.min(1,(p-ENTRY)/55,(EXIT-p)/55)):0;const r=110-blend*19-c.lane*6;return {x:Math.cos(a)*r,y:0,z:Math.sin(a)*(75-blend*19),heading:Math.atan2(75*Math.cos(a),-110*Math.sin(a)),pit};}
