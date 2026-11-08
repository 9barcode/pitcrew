import {BOX,ENTRY,EXIT,LENGTH} from './simulation.js';
import {clamp,smooth,servicePose,roleFrame} from './service-timeline.js';
// One camera, one scale, and fixed floor/contact anchors in the 1672×941 scene.
export const CREW = [
 {id:'sofia',name:'소피아',role:'전략 분석',x:430,y:250,h:450,layer:'rear',head:[.45,.15,.32]},
 {id:'olivia',name:'올리비아',role:'안전 관리',x:972,y:250,h:425,layer:'rear',head:[.45,.16,.34]},
 {id:'nari',name:'윤나리',role:'기계 점검',x:600,y:300,h:330,layer:'rear',head:[.50,.36,.42]},
 {id:'eunchae',name:'고은채',role:'휠 · 타이어',x:300,y:417,h:325,layer:'front',head:[.53,.38,.43]},
 {id:'leo',name:'레오',role:'잭 · 리프트',x:1170,y:367,h:380,layer:'front',head:[.45,.16,.39]},
];
export const CAR={x:447,y:260,w:850,h:500,hub:{x:601,y:557},jack:{x:1035,y:716}};
export function garagePhase(car){if(car.state==='pit-entry')return'ready';if(car.state==='service'){const p=car.service/car.serviceTotal;return p<.12?'lift-up':p<.79?'work':p<.90?'lift-down':'release';}return car.state==='pit-exit'?'finish':'idle';}
export function crewClip(id,phase){if(phase==='idle')return'idle';if(phase==='ready')return'ready';if(phase==='finish')return'success';if(id==='leo')return phase==='lift-up'||phase==='lift-down'?'job_loop':'ready';if(id==='olivia')return phase==='release'?'job_finish':'ready';return phase==='work'?'job_loop':phase==='release'?'job_finish':'ready';}
export function frameIndex(meta,clip,time,offset=0){const seq=meta.clips[clip]||meta.clips.idle;return seq[Math.floor(Math.max(0,time+offset)*meta.fps)%seq.length];}
const image=src=>new Promise((resolve,reject)=>{const im=new Image;im.onload=()=>resolve(im);im.onerror=()=>reject(Error(`이미지 로딩 실패: ${src}`));im.src=src;});
const DEBUG_RANGES={'lift-up':[0,.12],work:[.12,.79],'lift-down':[.79,.90],release:[.90,1]};
export class GarageScene{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.assets={};this.loaded=false;this.phase='idle';this.selected='nari';this.debug=null;this.error=null;this.promise=this.load();}
 async load(){try{await Promise.all(CREW.map(async c=>{const response=await fetch(`assets/characters/${c.id}/service-v2.json`);if(!response.ok)throw Error(`정비 프레임 정보 없음: ${c.id}`);const meta=await response.json();this.assets[c.id]={meta,image:await image(meta.image)};}));this.car=await image('assets/garage/chassis-v2.webp');this.wheel=await image('assets/garage/front-wheel-v2.webp');this.plate=await image('assets/garage/clean-plate.webp');await document.fonts.load('17px PitCrew');await document.fonts.ready;this.loaded=true;this.drawPortraits();}catch(e){this.error=e;document.getElementById('assetStatus').textContent=e.message;throw e;}}
 drawPortraits(){for(const el of document.querySelectorAll('[data-portrait]')){const c=CREW.find(c=>c.id===el.dataset.portrait),a=this.assets[c.id],f=a.meta.frames[0],g=el.getContext('2d');const [cx,cy,size]=c.head;const sw=f.w*size,sh=sw*el.height/el.width;g.clearRect(0,0,el.width,el.height);g.drawImage(a.image,f.x+cx*f.w-sw/2,f.y+cy*f.h-sh/2,sw,sh,0,0,el.width,el.height);}}
 frameFor(c,phase,pose,time){if(pose)return roleFrame(c.id,pose,time);if(phase==='ready')return c.id==='olivia'?3:0;if(phase==='finish')return c.id==='olivia'?6:7;return Math.floor(time*8+CREW.indexOf(c)*7)%65===25?1:0;}
 drawCrew(c,frame,part='body'){const {meta,image}=this.assets[c.id],f=meta.frames[frame],g=this.ctx,w=c.h*f.w/f.h;g.save();if(part==='arm'){
 // Anatomical forearm contour, not a rectangular hole in a whole character.
 // Only the sleeve/forearm/fingers cross above the cockpit; the torso stays behind.
 const contours={3:[[.48,.49],[.66,.50],[.99,.53],[1,.74],[.67,.74],[.48,.63]],4:[[.48,.50],[.68,.51],[1,.56],[1,.74],[.69,.75],[.48,.65]],5:[[.48,.50],[.69,.52],[1,.56],[1,.75],[.69,.75],[.48,.65]]};
 const points=contours[frame];if(!points){g.restore();return;}g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(c.x+x*w,c.y+y*c.h):g.moveTo(c.x+x*w,c.y+y*c.h));g.closePath();g.clip();}
 g.drawImage(image,f.x,f.y,f.w,f.h,c.x,c.y,w,c.h);g.restore();}
 shadow(x,y,rx,ry,alpha=.25){const g=this.ctx;g.save();g.translate(x,y);g.scale(rx,ry);const fill=g.createRadialGradient(0,0,0,0,0,1);fill.addColorStop(0,`rgba(14,18,26,${alpha})`);fill.addColorStop(1,'rgba(14,18,26,0)');g.fillStyle=fill;g.fillRect(-1,-1,2,2);g.restore();}
 render(race){if(!this.loaded)return;const canvas=this.canvas,g=this.ctx,ratio=Math.min(devicePixelRatio||1,2),w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}g.setTransform(canvas.width/1672,0,0,canvas.height/941,0,0);g.clearRect(0,0,1672,941);
 const time=this.debug?.time??race.time,phase=this.debug?.phase??garagePhase(race.player);this.phase=phase;let progress=null;
 if(this.debug&&DEBUG_RANGES[phase]){const [a,b]=DEBUG_RANGES[phase];progress=a+(b-a)*clamp(time/4.8);}else if(!this.debug&&race.player.state==='service')progress=clamp(race.player.service/race.player.serviceTotal);
 const pose=progress===null?null:servicePose(progress);this.pose=pose;
 g.save();g.beginPath();g.rect(174,185,1240,572);g.clip();
 // Sample only the clean artwork, never the reference image's baked UI.
 g.drawImage(this.plate,438,190,965,511,174,185,1240,572);
 const floor=g.createLinearGradient(0,660,0,765);floor.addColorStop(0,'#17203000');floor.addColorStop(1,'#17203080');g.fillStyle=floor;g.fillRect(174,660,1240,105);
 for(const c of CREW){const standing=c.layer==='rear'&&c.id!=='nari';this.shadow(c.x+c.h*.48,c.y+c.h*.98,standing?48:68,10,.28);}
 const frames=Object.fromEntries(CREW.map(c=>[c.id,this.frameFor(c,phase,pose,time)]));
 for(const c of CREW.filter(c=>c.layer==='rear'))this.drawCrew(c,frames[c.id]);
 const showCar=this.debug?phase!=='idle':race.player.state==='service'||race.player.state.startsWith('pit');
 if(showCar){let x=0,y=0,scale=1;const p=race.player;
 // The car faces down-left: arrive from the back-right and depart forwards.
 if(!this.debug&&p.state==='pit-entry'){const t=smooth((p.distance%LENGTH-ENTRY)/(BOX-ENTRY));x=(1-t)*970;y=-(1-t)*190;scale=.84+.16*t;}
 if(!this.debug&&p.state==='pit-exit'){const t=smooth((p.distance%LENGTH-BOX)/(EXIT-BOX));x=-t*1350;y=t*250;scale=1+.12*t;}
 g.save();g.translate(CAR.x+x,CAR.y+y);g.scale(scale,scale);g.translate(-CAR.x,-CAR.y);this.shadow(845,690,330,30,.23);this.shadow(1108,690,65,12,.45);this.shadow(1252,631,42,9,.37);if(!pose||pose.wheelAttached)this.shadow(573,653,52,10,.4);const lift=(pose?.lift??0)*10;g.drawImage(this.car,CAR.x,CAR.y-lift,CAR.w,CAR.w*this.car.height/this.car.width);this.drawWheel(pose,lift);g.restore();
 if(pose){const c=CREW.find(c=>c.id==='nari');this.drawCrew(c,frames.nari,'arm');}
 }
 if(pose)this.drawJack(pose,frames.leo);
 for(const c of CREW.filter(c=>c.layer==='front'))this.drawCrew(c,frames[c.id]);
 g.restore();this.drawLabels(phase,pose);canvas.dataset.phase=phase;canvas.dataset.loaded='true';canvas.dataset.step=pose?.id??phase;}
 drawWheel(pose,lift){
 const g=this.ctx;
 // Keep the wheel's axle anchor and scale identical while it is detached.
 const draw=(x,y)=>{const w=240,h=w*this.wheel.height/this.wheel.width;g.drawImage(this.wheel,x-w*.662,y-h*.536,w,h);};
 const hub={x:CAR.hub.x,y:CAR.hub.y-lift};
 if(!pose){draw(hub.x,hub.y);return;}
 const pull={x:hub.x-64,y:hub.y+23};
 const parked={x:505,y:650};
 const between=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
 if(pose.id==='remove'){
  const point=pose.t<.65?between(hub,pull,smooth(pose.t/.65)):between(pull,parked,smooth((pose.t-.65)/.35));
  this.shadow(point.x-25,point.y+91,48,9,.28);draw(point.x,point.y);return;
 }
 if(pose.id==='replace'){
  const point=between(parked,hub,smooth(pose.t));
  this.shadow(point.x-25,point.y+91,48,9,.28);draw(point.x,point.y);return;
 }
 draw(hub.x,hub.y);
 // Used tyres are not drawn a second time in front of the mechanic's knees.
 }
 drawJack(pose,frame){const g=this.ctx,c=CREW.find(c=>c.id==='leo');const anchors={2:[.23,.61],3:[.25,.67],4:[.20,.72],5:[.20,.72],6:[.25,.66],7:[.38,.56]};const hand=anchors[frame]||anchors[7];const hx=c.x+hand[0]*c.h,hy=c.y+hand[1]*c.h;
 const deployed=pose.progress<.90;if(!deployed)return;
 const x=CAR.jack.x,y=CAR.jack.y;this.shadow(x+25,y+3,60,10,.35);
 g.save();g.lineJoin='round';g.lineCap='round';g.fillStyle='#263044';g.strokeStyle='#a0a4ae';g.lineWidth=2;g.beginPath();g.moveTo(x-23,y);g.lineTo(x+38,y-9);g.lineTo(x+66,y+3);g.lineTo(x+1,y+13);g.closePath();g.fill();g.stroke();
 g.fillStyle='#151e2c';for(const [wx,wy]of [[x-15,y+7],[x+51,y+5]]){g.beginPath();g.ellipse(wx,wy,10,7,-.15,0,Math.PI*2);g.fill();}
 const shaft=g.createLinearGradient(x,y-8,hx,hy);shaft.addColorStop(0,'#82613b');shaft.addColorStop(.5,'#ffd582');shaft.addColorStop(1,'#b98434');g.strokeStyle='#172130';g.lineWidth=12;g.beginPath();g.moveTo(x+20,y-5);g.lineTo(hx,hy);g.stroke();g.strokeStyle=shaft;g.lineWidth=8;g.stroke();g.strokeStyle='#272d3a';g.lineWidth=13;g.beginPath();g.moveTo(hx-10,hy+4);g.lineTo(hx+14,hy-5);g.stroke();g.fillStyle='#555e6a';g.fillRect(x-10,y-18-pose.lift*10,37,8);g.restore();
 }
 drawLabels(phase,pose){const g=this.ctx;const positions={sofia:[504,252],olivia:[1070,247],nari:[756,302],eunchae:[548,425],leo:[1264,354]};for(const c of CREW){const active=pose?.crew===c.id,selected=this.selected===c.id;if(!active&&!selected)continue;const [x,y]=positions[c.id],label=active?`${c.name} · ${pose.label}`:`${c.name} · ${c.role}`;g.font='500 14px PitCrew';const width=g.measureText(label).width+24;g.fillStyle='#172234ed';g.strokeStyle=active?'#f0bd65':'#c3b3a0';g.lineWidth=1;g.beginPath();g.roundRect(x-width/2,y,width,29,6);g.fill();g.stroke();g.fillStyle=active?'#ffe0a0':'#ece5dc';g.textAlign='center';g.fillText(label,x,y+20);}}
}
