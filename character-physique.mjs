// Physical measurements are loaded separately from owner-editable combat credits.
const profiles=new Map();
export const DEFAULT_PHYSIQUE=Object.freeze({height:175,weight:75});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function normalizePhysique(p={}){return {height:clamp(Number.isFinite(Number(p.height))?Number(p.height):175,120,220),weight:clamp(Number.isFinite(Number(p.weight))?Number(p.weight):75,35,160)};}
export function setPhysique(id,p){profiles.set(id,normalizePhysique(p));}
export function readPhysique(id){return {...(profiles.get(id)||DEFAULT_PHYSIQUE)};}
export function physiqueEffects(id){const p=readPhysique(id);return {height:p.height/175,mass:clamp(Math.sqrt(p.weight/75),.75,1.35),mobility:clamp((75/p.weight)**.12,.9,1.1)};}
export function scaleCharacter(rig,id,sceneScale=1){const p=readPhysique(id),factor=(p.height/100)/(rig.characterHeight||1.75);rig.root.scale.setScalar(sceneScale*factor);return factor;}
