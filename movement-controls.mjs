import {animationRole} from './movement-access.mjs?v=v0.1.32';
export const DEFAULT_MOVE_KEYS=['j','k','l','u','i','o'];
export const MOVE_KEYS=[...DEFAULT_MOVE_KEYS,...'bcfghmntvxyz0123456789'];
export function bindingError(key,bindings,id,moves=[]){if(!key)return '';if(!MOVE_KEYS.includes(key))return 'Use a letter or number. W A S D Q E P R and Space are reserved.';const other=bindings?.[key];return other&&other!==id?'Key '+key.toUpperCase()+' is assigned to '+(moves.find(m=>m.id===other)?.name||'another golpe')+'. Clear that assignment first.':'';}

export function controlRows(bindings,moves){return [...DEFAULT_MOVE_KEYS,...MOVE_KEYS.filter(k=>!DEFAULT_MOVE_KEYS.includes(k)&&bindings?.[k])].map(key=>{const id=bindings?.[key],candidate=moves[id],move=animationRole(candidate)?null:candidate;return {key,id:move?id:null,name:move?.name||'Unassigned',kind:move?.kind};});}
export function resolveMovement(key,bindings,moves){if(key===' '){return controlRows(bindings,moves).find(row=>row.kind==='dodge')?.id||null;}const id=bindings?.[key];return id&&moves[id]&&!animationRole(moves[id])?id:null;}
