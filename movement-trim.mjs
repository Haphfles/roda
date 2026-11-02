import {clone,samplePose,validateMove} from './movement-data.mjs?v=v0.1.25';
import {travelKeys,sampleTravel} from './root-motion.mjs?v=v0.1.25';
export function trimMovement(input,start,end){
 const move=validateMove(input),duration=end-start;
 if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end>move.duration+1e-8||duration<.2-1e-8)throw Error('Keep at least 0.2 seconds, within the animation.');
 if(start===0&&end===move.duration)return move;
 const a=start/move.duration,b=end/move.duration,span=b-a;
 // Retain source key times and add samples for cropped smooth curves. Hold segments stay holds.
 const times=[a,...move.frames.filter(f=>f.u>a+1e-9&&f.u<b-1e-9).map(f=>f.u),b];
 const room=120-times.length,count=Math.min(room,Math.ceil(duration*30));
 for(let i=1;i<=count;i++){const u=a+span*i/(count+1);if(!times.some(t=>Math.abs(t-u)<1e-8))times.push(u);}
 times.sort((x,y)=>x-y);
 const result=clone(move);result.duration=Math.max(.2,duration);
 result.frames=times.map((t,i)=>{let index=move.frames.findIndex(f=>f.u>t+1e-9)-1;if(index<0)index=move.frames.length-1;return {u:i===0?0:i===times.length-1?1:(t-a)/span,ease:move.frames[index].ease==='hold'?'hold':'linear',pose:samplePose(move,t)};});
 result.contact=Math.max(.05,Math.min(.95,(move.contact*move.duration-start)/duration));
 const first=sampleTravel(move,a),last=sampleTravel(move,b);
 result.travel=[a,...travelKeys(move).filter(k=>k.u>a+1e-9&&k.u<b-1e-9).map(k=>k.u),b].map((t,i,all)=>{const u=i===0?0:i===all.length-1?1:(t-a)/span,p=sampleTravel(move,t);return {u,position:[p[0]-first[0],p[1]-(first[1]+(last[1]-first[1])*u),p[2]-first[2]]};});
 result.travel[0].position=[0,0,0];result.travel.at(-1).position[1]=0;
 return validateMove(result);
}
