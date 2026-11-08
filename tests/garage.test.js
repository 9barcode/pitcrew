import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {garagePhase,crewClip,frameIndex,CREW} from '../src/garage-scene.js';
import {Race} from '../src/simulation.js';
test('garage follows actual service progression and each role acts at the correct time',()=>{
 const race=new Race;let stages=new Set;for(let i=0;i<30000&&!race.done;i++){race.step(1/60);stages.add(garagePhase(race.player));}
 assert.deepEqual([...stages],['idle','ready','lift-up','work','lift-down','release','finish']);
 assert.equal(crewClip('leo','lift-up'),'job_loop');assert.equal(crewClip('nari','work'),'job_loop');assert.equal(crewClip('eunchae','work'),'job_loop');assert.equal(crewClip('olivia','work'),'ready');assert.equal(crewClip('olivia','release'),'job_finish');
});
test('all five independent frame atlases have valid equal-size stable rectangles',async()=>{
 for(const crew of CREW){const m=JSON.parse(await readFile(new URL(`../assets/characters/${crew.id}/work.json`,import.meta.url)));assert.equal(m.frames.length,6);const bytes=await readFile(new URL('../'+m.image,import.meta.url));assert.equal(bytes.toString('ascii',0,4),'RIFF');for(const f of m.frames){assert.equal(f.w,m.frames[0].w);assert.equal(f.h,m.frames[0].h);assert.ok(f.x>=0&&f.y>=0);}
 for(const clip of Object.keys(m.clips)){for(let t=0;t<10;t+=.03){const f=frameIndex(m,clip,t);assert.ok(f>=0&&f<6);}}
 assert.notEqual(frameIndex(m,'job_loop',0),frameIndex(m,'job_loop',.2));
 }
});
