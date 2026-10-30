import {Vector3,Quaternion} from './three.module.js?v=v0.1.19';
export const LIMBS={handL:['arms','l','hand','armLU','armLL'],handR:['arms','r','hand','armRU','armRL'],footL:['legs','l','foot','legLU','legLL'],footR:['legs','r','foot','legRU','legRL']};
export function chain(rig,key){const [group,side,end]=LIMBS[key];const limb=rig[group][side];return{upper:limb.upper,lower:limb.lower,end:limb[end]};}
const position=o=>o.getWorldPosition(new Vector3());
export function bendPole(rig,key){rig.root.updateMatrixWorld(true);const {upper,lower,end}=chain(rig,key),a=position(upper),b=position(lower),c=position(end);const direction=c.sub(a).normalize();let pole=b.sub(a);pole.addScaledVector(direction,-pole.dot(direction));
 // A straight limb has no unique bend plane. Use the character's forward axis.
 if(pole.lengthSq()<1e-8){pole=new Vector3(0,0,key.startsWith('hand')?-1:1).applyQuaternion(upper.parent.getWorldQuaternion(new Quaternion()));pole.addScaledVector(direction,-pole.dot(direction));if(pole.lengthSq()<1e-8)pole.set(1,0,0).addScaledVector(direction,-direction.x);}
 return pole.normalize();}
function aim(joint,child,target){const origin=position(joint),from=position(child).sub(origin).normalize(),to=target.clone().sub(origin).normalize();const world=joint.getWorldQuaternion(new Quaternion());world.premultiply(new Quaternion().setFromUnitVectors(from,to));const parent=joint.parent.getWorldQuaternion(new Quaternion()).invert();joint.quaternion.copy(parent.multiply(world));joint.updateWorldMatrix(false,true);}
export function solveIK(rig,key,target,{pole,bend=0,maxBend=165}={}){if(!target.toArray().every(Number.isFinite))throw Error('Invalid IK target');rig.root.updateMatrixWorld(true);const {upper,lower,end}=chain(rig,key),a=position(upper),b=position(lower),c=position(end);const l1=a.distanceTo(b),l2=b.distanceTo(c);let direction=target.clone().sub(a),distance=direction.length();if(distance<1e-8)direction=c.clone().sub(a);direction.normalize();const d=Math.max(Math.max(Math.abs(l1-l2)+.00001,Math.sqrt(l1*l1+l2*l2+2*l1*l2*Math.cos(maxBend*Math.PI/180))),Math.min(l1+l2-.00001,distance));const actual=a.clone().addScaledVector(direction,d);let side=(pole||bendPole(rig,key)).clone();side.addScaledVector(direction,-side.dot(direction));if(side.lengthSq()<1e-8){side.set(0,1,0).addScaledVector(direction,-direction.y);if(side.lengthSq()<1e-8)side.set(1,0,0).addScaledVector(direction,-direction.x);}side.normalize().applyAxisAngle(direction,bend);const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));const elbow=a.clone().addScaledVector(direction,along).addScaledVector(side,height);aim(upper,lower,elbow);aim(lower,end,actual);rig.root.updateMatrixWorld(true);return{reached:position(end),clamped:Math.abs(d-distance)>.001};}

// Body motion keeps both foot transforms fixed; stop before a knee folds too far.
export function bodyAnchors(rig){rig.root.updateMatrixWorld(true);return ['footL','footR'].map(key=>{const c=chain(rig,key);const forward=new Vector3(0,0,1).applyQuaternion(rig.hips.getWorldQuaternion(new Quaternion())),pole=bendPole(rig,key);return{key,target:position(c.end),orientation:c.end.getWorldQuaternion(new Quaternion()),pole:pole.dot(forward)>.1?pole:forward};});}
export function solveBodyHeight(rig,height,anchors=bodyAnchors(rig)){
 const start=rig.hips.position.y,up=new Vector3(0,1,0).applyQuaternion(rig.root.getWorldQuaternion(new Quaternion()));
 const valid=h=>{const delta=h-start;return anchors.every(anchor=>{const c=chain(rig,anchor.key),a=position(c.upper),b=position(c.lower),end=position(c.end),l1=a.distanceTo(b),l2=b.distanceTo(end),d=a.addScaledVector(up,delta).distanceTo(anchor.target);const min=Math.sqrt(l1*l1+l2*l2+2*l1*l2*Math.cos(135*Math.PI/180));return d>=min-.00001&&d<=l1+l2+.00001;});};
 let wanted=Math.max(.1,Math.min(3,height)),accepted=start;
 // Walk from the current pose to avoid crossing a forbidden fold region.
 for(let i=1;i<=80;i++){const h=start+(wanted-start)*i/80;if(!valid(h)){let lo=accepted,hi=h;for(let j=0;j<24;j++){const mid=(lo+hi)/2;if(valid(mid))lo=mid;else hi=mid;}accepted=lo;break;}accepted=h;}
 rig.hips.position.y=accepted;rig.root.updateMatrixWorld(true);
 for(const anchor of anchors){solveIK(rig,anchor.key,anchor.target,{pole:anchor.pole,maxBend:135});const foot=chain(rig,anchor.key).end;foot.quaternion.copy(foot.parent.getWorldQuaternion(new Quaternion()).invert().multiply(anchor.orientation));rig.root.updateMatrixWorld(true);}
 return{clamped:Math.abs(accepted-height)>.001,height:accepted};
}
