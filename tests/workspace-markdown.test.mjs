import test from "node:test";
import assert from "node:assert/strict";
import { markdownTableAt } from "../ui/src/workspace-markdown.js";

test("README tables become columns with alignment, stopping before the following paragraph",()=>{
  const lines=["| Key | Action |","| :--- | ---: |","| N | New task |","| / | Search |","A paragraph."];
  assert.deepEqual(markdownTableAt(lines,0),{headers:["Key","Action"],align:["left","right"],rows:[["N","New task"],["/","Search"]],end:4});
});
test("pipes inside code or escaped text stay inside a cell",()=>{
  const lines=["Name | Example","--- | :---:","A\\|B | `left|right`","Code | ``a`|b``"];
  assert.deepEqual(markdownTableAt(lines,0),{headers:["Name","Example"],align:["left","center"],rows:[["A|B","`left|right`"],["Code","``a`|b``"]],end:4});
});
test("prose, headings and malformed delimiters do not turn into tables",()=>{
  for(const lines of [["Title","---"],["a | b","---"],["a | b","-- | ---"],["a | b","--- | text"]])assert.equal(markdownTableAt(lines,0),null);
});
