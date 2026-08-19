import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSearch,isPrefixMatch,makeSuggestions} from '../src/search.js';

const students=[
  {id:'AB-1',name:'Abdulloh Saidov',level:'A1',group:'A1 — Morning'},
  {id:'AB-2',name:'Ahmad Aliyev',level:'A2',group:'A2 — Evening'},
  {id:'AB-3',name:'Maryam Abdullayeva',level:'B1',group:'B1 — Morning'}
];

test('transliterates Cyrillic prefix to Latin',()=>{
  assert.equal(normalizeSearch('АБД'),'abd');
  assert.equal(isPrefixMatch(students[0],'АБД'),true);
});

test('matches by prefix, not arbitrary middle substring',()=>{
  assert.equal(isPrefixMatch(students[0],'abd'),true);
  assert.equal(isPrefixMatch(students[0],'dulloh'),false);
});

test('suggestions rank exact name prefix first',()=>{
  const result=makeSuggestions('ah',{students,teachers:[],groups:[],leads:[]});
  assert.equal(result[0].name,'Ahmad Aliyev');
});

test('supports multi-token prefixes',()=>{
  assert.equal(isPrefixMatch(students[2],'mary abd'),true);
});
