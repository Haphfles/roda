import {scaleCharacter} from './character-physique.mjs?v=v0.1.28';
import {readStats,statEffects} from './character-stats.mjs?v=v0.1.28';
import {createFighter,poseFighter} from './models.js?v=v0.1.28';
export function opponentOptions(skins,player){return Object.keys(skins).filter(id=>id!==player);}
export class OpponentPicker{
 constructor(setup,match,rig,carousel,worlds){
  Object.assign(this,{setup,match,rig,carousel,worlds});this.last='';this.clock=0;
  try{this.selected=localStorage.getItem('roda-opponent-v1');}catch{}
  const label=document.createElement('label');label.className='opponent-picker';label.textContent='Choose your opponent';this.select=document.createElement('select');this.select.setAttribute('aria-label','Choose your opponent');label.append(this.select);setup.host.querySelector('.scenario-options').previousElementSibling.before(label);this.host=label;
  this.select.onchange=()=>{this.selected=this.select.value;this.sync(true);};
  for(const world of Object.values(worlds)){for(const s of world.spectators)s.rig.root.visible=false;world.spectators=[];}
  const choose=setup.choose.bind(setup);setup.choose=(...args)=>{choose(...args);this.sync(true);};
  this.observer=new MutationObserver(()=>this.sync());this.observer.observe(setup.host.querySelector('.character-options'),{childList:true,subtree:true});this.sync(true);
 }
 sync(force=false){
  const ids=opponentOptions(this.setup.skins,this.setup.selection.character),signature=ids.join('|')+'|'+this.setup.selection.character;
  if(!ids.includes(this.selected))this.selected=ids[0];
  if(signature!==this.last){this.select.replaceChildren();for(const id of ids){const option=document.createElement('option');option.value=id;option.textContent=this.setup.skins[id].displayName||id;this.select.append(option);}this.last=signature;force=true;}
  this.select.value=this.selected||'';this.select.disabled=!ids.length;
  if(force&&this.selected){if(this.match.b.characterId!==this.selected||this.loaded!==this.setup.skins[this.selected]){this.setup.skins[this.selected](this.rig);this.loaded=this.setup.skins[this.selected];}this.match.b.characterId=this.selected;this.match.b.stats=readStats(this.selected);scaleCharacter(this.rig,this.selected,this.setup.selection.scenario==='quilombo'?1.3:1);try{localStorage.setItem('roda-opponent-v1',this.selected);}catch{}}
 }
 update(dt,ready){
  this.sync();this.clock+=dt;
  if(ready){for(const rig of this.carousel.rigs.values()){if(rig.root.parent!==this.carousel.scene)this.carousel.scene.add(rig.root);rig.root.visible=true;}return;}
  const watchers=opponentOptions(this.setup.skins,this.setup.selection.character).filter(id=>id!==this.selected),radius=(this.worlds[this.setup.selection.scenario].arenaRadius??4.5)+(this.setup.selection.scenario==='quilombo'?.9:1.25);
  // Reuse the opening lineup's models: no extra model downloads or duplicate character meshes.
  for(const [id,rig]of this.carousel.rigs)if(!watchers.includes(id))rig.root.visible=false;
  watchers.forEach((id,i)=>{let rig=this.carousel.rigs.get(id);if(!rig){rig=createFighter();this.setup.skins[id](rig);this.carousel.rigs.set(id,rig);}if(rig.root.parent!==this.setup.scene)this.setup.scene.add(rig.root);rig.root.visible=true;
   const angle=watchers.length===1?0:-Math.PI*.65+i*Math.PI*1.3/(watchers.length-1),x=Math.sin(angle)*radius,z=-Math.cos(angle)*radius;
   poseFighter(rig,{x,z,heading:Math.atan2(-x,-z),action:'idle',t:0},this.clock+i);scaleCharacter(rig,id,this.setup.selection.scenario==='quilombo'?1.3:1);
   rig.arms.l.upper.rotation.set(-.8,0,-.45);rig.arms.r.upper.rotation.set(-.8,0,.45);rig.arms.l.lower.rotation.set(-1,0,Math.sin(this.clock*4)*.2-.5);rig.arms.r.lower.rotation.set(-1,0,-Math.sin(this.clock*4)*.2+.5);rig.updateSkin?.();
  });
 }
}
