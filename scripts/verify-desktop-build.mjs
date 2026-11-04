import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const repository=process.env.GH_REPO,runId=process.env.TREBELL_CHECKED_RUN;
assert.ok(repository&&/^\d+$/.test(runId||""),"A repository and completed desktop build run are required.");
const api=path=>JSON.parse(execFileSync("gh",["api",`repos/${repository}/${path}`],{encoding:"utf8"}));
const run=api(`actions/runs/${runId}`);
assert.equal(run.path,".github/workflows/release.yml");
assert.equal(run.status,"completed");
assert.equal(run.head_repository.full_name,repository);
assert.equal(run.head_branch,"main");
assert.ok(["workflow_dispatch","push"].includes(run.event));
const {jobs}=api(`actions/runs/${runId}/jobs`);
for(const name of ["Check source before building / scan","Build and check Windows x64","Build and check Linux x64","Build and check macOS Apple Silicon","Build and check macOS Intel"]){
  const matches=jobs.filter(job=>job.name===name);
  assert.equal(matches.length,1,`Missing or ambiguous check: ${name}`);
  assert.equal(matches[0].conclusion,"success",`${name} did not pass.`);
}
assert.match(run.head_sha,/^[a-f0-9]{40}$/);
appendFileSync(process.env.GITHUB_OUTPUT,`commit=${run.head_sha}\n`);
console.log(`Verified all four packaged applications and source scan at ${run.head_sha}.`);
