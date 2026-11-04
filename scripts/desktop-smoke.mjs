import assert from "node:assert/strict";
import { mkdir,writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join,resolve } from "node:path";
import { _electron as electron,expect } from "@playwright/test";
import { TrebellStateStore } from "../src/trebell-state.mjs";

const root=resolve(process.env.TREBELL_SMOKE_ROOT||".release-smoke"),home=join(root,"home"),profile=join(root,"user-profile"),temporary=join(root,"tmp");
for(const path of [root,home,profile,temporary,join(root,"screenshots")])await mkdir(path,{recursive:true});
const listener=createServer();await new Promise((ok,fail)=>listener.listen(0,"127.0.0.1",ok).once("error",fail));
const port=listener.address().port;await new Promise(ok=>listener.close(ok));
const env={...process.env,TREBELL_HOME:home,HOME:profile,USERPROFILE:profile,TEMP:temporary,TMP:temporary,TMPDIR:temporary,
  APPDATA:join(root,"appdata"),LOCALAPPDATA:join(root,"localappdata"),XDG_CONFIG_HOME:join(root,"config"),XDG_CACHE_HOME:join(root,"cache"),XDG_DATA_HOME:join(root,"data"),
  TREBELL_GUI_PORT:String(port),TREBELL_TEST_HIDDEN:"1",TREBELL_TEST_WORKSPACE:profile,TREBELL_E2E_OFFLINE:"0",TREBELL_GUI_MOCK:"0"};
for(const key of Object.keys(env))if(/(?:API_KEY|AUTH_TOKEN|ACCESS_TOKEN)$/.test(key)||["GH_TOKEN","GITHUB_TOKEN","ELECTRON_RUN_AS_NODE","NODE_OPTIONS"].includes(key))delete env[key];
const state=new TrebellStateStore(env);
state.updateSettings({onboardingComplete:true,agentRuntime:"native",agentRuntimeInstanceId:"native-default",modelProvider:"openai",panelAnimationMs:0,
  defaultWorkspaceMode:"current",autoPull:false,agentRuntimeInstances:["codex","claude","cursor","grok","opencode","antigravity","muse"].map(kind=>({
    id:kind+"-default",kind,displayName:kind,enabled:true,binaryPath:join(root,"unavailable",kind),homePath:join(root,"runtime-homes",kind),
  }))});state.close();
const executablePath=resolve(process.env.TREBELL_SMOKE_EXECUTABLE||process.argv[2]||"");
if(executablePath===resolve(""))throw new Error("Set TREBELL_SMOKE_EXECUTABLE to the packaged application executable.");
let app,page;
const errors=[];
try{
  app=await electron.launch({executablePath,args:["--no-sandbox","--disable-renderer-backgrounding","--disable-backgrounding-occluded-windows"],env,timeout:60_000});
  page=await app.firstWindow({timeout:60_000});page.setDefaultTimeout(15_000);
  page.on("pageerror",error=>errors.push(error.message));
  await expect(page.getByTestId("composer")).toBeVisible({timeout:60_000});
  const packaged=await app.evaluate(({app})=>({packaged:app.isPackaged,path:app.getAppPath()}));
  assert.equal(packaged.packaged,true);assert.match(packaged.path,/app\.asar$/);
  await page.getByTestId("terminal-toggle").click();
  const creation=page.waitForResponse(response=>new URL(response.url()).pathname==="/api/terminal/sessions"&&response.request().method()==="POST");
  await page.getByRole("button",{name:"Create terminal",exact:true}).click();
  const created=await creation;
  if(!created.ok())throw new Error("Packaged terminal creation failed: "+JSON.stringify(await created.json()));
  const terminal=page.locator(".terminal-pane").last(),command=terminal.locator(".terminal-command-line input");
  await command.fill('node -p "\'TREBCODE_\' + (6 * 7)"');await command.press("Enter");
  await expect(terminal).toContainText("TREBCODE_42",{timeout:30_000});
  await page.getByRole("button",{name:"Close terminal",exact:true}).click();
  await page.getByRole("navigation",{name:"Destinations"}).getByRole("button",{name:"Settings",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Settings",exact:true})).toBeVisible();
  await page.locator(".settings-nav").getByRole("button",{name:/^Appearance/}).click();
  await expect(page.getByRole("button",{name:"Create theme",exact:true})).toBeVisible();
  assert.deepEqual(errors,[]);
  const shot=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString("base64"));
  await writeFile(join(root,"screenshots",process.platform+"-"+process.arch+".png"),Buffer.from(shot,"base64"));
  await writeFile(join(root,"result.json"),JSON.stringify({platform:process.platform,arch:process.arch,packaged:true,asar:true,ui:true,nativeTerminal:true,lazySettings:true,pageErrors:errors},null,2));
  console.log("Packaged application passed: ASAR startup, UI, native terminal command, lazy Settings, and no renderer errors.");
}catch(error){
  const terminalErrors=await page?.locator(".terminal-error").allTextContents().catch(()=>[])||[];
  const result={platform:process.platform,arch:process.arch,error:String(error.message),terminalErrors,pageErrors:errors};
  await writeFile(join(root,"result.json"),JSON.stringify(result,null,2));
  console.error(JSON.stringify(result));
  if(app){try{const shot=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage()).toPNG().toString("base64"));await writeFile(join(root,"screenshots","failure-"+process.platform+"-"+process.arch+".png"),Buffer.from(shot,"base64"))}catch{}}
  throw error;
}finally{await app?.close()}
