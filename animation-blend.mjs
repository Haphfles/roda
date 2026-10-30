import {rigJoints} from './movement-data.mjs?v=v0.1.15';
// Blend only at action boundaries: authored rotations and root travel stay intact.
export class AnimationBlend {
 constructor(){this.reset();}
 reset(){this.previous=null;this.from=null;this.action=null;this.time=0;this.duration=0;}
 update(rig,f,dt,move,rate=1){const joints=rigJoints(rig);const changed=this.action!==f.action||(f.action!=='idle'&&f.t<this.lastTime);
 if(changed&&this.previous){this.from=this.previous;this.time=0;this.duration=f.action==='idle'?.16:Math.min(.12,Math.max(.01,(move?.contact??.24)/Math.max(rate,.01)*.65));}
 this.action=f.action;this.lastTime=f.t;this.time+=dt;
 if(this.from&&this.time<this.duration){let a=this.time/this.duration;a=a*a*(3-2*a);for(const [key,joint] of Object.entries(joints))joint.quaternion.slerpQuaternions(this.from.rotations[key],joint.quaternion.clone(),a);rig.hips.position.y=this.from.height+(rig.hips.position.y-this.from.height)*a;}else this.from=null;
 this.previous={height:rig.hips.position.y,rotations:Object.fromEntries(Object.entries(joints).map(([key,joint])=>[key,joint.quaternion.clone()]))};
 }
}
