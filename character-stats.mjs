export const STAT_KEYS=['size','kicks','power','defense'];
export const CREDIT_BUDGET=12;
export const DEFAULT_STATS={size:3,kicks:3,power:3,defense:3};
export function normalizeStats(value){const stats=Object.fromEntries(STAT_KEYS.map(k=>[k,Math.max(0,Math.min(6,Math.floor(Number(value?.[k])||0)))]));return Object.values(stats).reduce((a,b)=>a+b,0)>CREDIT_BUDGET?{...DEFAULT_STATS}:stats;}
export function readStats(id){try{const value=JSON.parse(localStorage.getItem('roda-build-'+id));return value?normalizeStats(value):{...DEFAULT_STATS};}catch{return {...DEFAULT_STATS};}}
export function statEffects(stats=DEFAULT_STATS){const s=normalizeStats(stats);return {size:1+(s.size-3)*.02,speed:1+(s.kicks-3)*.04,power:1+(s.power-3)*.05,defense:1-(s.defense-3)*.04};}
