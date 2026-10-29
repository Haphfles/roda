const sharedStats=new Map();
export const STAT_KEYS=['size','kicks','power','defense'];
export const CREDIT_BUDGET=12;
export const DEFAULT_STATS={size:3,kicks:3,power:3,defense:3};
export function spentCredits(stats){return STAT_KEYS.reduce((n,k)=>n+(stats[k]||0),0)+Object.values(stats.moveCredits||{}).reduce((n,m)=>n+(m.speed||0)+(m.power||0),0);}
export function normalizeStats(value){const stats=Object.fromEntries(STAT_KEYS.map(k=>[k,Math.max(0,Math.min(6,Math.floor(Number(value?.[k])||0)))]));stats.moveCredits={};for(const [id,m] of Object.entries(value?.moveCredits||{}).slice(0,40))if(/^[a-z0-9_-]{1,80}$/.test(id))stats.moveCredits[id]={speed:Math.max(0,Math.min(6,Math.floor(Number(m?.speed)||0))),power:Math.max(0,Math.min(6,Math.floor(Number(m?.power)||0)))};return spentCredits(stats)>CREDIT_BUDGET?{...DEFAULT_STATS,moveCredits:{}}:stats;}
export function setSharedStats(id,stats){sharedStats.set(id,normalizeStats(stats));}
export function saveCharacterStats(id,stats){setSharedStats(id,stats);try{localStorage.setItem('roda-build-'+id,JSON.stringify(normalizeStats(stats)));}catch{}if(typeof window!=='undefined')window.dispatchEvent(new Event('roda-build-changed'));}
export function readStats(id){if(sharedStats.has(id))return structuredClone(sharedStats.get(id));try{const value=JSON.parse(localStorage.getItem('roda-build-'+id));return value?normalizeStats(value):{...DEFAULT_STATS,moveCredits:{}};}catch{return {...DEFAULT_STATS,moveCredits:{}};}}
export function statEffects(stats=DEFAULT_STATS){const s=normalizeStats(stats);return {size:1+(s.size-3)*.02,speed:1+(s.kicks-3)*.04,power:1+(s.power-3)*.05,defense:1-(s.defense-3)*.04};}
export function moveEffects(stats,move){const effect=statEffects(stats),credits=stats?.moveCredits?.[move?.creditKey||move?.id];return {...effect,speed:effect.speed*(1+(credits?.speed||0)*.08),power:effect.power*(1+(credits?.power||0)*.08)};}
