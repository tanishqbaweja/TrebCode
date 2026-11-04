import { chmod,stat } from "node:fs/promises";
import { dirname,join,resolve } from "node:path";
import { fileURLToPath } from "node:url";

// node-pty's published macOS prebuilds contain spawn-helper with mode 0644. Its native fork needs an executable file.
export default async function prepareNativeRuntime(context={}){
  const platform=context.electronPlatformName||process.platform;
  if(platform==="win32")return;
  const root=context.appDir||dirname(dirname(fileURLToPath(import.meta.url)));
  const packageDir=join(root,"node_modules","node-pty");
  const helpers=["build/Release/spawn-helper",... ["arm64","x64"].map(arch=>`prebuilds/darwin-${arch}/spawn-helper`)];
  let fixed=0;
  for(const helper of helpers){
    const path=join(packageDir,helper);
    let info;try{info=await stat(path)}catch(error){if(error.code==="ENOENT")continue;throw error}
    if(info.isFile()){await chmod(path,0o755);fixed++}
  }
  console.log(`Prepared native terminal helper permissions (${fixed} files).`);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await prepareNativeRuntime();
