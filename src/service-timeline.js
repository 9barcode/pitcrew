// One service clock drives the tyres, jack, hands, HUD and release permission.
export const SERVICE_STEPS = [
 {id:'lift',end:.12,label:'차량 들어 올리기',crew:'leo'},
 {id:'loosen',end:.23,label:'휠 너트 해제',crew:'eunchae'},
 {id:'remove',end:.38,label:'기존 타이어 분리',crew:'eunchae'},
 {id:'replace',end:.53,label:'새 타이어 장착',crew:'eunchae'},
 {id:'tighten',end:.68,label:'휠 너트 체결',crew:'eunchae'},
 {id:'inspect',end:.79,label:'기계 점검 · 손 회수',crew:'nari'},
 {id:'lower',end:.90,label:'차량 내리기',crew:'leo'},
 {id:'clear',end:.96,label:'작업 구역 안전 확인',crew:'olivia'},
 {id:'release',end:1,label:'출발 신호',crew:'olivia'},
];
export const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
export const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
export function servicePose(progress){const p=clamp(progress);let start=0;for(const step of SERVICE_STEPS){if(p<=step.end){return {...step,progress:p,t:clamp((p-start)/(step.end-start)),lift:p<.12?smooth(p/.12):p<.79?1:1-smooth((p-.79)/.11),wheelAttached:p<.285||p>=.53,handsClear:p>=.90,releaseAllowed:p>=.96};}start=step.end;}throw Error('Invalid service progress');}
export function roleFrame(id,pose,time=0){const {id:step,t}=pose;
 const cycle=frames=>frames[Math.floor(time*6)%frames.length];
 if(id==='eunchae'){
  if(step==='loosen'||step==='tighten')return t<.18?1:cycle([2,3]);
  if(step==='remove')return t<.45?4:5;
  if(step==='replace')return t<.65?6:4;
  return step==='inspect'?(t<.4?1:7):7;
 }
 if(id==='leo')return step==='lift'?(t<.3?2:t<.65?3:4):step==='lower'?(t<.5?6:2):pose.lift>.01?5:7;
 if(id==='nari')return pose.progress<.14?0:pose.progress<.68?cycle([3,4,5]):pose.progress<.79?(t<.55?6:7):7;
 if(id==='sofia')return cycle([2,3,4,3,5,3]);
 if(id==='olivia')return step==='release'?(t<.4?5:6):step==='clear'?4:3;
 return 0;
}
