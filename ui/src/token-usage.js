import { priceUsage } from "./usage-pricing.js";

// Total usage is billed traffic across requests; context is the latest request's input.
export function tokenLabel(tokenUsage,price=null,runtime=""){
  const total=Number(tokenUsage?.total?.totalTokens),input=Number(tokenUsage?.last?.inputTokens),size=Number(tokenUsage?.modelContextWindow);
  const actual=Number(tokenUsage?.cost?.amount),cost=Number.isFinite(actual)?actual:priceUsage(tokenUsage?.total,runtime,price);
  const suffix=cost!=null?` · $${cost<0.01?cost.toFixed(4):cost.toFixed(2)}`:"";
  if(!(total>0))return "Context —";
  if(input>0)return "Context "+(size>0?Math.round(input/size*100)+"% · ":"")+input.toLocaleString()+" input · "+total.toLocaleString()+" total"+suffix;
  return "Tokens "+total.toLocaleString()+suffix;
}

export function contextValueLabel(tokenUsage,price=null,runtime=""){
  const total=Number(tokenUsage?.total?.totalTokens),input=Number(tokenUsage?.last?.inputTokens),size=Number(tokenUsage?.modelContextWindow);
  if(!(total>0)||!(input>0))return "—";
  const cost=/ · (\$[\d.]+)$/.exec(tokenLabel(tokenUsage,price,runtime))?.[1]||"";
  return (size>0?Math.round(input/size*100)+"% · "+input.toLocaleString()+"/"+size.toLocaleString():input.toLocaleString()+" tokens")+(cost?" · "+cost:"");
}

export function contextUsagePercent(tokenUsage){
  const input=Number(tokenUsage?.last?.inputTokens),size=Number(tokenUsage?.modelContextWindow);
  if(!(Number(tokenUsage?.total?.totalTokens)>0)||!(input>0)||!(size>0))return null;
  return Math.max(0,Math.min(100,Math.round(input/size*100)));
}
