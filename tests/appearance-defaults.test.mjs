import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp,rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { TrebellStateStore } from "../src/trebell-state.mjs";

test("new profiles default to light and preserve explicit appearance choices",async()=>{
  const home=await mkdtemp(join(tmpdir(),"trebell-light-default-")),env={...process.env,TREBELL_HOME:home};
  let state;
  try{
    state=new TrebellStateStore(env);assert.equal(state.settings().appearanceMode,"light");
    state.updateSettings({appearanceMode:"dark",appearance:"midnight"});state.close();
    state=new TrebellStateStore(env);assert.equal(state.settings().appearanceMode,"dark");assert.equal(state.settings().appearance,"midnight");
    state.updateSettings({appearanceMode:"system"});state.close();
    state=new TrebellStateStore(env);assert.equal(state.settings().appearanceMode,"system");
  }finally{state?.close();await rm(home,{recursive:true,force:true,maxRetries:20,retryDelay:250})}
});

const html=readFileSync(new URL("../ui/index.html",import.meta.url),"utf8"),script=/<script>([\s\S]*?)<\/script>/.exec(html)[1];
for(const {name,cached,dark=true,unavailable=false,expected}of [
  {name:"no saved appearance on a dark OS",cached:null,expected:"light"},
  {name:"unavailable browser storage",unavailable:true,expected:"light"},
  {name:"malformed saved appearance",cached:"{",expected:"light"},
  {name:"invalid saved mode",cached:JSON.stringify({mode:"obsolete"}),expected:"light"},
  {name:"an explicit dark choice",cached:JSON.stringify({mode:"dark",theme:"midnight"}),expected:"dark"},
  {name:"an explicit light choice",cached:JSON.stringify({mode:"light"}),expected:"light"},
  {name:"System mode on a dark OS",cached:JSON.stringify({mode:"system"}),expected:"dark"},
  {name:"System mode on a light OS",cached:JSON.stringify({mode:"system"}),dark:false,expected:"light"},
]){
  test(`first paint honors ${name}`,()=>{
    assert.match(html,/<html[^>]*data-mode="light"[^>]*color-scheme:light/);
    const root={dataset:{mode:"light"},style:{colorScheme:"light"}};
    runInNewContext(script,{document:{documentElement:root},localStorage:{getItem(){if(unavailable)throw new Error("Storage disabled");return cached}},window:{matchMedia:()=>({matches:dark})}});
    assert.equal(root.dataset.mode,expected);assert.equal(root.style.colorScheme,expected);
  });
}
