import test from 'node:test';
import assert from 'node:assert/strict';
import {benchLitmus,immersedPaperFraction} from '../dist/bench-water.js';

test('only the part of litmus below the waterline changes colour',()=>{
 assert.equal(immersedPaperFraction(100),0);
 assert.equal(immersedPaperFraction(benchLitmus.waterline-benchLitmus.height),0);
 assert.equal(immersedPaperFraction(benchLitmus.waterline-benchLitmus.height/2),.5);
 assert.equal(immersedPaperFraction(benchLitmus.waterline),1);
});
test('both tested strips rest inside the beaker with their lower ends underwater',()=>{
 assert.ok(benchLitmus.top>236);
 assert.ok(benchLitmus.top+benchLitmus.height>303);
 assert.ok(benchLitmus.top+benchLitmus.height<365);
 for(const x of Object.values(benchLitmus.left))assert.ok(x>94&&x+19<210);
});
