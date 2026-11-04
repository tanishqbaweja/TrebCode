// Split table cells without treating escaped pipes or pipes in inline code as separators.
function cellsIn(line){
  const text=String(line||"").trim(),cells=[];let cell="",ticks=0,first=-1,last=-1;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==="\\"&&!ticks&&text[i+1]==="|"){cell+="|";i++;continue}
    if(ch==="`"){
      let length=1;while(text[i+length]==="`")length++;
      if(!ticks)ticks=length;else if(ticks===length)ticks=0;
      cell+="`".repeat(length);i+=length-1;continue;
    }
    if(ch==="|"&&!ticks){if(first<0)first=i;last=i;cells.push(cell.trim());cell=""}else cell+=ch;
  }
  if(first<0)return null;
  cells.push(cell.trim());if(first===0)cells.shift();if(last===text.length-1)cells.pop();
  return cells;
}

export function markdownTableAt(lines,index){
  const headers=cellsIn(lines[index]),dividers=cellsIn(lines[index+1]);
  if(!headers?.length||headers.length!==dividers?.length||!dividers.every(cell=>/^:?-{3,}:?$/.test(cell)))return null;
  const align=dividers.map(cell=>cell.startsWith(":")?(cell.endsWith(":")?"center":"left"):cell.endsWith(":")?"right":"left");
  const rows=[];let end=index+2;
  for(;end<lines.length;end++){
    const cells=cellsIn(lines[end]);if(!cells)break;
    rows.push(headers.map((_,column)=>cells[column]||""));
  }
  return {headers,align,rows,end};
}
