export function animationRole(move,bundle){if(!move)return null;for(const role of ['idle','knockdown'])if(move.id===role||move.creditKey===role||Object.values(bundle?.characterAnimations||{}).some(links=>links?.[role]===move.id))return role;return null;}
export function canUseMove(move,characterId){return !move.characters||move.characters.includes(characterId);}
export function availableMoves(moves,characterId){return Object.fromEntries(Object.entries(moves).filter(([,m])=>canUseMove(m,characterId)));}
