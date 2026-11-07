import {location,LENGTH,cockpitCars} from './simulation.js';
export class Broadcast {
 constructor(canvas,map){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.map=map;this.mode=0;}
 render(race){const c=this.canvas,g=this.ctx,w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr;}g.setTransform(dpr,0,0,dpr,0,0);
 const p=race.player,horizon=h*.30,curve=Math.sin(p.distance/LENGTH*Math.PI*2)*.11;
 const sky=g.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#719bb9');sky.addColorStop(1,'#e4d9ba');g.fillStyle=sky;g.fillRect(0,0,w,h);
 // Hand-drawn flat bands and silhouettes, with no mesh or polygonal vehicle models.
 g.fillStyle='#e9e6d7';for(let i=0;i<5;i++){g.beginPath();g.ellipse(w*(i*.26+.08),h*.1,45+i*6,8,0,0,7);g.fill();}
 g.fillStyle='#718d85';g.beginPath();g.moveTo(0,horizon);for(let i=0;i<=20;i++)g.lineTo(i*w/20,horizon-12-Math.sin(i*1.6)*7);g.lineTo(w,h);g.lineTo(0,h);g.fill();
 const road=(depth,lane=0)=>{const width=w*(.035+depth*.63),bend=curve*w*(1-depth)**2;return {x:w*.5+bend+lane*width,y:horizon+(h-horizon)*depth,width};};
 // Road scenery is keyed to the same distance as vehicle motion; it stops in service.
 for(let i=0;i<55;i++){const a=i/55,b=(i+1)/55,A=road(a),B=road(b);g.fillStyle=(Math.floor(p.distance/8+i/3)%2)?'#4d5966':'#505d69';this.poly([[A.x-A.width,A.y],[A.x+A.width,A.y],[B.x+B.width,B.y],[B.x-B.width,B.y]],g.fillStyle);
 for(const side of [-1,1]){this.poly([[A.x+side*A.width,A.y],[A.x+side*A.width*1.055,A.y],[B.x+side*B.width*1.055,B.y],[B.x+side*B.width,B.y]],Math.floor(p.distance/6+i/2)%2?'#dfd7c7':'#bc504d');this.poly([[A.x+side*A.width*1.08,A.y],[A.x+side*A.width*1.18,A.y-4-a*14],[B.x+side*B.width*1.18,B.y-4-b*14],[B.x+side*B.width*1.08,B.y]],'#9fa9a7');}
 if((Math.floor(p.distance/10+i/3)%3)===0)this.poly([[A.x-1-a*2,A.y],[A.x+1+a*2,A.y],[B.x+1+b*2,B.y],[B.x-1-b*2,B.y]],'#b6bcb8');
 }
 // Illustrated grandstands above the barrier.
 for(const side of [-1,1]){g.save();g.translate(side<0?0:w,horizon-6);g.scale(side<0?1:-1,1);this.poly([[0,-35],[w*.22,-10],[w*.22,6],[0,10]],'#4e6777');this.poly([[0,-40],[w*.24,-12],[w*.22,-7],[0,-28]],'#e3d5ac');for(let i=0;i<40;i++){g.fillStyle=['#c98b68','#e3c56c','#57677e'][i%3];g.fillRect((i%14)*w*.015,Math.floor(i/14)*5-20,3,3);}g.restore();}
 const cars=cockpitCars(race);for(const item of cars){const {car,gap,relativeLane}=item;const depth=gap>=0?1/(1+gap/(this.mode?32:47)):1+(-gap)/35;const A=road(Math.min(depth,1.35));const lane=relativeLane*.65+(gap<12&&Math.abs(relativeLane)<.15?(car.id%2?-.62:.62):0);const x=A.x+lane*A.width,y=A.y;const scale=Math.min(2.3,depth*1.6)*(h/300);this.car(x,y,scale,car,gap,race.order.indexOf(car)+1);}
 // Own front wheels, nose and halo establish the team driver's viewpoint.
 const wheelY=h*.88;g.fillStyle='#17212d';g.beginPath();g.ellipse(w*.17,wheelY,w*.065,h*.20,-.12,0,7);g.fill();g.beginPath();g.ellipse(w*.83,wheelY,w*.065,h*.20,.12,0,7);g.fill();
 this.poly([[w*.38,h],[w*.46,h*.70],[w*.54,h*.70],[w*.62,h]],'#dc9632');this.poly([[w*.43,h],[w*.48,h*.73],[w*.52,h*.73],[w*.57,h]],'#ffd270');
 g.strokeStyle='#172437';g.lineWidth=h*.035;g.lineCap='round';g.beginPath();g.moveTo(w*.31,h);g.bezierCurveTo(w*.30,h*.67,w*.70,h*.67,w*.69,h);g.stroke();g.beginPath();g.moveTo(w*.5,h*.74);g.lineTo(w*.5,h*.98);g.stroke();
 g.fillStyle='#1a2639';g.fillRect(w*.39,h*.88,w*.22,h*.10);g.fillStyle='#ffcf68';g.font=`bold ${Math.max(11,h*.045)}px monospace`;g.textAlign='center';g.fillText(`${Math.round(p.speed*3.6)} km/h   P${race.rank}`,w*.5,h*.95);
 g.textAlign='left';g.fillStyle='#172437d9';g.fillRect(12,12,235,27);g.fillStyle='#ffd273';g.font='bold 11px Arial';g.fillText('DRIVER CAM · #27 앰버 폭스',22,30);
 const pass=race.passes[0];if(pass&&race.time-pass.time<2.5){const o=race.cars.find(c=>c.id===pass.carId);g.fillStyle='#1b293be6';g.fillRect(w/2-125,44,250,30);g.textAlign='center';g.fillStyle=o.color;g.fillText(`${pass.direction==='overtake'?'추월 완료':'추월 허용'} · ${o.name}`,w/2,64);g.textAlign='left';}
 if(p.state!=='track'){g.fillStyle='#172437ca';g.fillRect(w/2-110,h*.4,220,38);g.fillStyle='#ffd273';g.textAlign='center';g.fillText(p.state==='service'?'PIT BOX · 정비 중':p.state==='finished'?'CHEQUERED FLAG':'PIT LANE · 제한 속도',w/2,h*.4+24);g.textAlign='left';}
 this.drawMap(race);
 }
 poly(points,color){const g=this.ctx;g.fillStyle=color;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
 car(x,y,s,car,gap,rank){const g=this.ctx;g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='#18233055';g.beginPath();g.ellipse(0,4,40,8,0,0,7);g.fill();
 for(const side of [-1,1]){g.fillStyle='#19222d';g.beginPath();g.roundRect(side*30-9,-31,18,36,6);g.fill();g.strokeStyle='#47515a';g.lineWidth=2;g.stroke();g.fillStyle='#e7e7d930';g.fillRect(side*30-6,-26,3,24);}
 this.poly([[-23,-5],[-17,-37],[-10,-49],[10,-49],[17,-37],[23,-5]],car.color);this.poly([[-9,-8],[-6,-44],[0,-49],[6,-44],[9,-8]],'#1d2b3d');g.fillStyle='#273849';g.beginPath();g.ellipse(0,-44,8,7,0,0,7);g.fill();g.fillStyle='#e6d9bd';g.beginPath();g.arc(0,-49,5,0,7);g.fill();g.fillStyle=car.color;g.beginPath();g.roundRect(-39,-26,78,10,3);g.fill();g.strokeStyle='#263343';g.lineWidth=2;g.stroke();g.fillStyle='#192737';g.fillRect(-28,-23,56,4);g.fillStyle='#f5eddb';g.font='bold 6px Arial';g.textAlign='center';g.fillText(car.name,0,-18);g.restore();
 if(gap>-7){g.font='bold 10px Arial';g.textAlign='center';g.fillStyle='#142134df';g.fillRect(x-65,y-65*s-16,130,18);g.fillStyle=car.color;g.fillText(`P${rank} ${car.name}`,x,y-65*s-3);g.textAlign='left';}}
 drawMap(r){const g=this.map.getContext('2d');g.clearRect(0,0,330,150);g.strokeStyle='#697990';g.lineWidth=9;g.beginPath();g.ellipse(165,75,129,52,0,0,Math.PI*2);g.stroke();for(const c of [...r.cars].reverse()){const p=location(c),x=165+p.x*1.17,y=75+p.z*.69;g.fillStyle=c.color;g.beginPath();g.arc(x,y,c.id===0?5:3.5,0,7);g.fill();g.font='bold 9px Arial';g.fillText(String(r.order.indexOf(c)+1),x+5,y-5);}g.fillStyle='#9baac0';g.font='10px Arial';g.fillText('LIVE POSITION',126,79);}
}
