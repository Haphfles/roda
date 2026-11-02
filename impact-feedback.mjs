export const isHardHit=damage=>Number.isFinite(damage)&&damage>=18;
export function impactStrength(damage){return isHardHit(damage)?Math.min(1,Math.max(.35,damage/40)):0;}
export function vibrationPattern(strength,received=true){const s=Math.max(0,Math.min(1,Number(strength)||0));return received?[Math.round(35+55*s),25,Math.round(20+35*s)]:[Math.round(20+25*s)];}
export class ImpactShake{
 constructor(){this.clear();}
 clear(){this.time=0;this.strength=0;}
 hit(strength){this.time=.28;this.strength=Math.max(this.strength,Math.min(1,strength));}
 sample(dt,reduced=false){this.time=Math.max(0,this.time-dt);if(!this.time||reduced){if(!this.time)this.strength=0;return [0,0,0];}const t=.28-this.time,a=.12*this.strength*(this.time/.28)**2;return [Math.sin(t*93)*a,Math.sin(t*117)*a*.6,Math.sin(t*71)*a*.35];}
}

export function vibrateImpact(device,strength,received=true){try{return !!device?.vibrate?.(vibrationPattern(strength,received));}catch{return false;}}
