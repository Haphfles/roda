import {Vector3,Quaternion,Euler} from './three.module.js?v=v0.1.28';
import {solveIK,chain} from './studio-ik.mjs?v=v0.1.28';
const rad=Math.PI/180,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function flexibilityValue(value){return Number.isFinite(Number(value))?clamp(Number(value),0,100):50;}
// Local joint limits, not a dynamics or collision simulation. Root flips remain unrestricted in free mode.
export function limitTrackedPose(input,flexibility=50,planted=false){
 const p=structuredClone(input),f=flexibilityValue(flexibility)/100;
 const limit=(key,ranges)=>{const q=new Quaternion().setFromEuler(new Euler(...p[key]));const e=new Euler().setFromQuaternion(q);p[key]=[e.x,e.y,e.z].map((v,i)=>clamp(v,ranges[i][0]*rad,ranges[i][1]*rad));};
 limit('torso',[[-25-20*f,35+25*f],[-30-25*f,30+25*f],[-20-20*f,20+20*f]]);
 limit('head',[[-35,45],[-65,65],[-30,30]]);
 for(const side of ['L','R']){
  // Elbows and knees are hinges. Their bend planes are resolved during retargeting.
  p['arm'+side+'L']=[clamp(p['arm'+side+'L'][0],-(115+35*f)*rad,0),0,0];
  p['leg'+side+'L']=[clamp(p['leg'+side+'L'][0],0,(110+40*f)*rad),0,0];
  const shoulder=p['arm'+side+'U'],q=new Quaternion().setFromEuler(new Euler(...shoulder)),down=new Vector3(0,-1,0),direction=down.clone().applyQuaternion(q),angle=down.angleTo(direction),maximum=(155+25*f)*rad;
  if(angle>maximum){const axis=down.clone().cross(direction);if(axis.lengthSq()<1e-8)axis.set(1,0,0);axis.normalize();q.premultiply(new Quaternion().setFromAxisAngle(axis,maximum-angle));const e=new Euler().setFromQuaternion(q);p['arm'+side+'U']=[e.x,e.y,e.z];}
  // Hip extension/abduction and ankle ranges; preserve shoulder rotation for overhead movements.
  limit('leg'+side+'U',[[-(95+55*f),25+20*f],[-45-15*f,45+15*f],[-40-40*f,40+40*f]]);
  limit('foot'+side,[[-40,30],[-20,20],[-20,20]]);
 }
 if(planted){p.root=[0,0,0];limit('hips',[[-20,20],[-25,25],[-15,15]]);}
 return p;
}
// Targets use the rig's neutral ankle positions, calibrated by its skin to put the soles on the floor.
// Work in character space so scale, facing and the gameplay position do not change the solve.
export function anchorTrackedFeet(rig,flexibility=50){
 const root=rig.root,position=root.position.clone(),rotation=root.quaternion.clone(),scale=root.scale.clone();
 root.position.set(0,0,0);root.quaternion.identity();root.scale.set(1,1,1);root.updateMatrixWorld(true);
 const maxBend=110+40*flexibilityValue(flexibility)/100,targets=[];let low=.1,high=3;
 for(const side of ['l','r']){
  const key=side==='l'?'footL':'footR',c=chain(rig,key);
  const target=c.upper.position.clone().add(c.lower.position).add(c.end.position);target.y+=.925;
  const a=c.upper.getWorldPosition(new Vector3()),b=c.lower.getWorldPosition(new Vector3()),end=c.end.getWorldPosition(new Vector3());
  const l1=a.distanceTo(b),l2=b.distanceTo(end),max=l1+l2-.00001,min=Math.sqrt(l1*l1+l2*l2+2*l1*l2*Math.cos(maxBend*rad));
  const horizontal=(a.x-target.x)**2+(a.z-target.z)**2,offset=a.y-rig.hips.position.y;
  low=Math.max(low,target.y-offset+Math.sqrt(Math.max(0,min*min-horizontal)));
  high=Math.min(high,target.y-offset+Math.sqrt(Math.max(0,max*max-horizontal)));
  targets.push({key,target});
 }
 rig.hips.position.y=clamp(rig.hips.position.y,low,Math.max(low,high));root.updateMatrixWorld(true);
 for(const {key,target}of targets){solveIK(rig,key,target,{pole:new Vector3(0,0,1),maxBend});const foot=chain(rig,key).end;foot.quaternion.copy(foot.parent.getWorldQuaternion(new Quaternion()).invert());root.updateMatrixWorld(true);}
 root.position.copy(position);root.quaternion.copy(rotation);root.scale.copy(scale);root.updateMatrixWorld(true);
}
