import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile,readdir,rename,writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const directory=process.env.TREBELL_RELEASE_ASSETS||"release-assets",tag="desktop",repository=process.env.GH_REPO,commit=process.env.TREBELL_RELEASE_COMMIT||process.env.GITHUB_SHA;
assert.ok(repository&&commit,"GH_REPO and GITHUB_SHA are required.");
// Linux targets substitute their native architecture labels for ${arch}.
for(const [built,published]of [["Trebell-Code-linux-amd64.deb","Trebell-Code-linux-x64.deb"],["Trebell-Code-linux-x86_64.AppImage","Trebell-Code-linux-x64.AppImage"]]){
  const available=await readdir(directory);
  if(available.includes(built)){assert.ok(!available.includes(published),"Duplicate package: "+published);await rename(join(directory,built),join(directory,published))}
}
const expected=["Trebell-Code-Setup.exe","Trebell-Code-linux-x64.AppImage","Trebell-Code-linux-x64.deb",... ["arm64","x64"].flatMap(arch=>["dmg","zip"].map(ext=>`Trebell-Code-mac-${arch}.${ext}`))].sort();
const files=(await readdir(directory)).sort();assert.deepEqual(files,expected,"All target packages must pass before publication.");
const sums=[];
for(const file of files){const bytes=await readFile(join(directory,file));assert.ok(bytes.length>10_000,"Empty or invalid package: "+file);sums.push(createHash("sha256").update(bytes).digest("hex")+"  "+file)}
await writeFile(join(directory,"SHA256SUMS"),sums.join("\n")+"\n");
function gh(args,{allowFailure=false}={}){
  const result=spawnSync("gh",args,{encoding:"utf8",stdio:["ignore","pipe","pipe"]});
  if(result.status!==0&&!allowFailure)throw new Error(result.stderr||result.error?.message||"GitHub release command failed");
  return result;
}
const exists=gh(["release","view",tag,"--repo",repository,"--json","id"],{allowFailure:true}).status===0;
if(!exists)gh(["release","create",tag,"--repo",repository,"--target",commit,"--title","Trebell Code","--notes-file","docs/releases/desktop.md","--draft"]);
else{
  gh(["api",`repos/${repository}/git/refs/tags/${tag}`,"--method","PATCH","-f",`sha=${commit}`,"-F","force=true"]);
}
gh(["release","upload",tag,"--repo",repository,"--clobber",...files.map(file=>join(directory,file)),join(directory,"SHA256SUMS")]);
gh(["release","edit",tag,"--repo",repository,"--title","Trebell Code","--notes-file","docs/releases/desktop.md","--draft=false","--latest"]);
console.log(`Published https://github.com/${repository}/releases/tag/${tag}`);
