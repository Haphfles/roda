// Reuse material maps from the original textured model without changing the rig or geometry.
export function transferCharacterMaterials(target,source,{flipY=true}={}){
 const materials=new Set();source.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m);});
 const donors=[...materials];if(!donors.length||!donors.some(m=>m.map))throw Error('The GLB has no colour textures to transfer.');
 const changes=[],cache=new Map(),key=m=>(m.name||'').trim().toLowerCase();
 target.traverse(o=>{if(!o.isMesh)return;if(!o.geometry.getAttribute('uv'))throw Error('The rigged model has no UVs. Export the same original mesh through Mixamo.');
  const matched=(Array.isArray(o.material)?o.material:[o.material]).map(original=>{
   const candidates=donors.filter(m=>key(m)&&key(m)===key(original));
   const donor=candidates.length===1?candidates[0]:donors.length===1?donors[0]:null;
   if(!donor)throw Error('Could not match material '+(original?.name||'(unnamed)')+'. Keep the original material names or use a single colour texture.');
   if(!cache.has(donor)){const material=donor.clone();for(const [name,texture]of Object.entries(material))if(texture?.isTexture){const map=texture.clone();map.flipY=flipY;
    // WebGL ignores texture.flipY for ImageBitmap sources created by GLTFLoader.
    // Apply the equivalent V flip in texture coordinates instead.
    if(flipY&&typeof ImageBitmap!=='undefined'&&map.image instanceof ImageBitmap){map.updateMatrix();const verticalFlip=map.matrix.clone().set(1,0,0,0,-1,1,0,0,1);map.matrix.premultiply(verticalFlip);map.matrixAutoUpdate=false;map.flipY=false;}
    map.needsUpdate=true;material[name]=map;}cache.set(donor,material);}
   return cache.get(donor);
  });changes.push([o,Array.isArray(o.material)?matched:matched[0]]);
 });
 for(const [mesh,material]of changes)mesh.material=material;
 return changes.length;
}
