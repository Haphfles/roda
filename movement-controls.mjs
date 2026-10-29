export const MOVE_KEYS=['j','k','l','u','i','o'];
export function controlRows(bindings,moves){return MOVE_KEYS.map(key=>{const id=bindings?.[key],move=moves[id];return {key,id:move?id:null,name:move?.name||'Unassigned',kind:move?.kind};});}
export function resolveMovement(key,bindings,moves){if(key===' '){return controlRows(bindings,moves).find(row=>row.kind==='dodge')?.id||null;}const id=bindings?.[key];return id&&moves[id]?id:null;}
