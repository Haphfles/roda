import * as THREE from 'three';
import {FBXLoader} from './FBXLoader.js?v=v0.1.15';
import {clone} from './SkeletonUtils.js?v=v0.1.15';
const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion(),down=new THREE.Vector3(0,-1,0);
export async function loadMasterCharacter(){
 const manager=new THREE.LoadingManager();manager.setURLModifier(url=>{if(url.includes('Image_')||url.endsWith('/normal')){const name=url.split('/').at(-1);return './New_Characters/Master_1/textures/'+name+(name==='normal'?'.png':'.jpg');}return url;});
 const template=await new FBXLoader(manager).loadAsync('./Master_1_MIXAMO.fbx');
 const texture=await new THREE.TextureLoader().loadAsync('./New_Characters/Master_1/textures/Image_0.jpg');texture.colorSpace=THREE.SRGBColorSpace;
 const normal=await new THREE.TextureLoader().loadAsync('./New_Characters/Master_1/textures/normal.png');
 const material=new THREE.MeshStandardMaterial({map:texture,normalMap:normal,roughness:.85,metalness:0,side:THREE.DoubleSide});template.traverse(o=>{if(o.isMesh)o.material=material;});
 return createCharacterSkin(template);
}
export function createCharacterSkin(source,{scale:adjustment=1,facing=0}={}){
 const template=clone(source);
 const required=["Hips","Head","Spine","Spine1","Spine2","Neck",... ["Left","Right"].flatMap(s=>["Arm","ForeArm","Hand","UpLeg","Leg","Foot"].map(n=>s+n))];
 template.traverse(o=>{if(o.isBone)o.name="mixamorig"+o.name.replace(/^.*mixamorig\d*[:_]?/i,"").replace(/^.*:/,"");});
 const missing=required.filter(n=>!template.getObjectByName("mixamorig"+n));let skins=0;template.traverse(o=>{if(o.isSkinnedMesh)skins++;});if(!skins||missing.length)throw Error(!skins?"This file has no skinned mesh. Export With Skin.":"Use a Mixamo humanoid rig. Missing bones: "+missing.join(", "));
 template.rotation.y+=facing*Math.PI/180;template.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(template),hips=template.getObjectByName('mixamorigHips');
 if(!hips)throw Error('Master_1 has no Mixamo hips bone');
 const scale=.925/(hips.getWorldPosition(V()).y-bounds.min.y);
 if(!Number.isFinite(scale)||scale<=0)throw Error("Invalid character scale");template.scale.multiplyScalar(scale*adjustment);template.updateMatrixWorld(true);
 template.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.side=THREE.DoubleSide;if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;}}});
 return function attach(rig){
  const controls=[rig.root,rig.hips,rig.torso,rig.head,...Object.values(rig.arms).flatMap(a=>[a.upper,a.lower,a.hand]),...Object.values(rig.legs).flatMap(l=>[l.upper,l.lower,l.foot])];
  const rotations=controls.map(o=>o.quaternion.clone()),rootPosition=rig.root.position.clone(),rootScale=rig.root.scale.clone(),height=rig.hips.position.y;
  controls.forEach(o=>o.quaternion.identity());rig.root.position.set(0,0,0);rig.root.scale.set(1,1,1);rig.hips.position.y=.925;
  if(rig.importedModel){rig.root.remove(rig.importedModel);rig.importedModel.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});}

  rig.root.traverse(o=>{if(o.isMesh&&o!==rig.ring)o.visible=false;});
  const model=clone(template);rig.root.add(model);rig.importedModel=model;
  const bone=name=>model.getObjectByName('mixamorig'+name),mapping=[];
  rig.root.updateMatrixWorld(true);
  function link(name,control,end,align=false){const b=bone(name);if(!b)return;const rest=b.getWorldQuaternion(Q());if(align){const direction=bone(end).getWorldPosition(V()).sub(b.getWorldPosition(V())).normalize();rest.premultiply(Q().setFromUnitVectors(direction,down));}mapping.push({bone:b,control,rest});}
  link('Hips',rig.hips);link('Spine',rig.torso);link('Spine1',rig.torso);link('Spine2',rig.torso);link('Neck',rig.torso);link('Head',rig.head);
  for(const [source,side]of [['Right','l'],['Left','r']]){const a=rig.arms[side],l=rig.legs[side];link(source+'Shoulder',rig.torso);link(source+'Arm',a.upper,source+'ForeArm',true);link(source+'ForeArm',a.lower,source+'Hand',true);link(source+'Hand',a.lower,source+'Hand',false);
   // Hands keep the same rest correction as the forearm so fingers follow the arm.
   const hand=mapping.at(-1),fore=mapping.at(-2);hand.rest.copy(fore.rest).multiply(bone(source+'ForeArm').getWorldQuaternion(Q()).invert()).multiply(bone(source+'Hand').getWorldQuaternion(Q()));
   link(source+'UpLeg',l.upper,source+'Leg',true);link(source+'Leg',l.lower,source+'Foot',true);link(source+'Foot',l.foot);
  }
  // Match editing controls to the imported limb lengths and shoulder/hip spacing.
  const origin=bone('Hips').getWorldPosition(V());
  for(const [source,side]of [['Right','l'],['Left','r']]){for(const [limb,upper,lower,end]of [[rig.arms[side],source+'Arm',source+'ForeArm',source+'Hand'],[rig.legs[side],source+'UpLeg',source+'Leg',source+'Foot']]){const a=bone(upper).getWorldPosition(V()),b=bone(lower).getWorldPosition(V()),c=bone(end).getWorldPosition(V());limb.upper.position.copy(a.clone().sub(origin));limb.lower.position.set(0,-a.distanceTo(b),0);(limb.hand||limb.foot).position.set(0,-b.distanceTo(c),0);}}
  mapping.sort((a,b)=>{const depth=o=>{let n=0;while(o.parent){n++;o=o.parent;}return n;};return depth(a.bone)-depth(b.bone);});
  let floorOffset=0;const hip=bone('Hips');
  rig.updateSkin=()=>{
   rig.root.updateMatrixWorld(true);
   for(const entry of mapping){const desired=entry.control.getWorldQuaternion(Q()).multiply(entry.rest);entry.bone.quaternion.copy(entry.bone.parent.getWorldQuaternion(Q()).invert().multiply(desired));if(entry.bone===hip){const pos=rig.hips.getWorldPosition(V());pos.y+=floorOffset*rig.root.getWorldScale(V()).y;entry.bone.position.copy(entry.bone.parent.worldToLocal(pos));}entry.bone.updateWorldMatrix(false,true);}
  };
  // Calibrate the skin's sole against the floor in a neutral stance.
  const previous=rig.hips.position.y;rig.hips.position.y=.925;rig.updateSkin();model.traverse(o=>{if(o.isSkinnedMesh)o.computeBoundingBox();});floorOffset=-new THREE.Box3().setFromObject(model).min.y;rig.hips.position.y=height;controls.forEach((o,i)=>o.quaternion.copy(rotations[i]));rig.root.position.copy(rootPosition);rig.root.scale.copy(rootScale);rig.updateSkin();
 };
}
