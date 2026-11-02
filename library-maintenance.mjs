import {clone,validateBundle} from './movement-data.mjs?v=v0.1.29';
export const LIBRARY_LIMIT=160;
const stable=value=>JSON.stringify(canonical(value));
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
function body(move){if(!move)return null;const m=clone(move);delete m.id;if(m.characters)m.characters.sort();return m;}
// Only combine exact copies in the same character scope with the same explicit credit identity.
// Different takes, edits, assignments, publication states and independent credit identities survive.
export function cleanLibrary(input){const bundle=validateBundle(input),seen=new Map(),aliases=new Map(),applied=new Map(bundle.applied.map(m=>[m.id,m]));
 for(const m of bundle.moves){if(!m.creditKey||['idle','knockdown'].includes(m.id))continue;const key=stable([body(m),body(applied.get(m.id))]);if(seen.has(key))aliases.set(m.id,seen.get(key));else seen.set(key,m.id);}
 if(!aliases.size)return {bundle,removed:0};
 bundle.moves=bundle.moves.filter(m=>!aliases.has(m.id));bundle.applied=bundle.applied.filter(m=>!aliases.has(m.id));
 for(const map of [bundle.bindings,...Object.values(bundle.characterBindings||{}),...Object.values(bundle.characterAnimations||{})])for(const key of Object.keys(map))if(aliases.has(map[key]))map[key]=aliases.get(map[key]);
 return {bundle:validateBundle(bundle),removed:aliases.size};
}
