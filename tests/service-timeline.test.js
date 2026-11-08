import test from 'node:test';
import assert from 'node:assert/strict';
import {servicePose,roleFrame} from '../src/service-timeline.js';
test('tyre replacement remains lifted and release waits for all hands to clear',()=>{
 for(let p=0;p<=1;p+=.001){const s=servicePose(p);if(!s.wheelAttached)assert.equal(s.lift,1);if(s.releaseAllowed){assert.equal(s.handsClear,true);assert.equal(s.lift,0);assert.equal(s.wheelAttached,true);}for(const id of ['eunchae','leo','nari','sofia','olivia'])assert.ok(roleFrame(id,s,p*4.8)>=0&&roleFrame(id,s,p*4.8)<8);}
 assert.equal(servicePose(.30).id,'remove');assert.equal(servicePose(.46).id,'replace');assert.equal(servicePose(.60).id,'tighten');
 assert.equal(roleFrame('eunchae',servicePose(.94)),7);
});
