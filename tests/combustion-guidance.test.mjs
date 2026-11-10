import test from 'node:test';
import assert from 'node:assert/strict';
import {combustionNextAction,solidNextAction,nextPracticeSample} from '../dist/combustion-guidance.js';

test('practice starts after the demonstrated sample and advances only after a full observation',()=>{
 assert.equal(nextPracticeSample('metals',[]),'Mg');
 assert.equal(nextPracticeSample('metals',['Na']),'Mg');
 assert.equal(nextPracticeSample('metals',['Na','Mg']),'Zn');
 assert.equal(nextPracticeSample('metals',['Na','Mg','Zn']),'Cu');
 assert.equal(nextPracticeSample('metals',['Na','Mg','Zn','Cu']),null);
 assert.equal(nextPracticeSample('nonmetals',['S']),'P');
 assert.equal(nextPracticeSample('nonmetals',['S','P']),'C');
 assert.equal(nextPracticeSample('nonmetals',['S','P','C']),null);
});
test('combustion guides sample, heat, bottle, then observation',()=>{
 assert.equal(combustionNextAction({loaded:false}).id,'load');
 assert.equal(combustionNextAction({loaded:true,near:false}).id,'heat');
 assert.equal(combustionNextAction({loaded:true,near:true}).id,'observe');
 assert.equal(combustionNextAction({loaded:true,ignited:true,isMetal:false,inJar:false}).id,'bottle');
 assert.equal(combustionNextAction({loaded:true,ignited:true,isMetal:false,inJar:true}).id,'observe');
 assert.equal(combustionNextAction({loaded:true,ignited:true,isMetal:true}).id,'observe');
});
test('solid route highlights only untested litmus, in either order',()=>{
 assert.equal(solidNextAction({completed:false}).id,'wait');
 assert.equal(solidNextAction({completed:true}).id,'water');
 assert.equal(solidNextAction({completed:true,adding:true}).id,'adding');
 assert.equal(solidNextAction({completed:true,ready:true}).id,'paper-red');
 assert.equal(solidNextAction({completed:true,ready:true,dipped:['red']}).id,'paper-blue');
 assert.equal(solidNextAction({completed:true,ready:true,dipped:['blue']}).id,'paper-red');
 assert.equal(solidNextAction({completed:true,ready:true,dipped:['red','blue']}).id,'complete');
});
