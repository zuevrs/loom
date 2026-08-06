export const RUBRIC = Object.freeze({
  dimensions: Object.freeze(["wrongObjectPrevention","prematureQuestions","userOwnership","proofClarity","boundaryClarity","readbackQuality","loadBearingDecisionGuardrail"]),
  scoreRange: Object.freeze({min: 1, max: 5}),
  questionCount: "Question count is advisory; do not penalize an additional question when it opens a new load-bearing decision."
});
const sides=["A","B"], dimensions=RUBRIC.dimensions;
const exact=(v,keys)=>v&&typeof v==="object"&&!Array.isArray(v)&&JSON.stringify(Object.keys(v).sort())===JSON.stringify([...keys].sort());
const sha=v=>typeof v==="string"&&/^[a-f0-9]{64}$/i.test(v);
export function assertJudgeRequest(packet){
  if(!exact(packet,["caseId","run","outputs","promptHash","rubricVersion"])||typeof packet.caseId!=="string"||!Number.isInteger(packet.run)||packet.run<1||!sha(packet.promptHash)||typeof packet.rubricVersion!=="string"||!exact(packet.outputs,sides)||sides.some(s=>typeof packet.outputs[s]!=="string"||!packet.outputs[s].trim()))throw Error("blinded judge request schema is invalid");
  const leaked=Object.keys(packet).some(key=>/(?:control|candidate|mapping|baseline|implementer|identity|commit|digest)/i.test(key))||Object.keys(packet.outputs).some(key=>/(?:control|candidate|mapping|baseline|implementer|identity|commit|digest)/i.test(key));if(leaked)throw Error("blinded judge request leaks identity"); return true;
}
function assertScores(value,side){const keys=[...dimensions,"loadBearingDecisionOpened","questionCountRationale"];if(!exact(value,keys)||typeof value.loadBearingDecisionOpened!=="boolean"||typeof value.questionCountRationale!=="string"||!value.questionCountRationale.trim())throw Error("judge response "+side+" rationale is invalid");for(const key of dimensions)if(!Number.isInteger(value[key])||value[key]<1||value[key]>5)throw Error("judge response "+side+" score is out of range");}
export function parseJudgeResponse(value){let response;try{response=typeof value==="string"?JSON.parse(value.trim()):value}catch{throw Error("malformed independent judge response JSON");}if(!exact(response,["caseId","run","promptHash","rubricVersion","scores","verdict"])||typeof response.caseId!=="string"||!Number.isInteger(response.run)||response.run<1||!sha(response.promptHash)||typeof response.rubricVersion!=="string"||!exact(response.scores,sides)||!["A","B","tie"].includes(response.verdict))throw Error("independent judge response schema is invalid");for(const s of sides)assertScores(response.scores[s],s);const total=s=>dimensions.reduce((sum,key)=>sum+response.scores[s][key],0);const expected=total("A")===total("B")?"tie":total("A")>total("B")?"A":"B";if(response.verdict!==expected)throw Error("judge response verdict does not match scores");return Object.freeze(response);}
export function judgePacket(response){return parseJudgeResponse(response);}
