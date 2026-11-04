import test from "node:test";
import assert from "node:assert/strict";
import { tokenLabel,contextValueLabel,contextUsagePercent } from "../ui/src/token-usage.js";
const number=new Intl.NumberFormat();

test("a context meter without a published window shows the latest prompt rather than cumulative billed tokens",()=>{
  const usage={total:{totalTokens:657083},last:{inputTokens:32145},modelContextWindow:null};
  assert.equal(contextValueLabel(usage),"32,145 tokens");
  assert.equal(tokenLabel(usage),`Context 32,145 input · ${number.format(657083)} total`);
  assert.equal(contextUsagePercent(usage),null);
});

test("a known window uses the same latest prompt for its label and meter, while cost still prices total usage",()=>{
  const usage={total:{totalTokens:120000,inputTokens:100000,outputTokens:20000},last:{inputTokens:25000},modelContextWindow:100000};
  const prices={inputPrice:1,outputPrice:2};
  assert.equal(contextValueLabel(usage,prices,"native"),`25% · 25,000/${number.format(100000)} · $0.14`);
  assert.equal(tokenLabel(usage,prices,"native"),`Context 25% · 25,000 input · ${number.format(120000)} total · $0.14`);
  assert.equal(contextUsagePercent(usage),25);
});

test("missing context is unknown even when billing totals exist",()=>{
  const usage={total:{totalTokens:10000},last:{},cost:{amount:0.0012}};
  assert.equal(contextValueLabel(usage),"—");
  assert.equal(tokenLabel(usage),"Tokens 10,000 · $0.0012");
  assert.equal(contextUsagePercent(usage),null);
  assert.equal(contextValueLabel(null),"—");
});
