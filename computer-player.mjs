import {statEffects} from './character-stats.mjs?v=v0.1.26';
import {canUseMove} from './movement-access.mjs?v=v0.1.26';
import {physiqueEffects} from './character-physique.mjs?v=v0.1.26';
export function updateComputer(match,dt,moves,random=Math.random){
 const b=match.b,p=match.p,brain=match.brain??={wait:.45,recent:[],orbit:1};
 const attacks=Object.entries(moves).filter(([id,m])=>m.kind==='attack'&&canUseMove(m,b.characterId)&&b.energy>=m.cost);
 const dx=p.x-b.x,dz=p.z-b.z,d=Math.hypot(dx,dz),reach=statEffects(b.stats).size*physiqueEffects(b.characterId).height;
 const ranges=attacks.map(([,m])=>m.range*reach).filter(Number.isFinite),target=ranges.length?Math.max(1.1,Math.min(1.8,Math.min(...ranges)*.8)):1.6;
 if(b.action==='idle'){
  const speed=d>target+.12?2.65*physiqueEffects(b.characterId).mobility:d<target-.25?-1.35:0;
  const orbit=d<target+.5?.45*brain.orbit:0,n=d||1;
  const vx=dx/n*speed-dz/n*orbit,vz=dz/n*speed+dx/n*orbit;
  b.x+=vx*dt;b.z+=vz*dt;b.moving=Math.hypot(vx,vz)>.01;
  if(b.moving)b.lastDirection={x:vx/Math.hypot(vx,vz),z:vz/Math.hypot(vx,vz),side:0};
 }
 brain.wait-=dt;if(brain.wait>0||b.action!=='idle')return;
 brain.wait=.24+random()*.24;if(random()<.15)brain.orbit*=-1;
 if(p.action==='knockdown'||p.grace>0)return;
 const dodge=Object.entries(moves).filter(([,m])=>m.kind==='dodge'&&canUseMove(m,b.characterId)&&b.energy>=m.cost);
 if(moves[p.action]?.kind==='attack'&&p.t>.1&&d<2.6&&dodge.length&&random()<.55){match.act(b,dodge[Math.min(dodge.length-1,Math.floor(random()*dodge.length))][0]);return;}
 let options=attacks.filter(([,m])=>d<=m.range*reach*.92);
 // Prefer another legal kick; recent moves remain possible when the library is small.
 if(options.length>1)options=options.filter(([id])=>id!==brain.recent.at(-1));
 const weighted=options.map(([id,m])=>({id,weight:(brain.recent.includes(id)?.35:1)*(b.energy<35?(1/(1+m.cost/20)):1)}));
 let pick=random()*weighted.reduce((n,o)=>n+o.weight,0);
 for(const o of weighted){pick-=o.weight;if(pick<=0){if(match.act(b,o.id)){brain.recent.push(o.id);brain.recent=brain.recent.slice(-3);}break;}}
}
