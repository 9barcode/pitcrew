import {location,LENGTH,ENTRY,EXIT} from './simulation.js';
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)};
export class Broadcast {
 constructor(canvas,map){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.map=map;this.mode=0;}
 render(race){const c=this.canvas,ctx=this.ctx,w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr;}ctx.setTransform(dpr,0,0,dpr,0,0);
 const p=location(race.player),a=race.player.distance/LENGTH*Math.PI*2,t=[-Math.sin(a),0,Math.cos(a)];
 const eye=this.mode===1?[155,190,190]:[p.x-t[0]*62+Math.cos(a)*46,48,p.z-t[2]*62+Math.sin(a)*46];
 const look=this.mode===1?[0,0,0]:[p.x+t[0]*22,0,p.z+t[2]*22];const forward=norm(sub(look,eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward),f=h*1.1;
 const project=v=>{const d=sub(v,eye),z=dot(d,forward);return z<2?null:[w/2+dot(d,right)*f/z,h*.51-dot(d,up)*f/z,z]};
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#99b8c9');sky.addColorStop(1,'#d2d9d1');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);const faces=[];
 const face=(v,color)=>{const ps=v.map(project);if(ps.some(p=>!p))return;faces.push({ps,color,z:ps.reduce((s,p)=>s+p[2],0)/ps.length});};
 face([[-400,-.4,-400],[400,-.4,-400],[400,-.4,400],[-400,-.4,400]],'#5b7761');
 const at=(theta,rx,rz,y=.05)=>[Math.cos(theta)*rx,y,Math.sin(theta)*rz];
 for(let i=0;i<160;i++){const a=i/160*Math.PI*2,b=(i+1)/160*Math.PI*2;
 face([at(a,119,84),at(b,119,84),at(b,101,66),at(a,101,66)],'#424b54');
 face([at(a,121,86),at(b,121,86),at(b,119,84),at(a,119,84)],i%4<2?'#ec645b':'#edf0e9');
 face([at(a,101,66),at(b,101,66),at(b,99,64),at(a,99,64)],i%4<2?'#ec645b':'#edf0e9');
 if(i%5===0)face([at(a,110.2,75.2),at(b,110.2,75.2),at(b,109.8,74.8),at(a,109.8,74.8)],'#adb7b5');
 }
 for(let i=0;i<44;i++){const d=ENTRY+(EXIT-ENTRY)*i/44,e=ENTRY+(EXIT-ENTRY)*(i+1)/44;const fake=x=>location({distance:x,state:'pit-entry',lane:0});const q=fake(d),z=fake(e);face([[q.x-3,.1,q.z-3],[z.x-3,.1,z.z-3],[z.x+3,.1,z.z+3],[q.x+3,.1,q.z+3]],'#818b93');}
 const box=(x,y,z,sx,sy,sz,col,angle=0)=>{const cs=Math.cos(angle),sn=Math.sin(angle),pt=(a,b,d)=>[x+a*cs-d*sn,y+b,z+a*sn+d*cs];const v=[pt(-sx,0,-sz),pt(sx,0,-sz),pt(sx,0,sz),pt(-sx,0,sz),pt(-sx,sy,-sz),pt(sx,sy,-sz),pt(sx,sy,sz),pt(-sx,sy,sz)];face([v[0],v[1],v[5],v[4]],col);face([v[1],v[2],v[6],v[5]],col);face([v[2],v[3],v[7],v[6]],col);face([v[3],v[0],v[4],v[7]],col);face([v[4],v[5],v[6],v[7]],col);};
 for(let i=0;i<12;i++){box(-100+i*18,0,-105,7,7,4,i%2?'#505c70':'#9d9d94');box(-95+i*18,0,105,8,5,6,'#777f8b');}
 box(-30,0,-50,18,8,9,'#c5b79b');box(-30,8,-50,19,.7,10,'#e2ac49');
 for(const car of race.cars){const p=location(car),rot=p.heading-Math.PI/2;const cs=Math.cos(rot),sn=Math.sin(rot);const part=(x,y,z,sx,sy,sz,color)=>box(p.x+x*cs-z*sn,y,p.z+x*sn+z*cs,sx,sy,sz,color,rot);
 part(0,0,0,2.3,.12,5,'#293137');part(0,.4,0,1.05,1.05,4,car.color);part(0,1.45,-.4,.65,.6,.9,'#172536');part(0,.5,4,2.2,.2,.6,car.color);part(0,1.5,-3.6,2.1,.2,.5,car.color);
 for(const x of [-1.8,1.8])for(const z of [-2.6,2.6])part(x,.2,z,.6,1,1,'#1d2430');
 }
 faces.sort((a,b)=>b.z-a.z);for(const f of faces){ctx.fillStyle=f.color;ctx.beginPath();f.ps.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();}
 const pp=project([p.x,6,p.z]);if(pp){ctx.fillStyle='#ffc14c';ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillText(`▼ AF · P${race.rank}`,pp[0],pp[1]);}
 ctx.textAlign='left';ctx.fillStyle='#182436b0';ctx.fillRect(14,12,128,25);ctx.fillStyle='#fff';ctx.font='11px Arial';ctx.fillText(this.mode?'CIRCUIT CAM / 01':'TEAM TRACKING / 27',23,29);
 this.drawMap(race);
 }
 drawMap(r){const ctx=this.map.getContext('2d');ctx.clearRect(0,0,330,150);ctx.strokeStyle='#697990';ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(165,75,129,52,0,0,Math.PI*2);ctx.stroke();for(const c of [...r.cars].reverse()){const p=location(c);ctx.fillStyle=c.color;ctx.beginPath();ctx.arc(165+p.x*1.17,75+p.z*.69,c.id===0?5:3.5,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#9baac0';ctx.font='10px Arial';ctx.fillText('LIVE POSITION',126,79);}
}
