import test from 'node:test';
import assert from 'node:assert/strict';
import {activityRecordsMarkup} from '../dist/activity-records.js';
import {activitySamples,metalConditions,restoreActivityRecords} from '../dist/metal-activity-model.js';

const row=(html,symbol)=>html.match(new RegExp('<tr data-activity-record="'+symbol+'">([\\s\\S]*?)</tr>'))?.[1];
test('activity table lists every sample and condition before operation, without revealing untested results',()=>{
 const html=activityRecordsMarkup();
 assert.equal((html.match(/data-activity-record=/g)||[]).length,activitySamples.length);
 assert.equal((html.match(/尚未測試/g)||[]).length,activitySamples.length*metalConditions.length);
 assert.doesNotMatch(html,/data-record-result=/);
 assert.doesNotMatch(html,/data-activity-record="H"/);
});
test('only performed trials reveal their actual observations, including carbon and platinum exceptions',()=>{
 const trials=[{symbol:'Na',condition:'cold'},{symbol:'C',condition:'dilute'},{symbol:'Pt',condition:'concentrated'},{symbol:'Pt',condition:'aqua'}];
 const restored=restoreActivityRecords({activityRecords:[...trials,trials[0],{symbol:'H',condition:'cold'}]},metalConditions.map(c=>c.id));
 assert.deepEqual(restored,trials);
 const html=activityRecordsMarkup(restored);
 assert.equal((html.match(/data-record-result=/g)||[]).length,4);
 assert.equal((html.match(/尚未測試/g)||[]).length,activitySamples.length*metalConditions.length-4);
 assert.match(row(html,'Na'),/data-record-result="rapid"/);
 assert.match(row(html,'C'),/data-record-condition="dilute" data-record-result="still"/);
 assert.match(row(html,'Pt'),/data-record-condition="concentrated" data-record-result="still"/);
 assert.match(row(html,'Pt'),/data-record-condition="aqua" data-record-result="slow-dissolve"/);
 assert.doesNotMatch(row(html,'Cu'),/data-record-result=/);
});
