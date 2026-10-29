import * as THREE from 'three';
import {FBXLoader} from './FBXLoader.js';
import {GLTFLoader} from './GLTFLoader.js';
import {createCharacterSkin} from './master-character.js';
const $=id=>document.getElementById(id),white='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aMZkAAAAASUVORK5CYII=';
export async function parseCharacter(buffer,ext,requireRig=true){
 const manager=new THREE.LoadingManager();let missing=false;const urls=[];
 manager.setURLModifier(url=>{if(url.startsWith('blob:')){urls.push(url);return url;}if(url.startsWith('data:'))return url;missing=true;return white;});
 let root;try{root=ext==='glb'?(await new GLTFLoader(manager).parseAsync(buffer,'')).scene:new FBXLoader(manager).parse(buffer,'');if(requireRig)createCharacterSkin(root);return {root,missing};}finally{ /* Embedded image URLs stay alive until their image load completes. */ for(const url of urls)setTimeout(()=>URL.revokeObjectURL(url),10000);}
}