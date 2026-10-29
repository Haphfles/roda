export function canUseMove(move,characterId){return !move.characters||move.characters.includes(characterId);}
export function availableMoves(moves,characterId){return Object.fromEntries(Object.entries(moves).filter(([,m])=>canUseMove(m,characterId)));}
