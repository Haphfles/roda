import {Vector3,Quaternion,Matrix4,Euler} from './three.module.js?v=v0.1.11';
import {JOINTS,clone,mirrorPose,validateMove,samplePose} from './movement-data.mjs?v=v0.1.11';
export const BODY=[11,12,13,14,15,16,23,24,25,26,27,28];
export const CONNECTIONS=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],[27,29],[29,31],[28,30],[30,32],[15,19],[16,20],[0,7],[0,8]];
const down=new Vector3(0,-1,0),forward=new Vector3(0,0,1),UP=new Vector3(0,1,0),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fresh=()=>Object.fromEntries([['height',1.01],...JOINTS.map(([k])=>[k,[0,0,0]])]);
const vis=p=>Math.min(p?.visibility??1,p?.presence??1);
const good=(points,ids,t=.45)=>ids.every(i=>points[i]&&Number.isFinite(points[i].x)&&Number.isFinite(points[i].y)&&Number.isFinite(points[i].z)&&vis(points[i])>=t);
const vec=p=>new Vector3(-p.x,-p.y,-p.z);
const middle=(a,b)=>a.clone().add(b).multiplyScalar(.5);
const angles=q=>{const e=new Euler().setFromQuaternion(q,'XYZ');return[e.x,e.y,e.z];};
const unwrap=(a,prev)=>{while(a-prev>Math.PI)a-=Math.PI*2;while(a-prev< -Math.PI)a+=Math.PI*2;return a;};
function basis(right,up){if(right.lengthSq()<1e-7||up.lengthSq()<1e-7)return new Quaternion();right.normalize();let z=right.clone().cross(up).normalize();if(z.lengthSq()<.1)return new Quaternion();let y=z.clone().cross(right).normalize();return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right,y,z));}
function boneRotation(direction,parent){if(direction.lengthSq()<1e-8)return new Quaternion();const local=direction.clone().applyQuaternion(parent.clone().invert()).normalize();return new Quaternion().setFromUnitVectors(down,local);}
export function retargetFrame(world,normalized,state={},options={}){
 if(!Array.isArray(world)||world.length<33||!Array.isArray(normalized)||normalized.length<33)return null;
 const confidence=BODY.map(i=>Math.min(vis(world[i]),vis(normalized[i])));const visible=confidence.filter(v=>v>=.45).length;
 if(!good(world,[11,12,23,24],.5)||!good(normalized,[11,12,23,24],.5)||visible<8)return null;
 if(!BODY.every(i=>Number.isFinite(world[i].x)&&Number.isFinite(world[i].y)&&Number.isFinite(world[i].z)))return null;
 const p=world.map(vec),hip=middle(p[23],p[24]),shoulder=middle(p[11],p[12]),up=shoulder.clone().sub(hip),right=p[24].clone().sub(p[23]);
 if(right.length()<.04||up.length()<.1)return null;
 let yaw=Math.atan2(-right.z,right.x);if(state.yaw!==undefined)yaw=unwrap(yaw,state.yaw);state.yaw=yaw;
 if(state.initialYaw===undefined)state.initialYaw=options.faceForward===false?0:yaw;
 const offset=new Quaternion().setFromAxisAngle(UP,-state.initialYaw);p.forEach(v=>v.applyQuaternion(offset));
 const hipUp=middle(p[11],p[12]).sub(middle(p[23],p[24])),hipQ=basis(p[24].clone().sub(p[23]),hipUp);
 const rootYaw=yaw-state.initialYaw,rootQ=new Quaternion().setFromAxisAngle(UP,rootYaw);
 const chestQ=basis(p[12].clone().sub(p[11]),hipUp);
 const pose=state.last?clone(state.last):fresh();pose.root=[0,rootYaw,0];pose.hips=angles(rootQ.clone().invert().multiply(hipQ));pose.torso=angles(hipQ.clone().invert().multiply(chestQ));let uncertain=0;
 for(const limb of[{ids:[11,13,15],upper:'armLU',lower:'armLL',parent:chestQ},{ids:[12,14,16],upper:'armRU',lower:'armRL',parent:chestQ},{ids:[23,25,27],upper:'legLU',lower:'legLL',parent:hipQ},{ids:[24,26,28],upper:'legRU',lower:'legRL',parent:hipQ}]){
  const [a,b,c]=limb.ids;if(!good(world,limb.ids)||!good(normalized,limb.ids)){uncertain++;continue;}
  const upperQ=boneRotation(p[b].clone().sub(p[a]),limb.parent),worldUpper=limb.parent.clone().multiply(upperQ),lowerQ=boneRotation(p[c].clone().sub(p[b]),worldUpper);pose[limb.upper]=angles(upperQ);pose[limb.lower]=angles(lowerQ);
  if(a===23||a===24){const left=a===23,heel=left?29:30,toe=left?31:32;if(good(world,[heel,toe])&&good(normalized,[heel,toe])){const legWorld=worldUpper.clone().multiply(lowerQ),footDir=p[toe].clone().sub(p[heel]).applyQuaternion(legWorld.clone().invert()).normalize();if(footDir.lengthSq()>.1)pose[left?'footL':'footR']=angles(new Quaternion().setFromUnitVectors(forward,footDir));}}
 }
 // The head follows the shoulder frame. Face landmarks are too noisy to infer neck twist reliably.
 pose.head=[0,0,0];
 if(state.scale===undefined&&good(world,[23,24,25,26,27,28],.6)){const leg=(p[23].distanceTo(p[25])+p[25].distanceTo(p[27])+p[24].distanceTo(p[26])+p[26].distanceTo(p[28]))/2;state.scale=clamp(.87/leg,.5,2);}
 if(options.ground!==false){const contact=[15,16,19,20,27,28,29,30,31,32].filter(i=>good(world,[i],.55)&&good(normalized,[i],.55));if(contact.length)pose.height=clamp(-Math.min(...contact.map(i=>p[i].y))*(state.scale||1)+.055,.1,3);}else pose.height=1.01;
 if(state.last)for(const[k]of JOINTS)for(let axis=0;axis<3;axis++)pose[k][axis]=unwrap(pose[k][axis],state.last[k][axis]);
 for(const[k]of JOINTS)pose[k]=pose[k].map(v=>clamp(v,-Math.PI*4,Math.PI*4));
 state.last=clone(pose);return{pose,quality:confidence.reduce((a,b)=>a+b,0)/confidence.length,uncertain};
}
export function buildCapturedMove(samples,{duration,name='Captured movement',smoothing=1,mirror=false,faceForward=true,ground=true}={}){
 if(!Number.isFinite(duration)||duration<.2||duration>5)throw Error('Choose a clip between 0.2 and 5 seconds.');
 if(!Array.isArray(samples)||samples.length<4||samples.length>120)throw Error('The clip does not contain enough sampled frames.');
 const state={},raw=samples.map((s,i)=>{const result=retargetFrame(s.world,s.landmarks,state,{faceForward,ground});return result?{u:i/(samples.length-1),ease:'linear',pose:result.pose,quality:result.quality,uncertain:result.uncertain}:null;});
 const valid=raw.filter(Boolean);if(valid.length<4||valid.length/raw.length<.5)throw Error('Too little of the body was tracked. Try a clearer clip with your whole body visible.');
 let run=0,maxRun=0;for(const r of raw){run=r?0:run+1;maxRun=Math.max(maxRun,run);}const gapSeconds=maxRun*duration/(raw.length-1);
 const provisional={frames:valid};const frames=raw.map((f,i)=>({u:i/(raw.length-1),ease:'linear',pose:f?clone(f.pose):samplePose(provisional,i/(raw.length-1))}));
 const radius=clamp(Math.round(smoothing),0,3);if(radius){const original=clone(frames);for(let i=0;i<frames.length;i++){const window=original.slice(Math.max(0,i-radius),Math.min(frames.length,i+radius+1)),pose=frames[i].pose;pose.height=window.reduce((s,f)=>s+f.pose.height,0)/window.length;for(const[k]of JOINTS)for(let a=0;a<3;a++)pose[k][a]=window.reduce((s,f)=>s+f.pose[k][a],0)/window.length;}}
 if(mirror)for(const f of frames)f.pose=mirrorPose(f.pose);
 const move=validateMove({id:'move_capture_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),name:name.trim().slice(0,48)||'Captured movement',kind:'pose',duration,cost:0,damage:0,range:1.5,contact:.5,frames});
 return{move,stats:{total:raw.length,tracked:valid.length,coverage:Math.round(valid.length/raw.length*100),confidence:Math.round(valid.reduce((s,f)=>s+f.quality,0)/valid.length*100),uncertain:valid.filter(f=>f.uncertain>0).length,gapSeconds,missing:raw.map((f,i)=>f?null:i).filter(i=>i!==null)}};
}
