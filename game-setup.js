import * as THREE from 'three';
import {GLTFLoader} from './GLTFLoader.js';
import {parseCharacter} from './character-loader.js';
import {transferCharacterMaterials} from './character-materials.mjs';
import {createCharacterSkin} from './master-character.js';
import {createFighter} from './models.js';
const ROOT='./';
export async function loadRosterCharacter(id){
 const files=id==='master2'?['Master_2_MIXAMO.fbx','Master_2_txt.glb']:['Master_1_MIXAMO.fbx','Capoeira Game_Meshy V6_2026-10-29_02-01-17.glb'];
 const responses=await Promise.all(files.map(path=>fetch(ROOT+path)));if(responses.some(r=>!r.ok))throw Error('Could not load '+id);
 const buffers=await Promise.all(responses.map(r=>r.arrayBuffer()));const [rig,texture]=await Promise.all([parseCharacter(buffers[0],'fbx'),parseCharacter(buffers[1],'glb',false)]);
 transferCharacterMaterials(rig.root,texture.root,{flipY:true});return createCharacterSkin(rig.root);
}
export async function loadQuilombo(){
 const {scene:source}=await new GLTFLoader().loadAsync('./1_Quilombo_Meshy.glb');source.updateMatrixWorld(true);
 // Human-scale doorway: shrink the complete set uniformly, including its clearing.
 const origin=new THREE.Vector3(0,0,.48),ray=new THREE.Raycaster(new THREE.Vector3(0,2,.48),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(source,true)[0];if(!hit)throw Error('Could not locate the Quilombo clearing');origin.y=hit.point.y;
 const group=new THREE.Group();group.name='Quilombo';
 source.traverse(o=>{if(!o.isMesh)return;const geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);geometry.translate(-origin.x,-origin.y,-origin.z);geometry.scale(8,8,8);
  const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,z);if(r<2.98&&Math.abs(y)<.2){const blend=THREE.MathUtils.smoothstep(r,2.66,2.98);p.setY(i,y*blend);}}
  geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();const material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of Array.isArray(material)?material:[material]){m.side=THREE.DoubleSide;m.emissiveIntensity=.15;}const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
 });
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(250,250),new THREE.MeshStandardMaterial({color:'#697657',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-2.17;ground.receiveShadow=true;group.add(ground);
 const line=new THREE.Mesh(new THREE.RingGeometry(2.54,2.57,96),new THREE.MeshBasicMaterial({color:'#e4d0a2',transparent:true,opacity:.25,depthWrite:false}));line.rotation.x=-Math.PI/2;line.position.y=.012;group.add(line);
 return {world:group,spectators:[],arenaRadius:2.55};
}
export function readSetup(storage=localStorage){try{const data=JSON.parse(storage.getItem('roda-setup-v1'));return {character:data?.character==='master2'?'master2':'master1',scenario:data?.scenario==='quilombo'?'quilombo':'courtyard'};}catch{return {character:'master1',scenario:'courtyard'};}}
export class GameSetup{
 constructor({skins,worlds,scene,onCharacter,onScenario,onHome}){this.skins=skins;this.worlds=worlds;this.scene=scene;this.onCharacter=onCharacter;this.onScenario=onScenario;this.selection=readSetup();const host=document.createElement('div');host.id='setup-picker';host.innerHTML=`<div class="setup-label">01 <span>Choose your player</span></div><div class="setup-options character-options" role="group" aria-label="Choose your player"><button type="button" data-character="master1" aria-pressed="false"><img alt="Master 1 character preview"><span>Master_1</span><i>01</i></button><button type="button" data-character="master2" aria-pressed="false"><img alt="Master 2 character preview"><span>Master_2</span><i>02</i></button></div><div class="setup-label">02 <span>Choose your scenario</span></div><div class="setup-options scenario-options" role="group" aria-label="Choose your scenario"><button type="button" data-scenario="courtyard" aria-pressed="false"><img alt="Salvador courtyard preview"><span>Salvador</span><small>The courtyard</small></button><button type="button" data-scenario="quilombo" aria-pressed="false"><img alt="Quilombo tropical clearing preview"><span>Quilombo</span><small>The clearing</small></button></div><p id="setup-summary" aria-live="polite"></p>`;document.querySelector('.welcome').insertBefore(host,document.querySelector('.actions'));this.host=host;
 for(const button of host.querySelectorAll('[data-character]'))button.onclick=()=>this.choose('character',button.dataset.character);for(const button of host.querySelectorAll('[data-scenario]'))button.onclick=()=>this.choose('scenario',button.dataset.scenario);
 const home=document.createElement('button');home.id='setup-home';home.textContent='Change setup';document.querySelector('#app nav').prepend(home);home.onclick=onHome;
 this.makeThumbnails();this.onCharacter(this.selection.character);this.onScenario(this.selection.scenario);this.refresh();
 }
 choose(key,value){this.selection[key]=value;if(key==='character')this.onCharacter(value);else this.onScenario(value);try{localStorage.setItem('roda-setup-v1',JSON.stringify(this.selection));}catch{}this.refresh();}
 refresh(){for(const button of this.host.querySelectorAll('[data-character]'))button.setAttribute('aria-pressed',String(button.dataset.character===this.selection.character));for(const button of this.host.querySelectorAll('[data-scenario]'))button.setAttribute('aria-pressed',String(button.dataset.scenario===this.selection.scenario));document.getElementById('setup-summary').textContent=(this.selection.character==='master1'?'Master_1':'Master_2')+' / '+(this.selection.scenario==='courtyard'?'Salvador':'Quilombo');}
 makeThumbnails(){const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.setSize(280,230);const scene=new THREE.Scene();scene.background=new THREE.Color('#31473a');scene.add(new THREE.HemisphereLight('#fff6e4','#829886',2.5));const light=new THREE.DirectionalLight('#fff2db',3);light.position.set(3,5,4);scene.add(light);const camera=new THREE.PerspectiveCamera(30,280/230,.01,100);camera.position.set(0,1.35,3.8);camera.lookAt(0,1.1,0);
 for(const id of ['master1','master2']){const rig=createFighter();this.skins[id](rig);rig.hips.position.y=.925;rig.updateSkin();scene.add(rig.root);renderer.render(scene,camera);this.host.querySelector('[data-character="'+id+'"] img').src=renderer.domElement.toDataURL();scene.remove(rig.root);rig.root.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});}
 renderer.setSize(320,160);camera.aspect=2;camera.fov=48;camera.updateProjectionMatrix();const visibility=new Map(Object.values(this.worlds).map(w=>[w.world,w.world.visible]));for(const [id,w]of Object.entries(this.worlds)){for(const item of Object.values(this.worlds))item.world.visible=item===w;camera.position.set(id==='quilombo'?7:10,id==='quilombo'?8:13,id==='quilombo'?10:17);camera.lookAt(0,1,-2);renderer.render(this.scene,camera);this.host.querySelector('[data-scenario="'+id+'"] img').src=renderer.domElement.toDataURL();}for(const [obj,visible]of visibility)obj.visible=visible;renderer.dispose();
 }
}
