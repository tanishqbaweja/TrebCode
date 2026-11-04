import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir,mkdtemp,readFile,rm,writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname,join } from "node:path";
import { promisify } from "node:util";
import prepareNativeRuntime from "../scripts/prepare-native-runtime.mjs";
const exec=promisify(execFile);

for(const [platform,relative]of [["darwin","prebuilds/darwin-arm64/spawn-helper"],["linux","build/Release/spawn-helper"]]){
  test(`the ${platform} terminal helper can execute after native runtime preparation`,async t=>{
    if(process.platform==="win32")return t.skip("POSIX execute permissions require a Unix host.");
    const root=await mkdtemp(join(tmpdir(),"trebell-helper-mode-"));
    t.after(()=>rm(root,{recursive:true,force:true}));
    const helper=join(root,"node_modules","node-pty",relative),content="#!/bin/sh\nprintf 'terminal-helper-ok\\n'\n";
    await mkdir(dirname(helper),{recursive:true});await writeFile(helper,content,{mode:0o644});
    await assert.rejects(exec(helper),error=>error.code==="EACCES");
    await prepareNativeRuntime({appDir:root,electronPlatformName:platform});
    assert.equal((await exec(helper)).stdout,"terminal-helper-ok\n");
    assert.equal(await readFile(helper,"utf8"),content,"packaging changes permissions, not executable contents");
  });
}
