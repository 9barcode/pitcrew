import {location} from './simulation.js';import {Highlights,TEAM_ASSETS} from './highlights.js';
const load=src=>{const im=new Image;im.src=src;return im;};const ready=im=>im.complete&&im.naturalWidth>0;
export class Broadcast {
 constructor(canvas,map){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.map=map;this.mode=0;this.highlights=new Highlights;this.images=TEAM_ASSETS.map(n=>load(`assets/cars/${n}.webp`));this.angled=TEAM_ASSETS.map(n=>load(`assets/cars/${n}-angle.webp`));this.background=load('assets/broadcast/corner.webp');this.focus=null;this.lastTime=0;this.key='';this.cutAt=0;}
 render(r){const c=this.canvas,g=this.ctx,w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr;}g.setTransform(dpr,0,0,dpr,0,0);const shot=this.highlights.select(r);this.shot=shot;const key=shot.kind+shot.ids.join(',');if(key!==this.key||r.time<this.lastTime){this.cutAt=r.time;this.focus=null;this.key=key;}
 const dt=Math.max(0,Math.min(.1,r.time-this.lastTime));this.lastTime=r.time;
 const age=r.time-this.cutAt;const close=shot.kind==='battle'&&age>2.6&&age<5.6;const zoom=close?1.34:1.16;const moving=r.player.state==='service'?0:r.player.distance;const pan=Math.sin(moving*.012)*w*.045;
 if(ready(this.background)){const im=this.background;const scale=Math.max(w/im.naturalWidth,h/im.naturalHeight)*zoom,iw=im.naturalWidth*scale,ih=im.naturalHeight*scale;g.drawImage(im,(w-iw)/2+pan,(h-ih)*.65,iw,ih);}else{g.fillStyle='#56616d';g.fillRect(0,0,w,h);}
 const cars=shot.ids.map(id=>r.cars[id]);const average=cars.length?cars.reduce((s,c)=>s+c.distance,0)/cars.length:r.player.distance;this.focus=this.focus===null?average:this.focus+(average-this.focus)*(1-Math.exp(-dt*7));
 const layouts=cars.map((car,i)=>{const d=car.distance-this.focus;const lane=car.id===0?1:0;
 if(close){return {car,x:w*.51+d*w*.004,y:h*(lane?.99:.73),height:h*(lane?.72:.56),angled:false};}
 const depth=Math.max(.12,Math.min(.95,.55+d/210));return {car,x:w*(.84-depth*.58)+(lane?w*.055:-w*.035),y:h*(.34+depth*.66)+(lane?h*.06:-h*.035),height:h*(.23+depth*.56),angled:true};});
 layouts.sort((a,b)=>a.y-b.y);for(const v of layouts){this.drawVehicle(g,v,r.time,close);}
 if(shot.kind==='finish'){g.save();g.translate(w*.3,h*.5);g.rotate(-.2);for(let i=0;i<4;i++)for(let j=0;j<6;j++){g.fillStyle=(i+j)%2?'#f2eee2':'#172133';g.fillRect(i*5,j*5,5,5);}g.restore();}
 // Restrained TV graphics outside the action, one label for the locked battle.
 const pass=r.passes.find(p=>shot.ids.includes(p.carId)&&r.time-p.time<2);g.textAlign='right';g.font=`bold ${Math.max(8,Math.min(11,h*.11))}px Arial`;g.fillStyle='#122034d9';g.fillRect(w-230,3,225,19);g.fillStyle='#e8edf4';g.fillText(pass?`${pass.direction==='overtake'?'추월 완료':'피추월'} · ${r.cars[pass.carId].name}`:shot.label,w-10,16);
 g.font='8px Arial';g.fillStyle='#d9e0e8';g.fillText(close?'TELEPHOTO · TRACKING':'TRACKSIDE · CORNER',w-10,h-7);
 const shade=g.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#10203222');shade.addColorStop(.5,'#10203200');shade.addColorStop(1,'#101a2c33');g.fillStyle=shade;g.fillRect(0,0,w,h);this.drawMap(r);this.drawTeamCar();
 }
 drawVehicle(g,v,time,close){const {car,x,y,height,angled}=v;const im=angled?this.angled[car.id]:this.images[car.id];if(!ready(im))return;const sourceH=angled?im.naturalHeight:im.naturalHeight/3;const width=height*im.naturalWidth/sourceH;const frame=0;
 g.save();g.fillStyle='#0e192e55';g.filter='blur(2px)';g.beginPath();g.ellipse(x,y-height*.05,width*.36,height*.055,0,0,7);g.fill();g.filter='none';
 // Minimal fore/aft ghost only in the close tracked shot, never a different team.
 if(close&&car.speed>30){g.globalAlpha=.07;g.drawImage(im,0,frame*sourceH,im.naturalWidth,sourceH,x-width/2-5,y-height,width,height);g.globalAlpha=1;}
 g.drawImage(im,0,frame*sourceH,im.naturalWidth,sourceH,x-width/2,y-height,width,height);g.restore();
 }
 drawTeamCar(){const canvas=document.getElementById('teamCar');if(!canvas)return;const g=canvas.getContext('2d'),im=this.angled[0];g.clearRect(0,0,canvas.width,canvas.height);if(!ready(im))return;const scale=Math.min((canvas.width-20)/im.naturalWidth,(canvas.height-8)/im.naturalHeight);const w=im.naturalWidth*scale,h=im.naturalHeight*scale;g.drawImage(im,(canvas.width-w)/2,(canvas.height-h)/2,w,h);}
 drawMap(r){const g=this.map.getContext('2d');g.clearRect(0,0,330,150);g.strokeStyle='#8795ad';g.lineWidth=9;g.beginPath();g.ellipse(165,75,129,52,0,0,7);g.stroke();for(const c of [...r.cars].reverse()){const p=location(c),x=165+p.x*1.17,y=75+p.z*.69;g.fillStyle=c.color;g.beginPath();g.arc(x,y,c.id===0?5:3.5,0,7);g.fill();g.font='bold 10px Arial';g.fillText(String(r.order.indexOf(c)+1),x+5,y-5);}}
}
