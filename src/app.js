import {servicePose} from './service-timeline.js';
import {GarageScene} from './garage-scene.js';
import {createOvertakeDemo} from './overtake-animation.js';
import {Race,LENGTH,LAPS} from './simulation.js';import {Broadcast} from './renderer.js';
const $=id=>document.getElementById(id),view=new Broadcast($('race'),$('map'));let race=new Race,paused=false,speed=1,acc=0,last=0,uiClock=0,resultShown=false;
const garage=new GarageScene($('garage')); garage.promise.then(()=>{$('assetStatus').textContent='';}).catch(()=>{});
let debugPlaying=false,debugTime=0;
$('debugPhase').onchange=()=>{const phase=$('debugPhase').value;debugTime=0;garage.debug=phase==='live'?null:{phase,time:0};};
$('debugTime').oninput=()=>{debugTime=Number($('debugTime').value);if(garage.debug)garage.debug.time=debugTime;};
$('debugPlay').onclick=()=>{debugPlaying=!debugPlaying;$('debugPlay').textContent=debugPlaying?'프레임 멈춤':'프레임 재생';};
$('garageDemo').onclick=()=>{reset();race.player.distance=1349;race.player.state='pit-entry';race.player.pitRequested=true;speed=1;$('speed').textContent='속도 ×1';};
const format=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${(t%60).toFixed(2).padStart(5,'0')}`;
function reset(){garage.debug=null;$('debugPhase').value='live';race=new Race;paused=false;resultShown=false;acc=0;$('result').hidden=true;$('pause').textContent='일시정지';$('stageAuto').textContent='일시정지';update();}
$('stageSpeed').onclick=()=>$('speed').click();$('stageAuto').onclick=()=>$('pause').click();
$('raceAction').onclick=()=>{reset();speed=1;$('speed').textContent='속도 ×1';};
$('demo').onclick=()=>{reset();race=createOvertakeDemo();speed=1;$('speed').textContent='속도 ×1';update();};$('restart').onclick=reset;$('again').onclick=reset;$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'계속하기':'일시정지';$('stageAuto').textContent=paused?'▶ 재생':'일시정지';};$('speed').onclick=()=>{speed=speed===4?1:speed*2;$('speed').textContent=`속도 ×${speed}`;};$('camera').onclick=()=>{view.highlights.targetId=null;$('camera').textContent='자동 하이라이트';};$('pit').onclick=()=>{race.requestPit();update();};$('delay').onclick=()=>{race.addDelay();update();};
function update(){$('stageSpeed').textContent=`▶ ×${speed}`;const c=race.player,lead=race.order[0];$('clock').textContent=format(race.time);$('lap').textContent=`LAP ${Math.min(LAPS,Math.floor(Math.max(0,c.distance)/LENGTH)+1)} / ${LAPS}`;$('rank').textContent=race.rank;
 const state={track:'본선 주행', 'pit-entry':'피트 진입 중',service:'피트 정비 중','pit-exit':'본선 합류 중',finished:'완주'}[c.state];$('raceState').textContent=`앰버 폭스 · ${state} · ${Math.round(c.speed*3.6)} km/h`;$('pitLabel').textContent=state;
 $('nextPitLabel').textContent=c.pitted?'의무 피트 완료':'다음 피트 · LAP 2';$('standings').innerHTML=race.order.map((o,i)=>{const gap=o===lead?'LEADER':o.finishTime!==null&&lead.finishTime!==null?`+${(o.finishTime-lead.finishTime).toFixed(2)}s`:`+${((lead.distance-o.distance)/Math.max(40,lead.speed)).toFixed(2)}s`;return `<div class="row ${o.id===0?'player':''}"><b>${i+1}</b><span>${o.name}</span><small>${o.state==='service'?'PIT':o.state==='finished'?'FIN':gap}</small></div>`;}).join('');
 const preview=garage.debug&&garage.pose;const servicing=!!preview||c.state==='service';const p=preview?preview.progress:c.state==='service'?Math.min(1,c.service/c.serviceTotal):c.pitted?1:0;
 let stage='피트 대기';if(servicing){const task=servicePose(p);stage=task.label;}else if(c.state!=='track')stage=state;else if(c.pitted)stage='정비 완료 · 레이스 진행';
 $('stage').textContent=stage;$('serviceClock').textContent=servicing?`${(preview?p*4.8:c.service).toFixed(2)} / ${(preview?4.8:c.serviceTotal).toFixed(2)} SEC`:c.pitted?`PIT RECORD · ${c.serviceTotal.toFixed(2)} SEC`:c.pitRequested?'PIT REQUEST CONFIRMED':'NEXT PIT · LAP 2';$('serviceBar').style.width=`${p*100}%`;
 const idx=c.state==='pit-entry'?0:servicing?p<.12?1:p<.79?2:3:c.pitted?4:-1;$('steps').innerHTML=['피트인','리프트 업','정비 작업','안전 확인','피트아웃'].map((s,i)=>`<span class="${i===idx?'current':''}">${i<idx?'✓':'○'} ${s}</span>`).join('');
 const values=[Math.min(1,Math.max(0,(p-.12)/.56)),p>0?1:0,Math.min(1,Math.max(0,(p-.12)/.565)),Math.min(1,p/.79),Math.max(0,(p-.90)/.10)];values.forEach((v,i)=>$('crew'+i).value=v);
 $('pit').disabled=c.pitRequested||c.pitted||c.state!=='track'||race.done;$('pit').textContent=c.pitted?'의무 피트 완료':c.pitRequested?'피트 진입 예약됨':'다음 피트 진입 예약';$('delay').disabled=c.pitted||race.done;$('delayInfo').textContent=`추가 지연 ${race.delay.toFixed(0)}초 · 중앙 정비와 상단 주행이 연결됩니다.`;$('pitRecord').textContent=c.pitted?`정비 기록 ${c.serviceTotal.toFixed(2)}초`:`정비 예정 ${(4.8+race.delay).toFixed(2)}초`;
 $('events').textContent=race.events.slice(0,2).map(e=>`${format(e.time)} ${e.text}`).join('  /  ')||'그리드 출발 · 모든 팀 의무 피트 1회';
 if(race.done&&!resultShown){resultShown=true;$('result').hidden=false;$('resultTitle').textContent=`최종 ${race.rank}위`;$('resultText').textContent=`완주 ${format(c.finishTime)} · 피트 정비 ${c.serviceTotal.toFixed(2)}초 · 추가 지연 ${race.delay}초`;$('resultList').innerHTML=race.order.map((o,i)=>`<div class="row ${o.id===0?'player':''}"><b>${i+1}</b><span>${o.name}</span><small>${format(o.finishTime)}</small></div>`).join('');}
}
function frame(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;if(!paused){acc+=dt*speed;while(acc>=1/60){race.step(1/60);acc-=1/60;}}view.render(race);if(debugPlaying&&garage.debug){debugTime=(debugTime+dt)%4.8;garage.debug.time=debugTime;$('debugTime').value=debugTime;}garage.render(race);uiClock+=dt;if(uiClock>=.1){update();uiClock=0;}requestAnimationFrame(frame);}update();requestAnimationFrame(frame);

for(const card of document.querySelectorAll('[data-crew]'))card.onclick=()=>{garage.selected=card.dataset.crew;document.querySelectorAll('[data-crew]').forEach(el=>el.classList.toggle('selected',el===card));const label=$('selectionLabel');label.textContent=card.querySelector('.crew-name').textContent+' · '+card.querySelector('.crew-role').textContent;label.classList.add('show');clearTimeout(window.selectionTimer);window.selectionTimer=setTimeout(()=>label.classList.remove('show'),1800);};
$('rosterNav').onclick=()=>document.querySelector('[data-crew="'+garage.selected+'"]').focus();
