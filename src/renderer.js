import {location} from './simulation.js';import {Highlights,TEAM_ASSETS} from './highlights.js';
export class Broadcast {
 constructor(canvas,map){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.map=map;this.mode=0;this.highlights=new Highlights;this.images=TEAM_ASSETS.map(name=>{const im=new Image;im.src=`assets/cars/${name}.webp`;return im;});}
 render(r){const c=this.canvas,g=this.ctx,w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr;}g.setTransform(dpr,0,0,dpr,0,0);const shot=this.highlights.select(r);this.shot=shot;
 const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#7695b2');sky.addColorStop(.55,'#e9d1ab');sky.addColorStop(.56,'#697968');sky.addColorStop(1,'#333e52');g.fillStyle=sky;g.fillRect(0,0,w,h);
 // Side-on TV broadcast: grandstand and barriers scroll, cars keep exact identities.
 g.fillStyle='#34445be0';g.fillRect(0,h*.16,w,h*.25);g.fillStyle='#d4c3a1';g.fillRect(0,h*.15,w,3);
 const travel=shot.kind==='pit'&&r.player.state==='service'?0:r.player.distance;for(let i=0;i<45;i++){const x=((i*w/40-travel*3)% (w+80)+w+80)%(w+80)-40;g.fillStyle=['#dfac68','#a6b0be','#836c7b'][i%3];g.fillRect(x,h*.22,4,3);g.fillStyle='#e5d7be';g.fillRect(x,h*.31,3,2);}
 g.fillStyle='#a1aab4';g.fillRect(0,h*.44,w,h*.07);g.fillStyle='#4a5260';g.fillRect(0,h*.53,w,h*.47);
 for(let i=0;i<16;i++){const x=((i*100-travel*5)%(w+150)+w+150)%(w+150)-100;g.fillStyle=i%2?'#e3ddd0':'#c36658';g.fillRect(x,h*.51,80,4);g.fillStyle='#b8b9b7';g.fillRect(x,h*.88,45,2);}
 let vehicles=shot.ids.map(id=>r.cars[id]);if(shot.kind==='battle')vehicles.sort((a,b)=>a.id===0?1:b.id===0?-1:0);
 for(const car of vehicles){let x,y,size;if(shot.kind==='battle'){const delta=car.distance-r.player.distance;x=w*.43+delta*Math.min(5,w/150);y=h*(car.id===0?.96:.77);size=h*(car.id===0?.58:.48);}else if(shot.kind==='pit'||shot.kind==='finish'){x=w*.48;y=h*.95;size=h*.65;}else{const leader=r.cars[shot.ids[0]];x=w*.75+(car.distance-leader.distance)*Math.min(5,w/180);y=h*(.72+(car.id%3)*.09);size=h*.42;}
 this.drawCar(car,x,y,size,r.time,car.speed);}
 if(shot.kind==='finish'){for(let i=0;i<4;i++)for(let j=0;j<8;j++){g.fillStyle=(i+j)%2?'#fff':'#182333';g.fillRect(w*.7+i*6,h*.48+j*6,6,6);}}
 // The label and result use the same locked opponent ID as the displayed sprites.
 const pass=r.passes.find(p=>shot.ids.includes(p.carId)&&r.time-p.time<2);g.textAlign='right';g.font=`bold ${Math.max(8,Math.min(12,h*.12))}px Arial`;g.fillStyle='#142035dd';g.fillRect(w-230,2,225,19);g.fillStyle='#ffd17b';g.fillText(pass?`${pass.direction==='overtake'?'追越 / 추월':'피추월'} · ${r.cars[pass.carId].name}`:shot.label,w-10,15);
 this.drawMap(r);
 }
 drawCar(car,x,y,height,time,speed){const g=this.ctx,im=this.images[car.id];if(!im.complete||!im.naturalWidth)return;const rowH=im.naturalHeight/3;const frame=speed>1?Math.floor(time*9)%3:0;const width=height*im.naturalWidth/rowH;g.drawImage(im,0,frame*rowH,im.naturalWidth,rowH,x-width/2,y-height,width,height);g.fillStyle='#152033d9';g.fillRect(x-48,y-height-13,96,12);g.font='bold 8px Arial';g.textAlign='center';g.fillStyle=car.color;g.fillText(car.name,x,y-height-4);g.textAlign='left';}
 drawMap(r){const g=this.map.getContext('2d');g.clearRect(0,0,330,150);g.strokeStyle='#8795ad';g.lineWidth=9;g.beginPath();g.ellipse(165,75,129,52,0,0,7);g.stroke();for(const c of [...r.cars].reverse()){const p=location(c),x=165+p.x*1.17,y=75+p.z*.69;g.fillStyle=c.color;g.beginPath();g.arc(x,y,c.id===0?5:3.5,0,7);g.fill();g.font='bold 10px Arial';g.fillText(String(r.order.indexOf(c)+1),x+5,y-5);}}
}
