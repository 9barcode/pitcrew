import {BOX,ENTRY,EXIT,LENGTH} from './simulation.js';
// Coordinates are in the approved 1672 × 941 composition, independent of DPR.
export const CREW = [
 {id:'sofia',name:'소피아',role:'전략 분석',x:418,y:234,h:670,layer:'rear'},
 {id:'olivia',name:'올리비아',role:'안전 관리',x:818,y:236,h:660,layer:'rear'},
 {id:'nari',name:'윤나리',role:'기계 점검 · 조정',x:600,y:350,h:330,layer:'rear'},
 {id:'eunchae',name:'고은채',role:'휠 · 타이어',x:248,y:440,h:322,layer:'front'},
 {id:'leo',name:'레오',role:'잭 · 리프트',x:1112,y:343,h:420,layer:'front'},
];
export function garagePhase(car) {
 if(car.state==='pit-entry') return 'ready';
 if(car.state==='service') {const p=Math.min(1,car.service/car.serviceTotal);return p<.13?'lift-up':p<.78?'work':p<.91?'lift-down':'release';}
 if(car.state==='pit-exit') return 'finish';
 return 'idle';
}
export function crewClip(id,phase){
 if(phase==='idle')return 'idle';
 if(phase==='ready')return 'ready';
 if(phase==='finish')return 'success';
 if(id==='leo')return phase==='lift-up'||phase==='lift-down'?'job_loop':'ready';
 if(id==='olivia')return phase==='release'?'job_finish':'ready';
 return phase==='work'?'job_loop':phase==='release'?'job_finish':'ready';
}
export function frameIndex(meta,clip,time,offset=0){const seq=meta.clips[clip]||meta.clips.idle;return seq[Math.floor(Math.max(0,time+offset)*meta.fps)%seq.length];}
const image=src=>new Promise((resolve,reject)=>{const im=new Image;im.onload=()=>resolve(im);im.onerror=()=>reject(Error(`이미지 로딩 실패: ${src}`));im.src=src;});
export class GarageScene{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.assets={};this.loaded=false;this.phase='idle';this.phaseAt=0;this.lastTime=0;this.selected='nari';this.debug=null;this.error=null;this.promise=this.load();}
 async load(){try{await Promise.all(CREW.map(async c=>{const response=await fetch(`assets/characters/${c.id}/work.json`);if(!response.ok)throw Error(`정비 프레임 정보 없음: ${c.id}`);const meta=await response.json();this.assets[c.id]={meta,image:await image(meta.image)};}));this.car=await image('assets/garage/car.webp');this.plate=await image('assets/garage/clean-plate.webp');await document.querySelector('.garage-plate').decode();await document.fonts.load('17px PitCrew');this.loaded=true;document.querySelector('.game').classList.add('garage-ready');}catch(e){this.error=e;document.getElementById('assetStatus').textContent=e.message;throw e;}}
 render(race){if(!this.loaded)return;const canvas=this.canvas,g=this.ctx,ratio=Math.min(devicePixelRatio||1,2),w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}g.setTransform(canvas.width/1672,0,0,canvas.height/941,0,0);g.clearRect(0,0,1672,941);
 const now=this.debug?.time??race.time;const phase=this.debug?.phase??garagePhase(race.player);if(phase!==this.phase||now<this.lastTime){this.phase=phase;this.phaseAt=now;}this.lastTime=now;const age=this.debug?now:now-this.phaseAt;
 // The garage cannot paint over navigation, timing, right panels or portrait cards.
 g.save();g.beginPath();g.moveTo(174,190);g.lineTo(1404,190);g.lineTo(1404,535);g.lineTo(1505,535);g.lineTo(1505,753);g.lineTo(174,753);g.closePath();g.clip();
 const p=race.player;const showCar=this.debug?phase!=='idle':p.state==='service'||p.state.startsWith('pit');
 g.save();if(showCar&&(this.debug||p.state==='service')){g.beginPath();g.rect(0,0,1672,941);g.rect(450,560,790,181);g.clip('evenodd');}
 for(const c of CREW.filter(c=>c.layer==='rear'))this.drawCrew(c,phase,age);g.restore();
 // One authoritative order: rear people -> car -> contact forearms -> front people.
 if(showCar){let dx=0,alpha=1;if(!this.debug&&p.state==='pit-entry'){const remaining=(BOX-p.distance%LENGTH)/(BOX-ENTRY);dx=-Math.max(0,Math.min(1,remaining))*880;}if(!this.debug&&p.state==='pit-exit'){const progress=Math.max(0,Math.min(1,(p.distance%LENGTH-BOX)/(EXIT-BOX)));dx=progress*1100;alpha=1-progress;}
 const lift=phase==='work'?-7:phase==='lift-up'?-7*Math.min(1,age/.45):phase==='lift-down'?-7*(1-Math.min(1,age/.45)):0;
 g.save();g.translate(dx,0);g.globalAlpha=alpha;g.fillStyle='#11182750';g.beginPath();g.ellipse(846,724,380,19,0,0,Math.PI*2);g.fill();g.drawImage(this.car,447,410+lift,788,332);
 // Nari's upper arms/hands rest above the cockpit, never her legs. The contact
 // window follows the same car transform; it is not a duplicate whole person.
 if(this.debug||p.state==='service'){g.save();g.beginPath();g.rect(695,530+lift,271,48);g.clip();this.drawCrew(CREW.find(c=>c.id==='nari'),phase,age);g.restore();}g.restore();}
 for(const c of CREW.filter(c=>c.layer==='front'))this.drawCrew(c,phase,age);
 g.restore();if(this.plate){g.drawImage(this.plate,438,726,1068,34,438,726,1068,34);g.drawImage(this.plate,628,703,412,24,628,703,412,24);}this.drawLabels(phase);canvas.dataset.phase=phase;canvas.dataset.loaded='true';}
 drawCrew(c,phase,time){const {meta,image}=this.assets[c.id];const clip=crewClip(c.id,phase);let f=frameIndex(meta,clip,time,CREW.indexOf(c)*.19);if(c.id==='olivia'){if(phase==='release')f=time<.18?3:time<.42?4:5;else if(phase!=='idle')f=2;}
 const rect=meta.frames[f],width=c.h*rect.w/rect.h;this.ctx.drawImage(image,rect.x,rect.y,rect.w,rect.h,c.x,c.y,width,c.h);}
 drawLabels(phase){const g=this.ctx;const labels=[['eunchae',435,415],['sofia',555,215],['nari',777,308],['olivia',1114,230],['leo',1274,350]];for(const [id,x,y]of labels){const c=CREW.find(c=>c.id===id),active=crewClip(id,phase)==='job_loop'||id==='olivia'&&phase==='release';g.fillStyle='#172132e8';g.strokeStyle=active?'#ffc655':'#a1aab7';g.lineWidth=active?3:1;g.beginPath();g.roundRect(x,y,124,67,9);g.fill();g.stroke();g.fillStyle='#f5f0e5';g.textAlign='center';g.font='bold 17px PitCrew';g.fillText(c.name,x+62,y+23);g.font='13px PitCrew';g.fillText(c.role,x+62,y+42);g.fillStyle=active?'#ffcd5a':'#87d26c';g.fillRect(x+19,y+51,86,6);}}
}
