import {assetBuffer} from './loading-progress.js?v=v0.1.16';
import * as THREE from 'three';
import {transferCharacterMaterials} from './character-materials.mjs?v=v0.1.16';
import {FBXLoader} from './FBXLoader.js?v=v0.1.16';
import {GLTFLoader} from './GLTFLoader.js?v=v0.1.16';
import {createCharacterSkin} from './master-character.js?v=v0.1.16';
const $=id=>document.getElementById(id),white='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aMZkAAAAASUVORK5CYII=';
export async function parseCharacter(buffer,ext,requireRig=true){
 const manager=new THREE.LoadingManager();let missing=false;const urls=[];
 manager.setURLModifier(url=>{if(url.startsWith('blob:')){urls.push(url);return url;}if(url.startsWith('data:'))return url;missing=true;return white;});
 let root;try{root=ext==='glb'?(await new GLTFLoader(manager).parseAsync(buffer,'')).scene:new FBXLoader(manager).parse(buffer,'');if(requireRig)createCharacterSkin(root);return {root,missing};}finally{ /* Embedded image URLs stay alive until their image load completes. */ for(const url of urls)setTimeout(()=>URL.revokeObjectURL(url),10000);}
}
export async function loadCharacterAssignment(entry){const {root}=await parseCharacter(await assetBuffer('./'+entry.path),entry.path.endsWith('.glb')?'glb':'fbx');if(entry.texture?.endsWith('.glb')){await applyGLBTextures(root,await assetBuffer('./'+entry.texture),entry.path.endsWith('.glb'));}else if(entry.texture){const map=await new THREE.TextureLoader().loadAsync('./'+entry.texture);applyTexture(root,map,entry.path.endsWith('.glb'));}return createCharacterSkin(root,entry);}
async function applyGLBTextures(root,buffer,glb){const donor=await parseCharacter(buffer,'glb',false);if(donor.missing)throw Error('The texture GLB must contain its images. Export with embedded textures.');return transferCharacterMaterials(root,donor.root,{flipY:!glb});}
function applyTexture(root,map,glb){map.colorSpace=THREE.SRGBColorSpace;map.flipY=!glb;root.traverse(o=>{if(o.isMesh)o.material=new THREE.MeshStandardMaterial({map,roughness:.85,metalness:0,side:THREE.DoubleSide});});}