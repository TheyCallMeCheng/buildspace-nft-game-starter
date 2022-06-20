const CONTRACT_ADDRESS = '0xf823B8182740432949163453f33fC8aeB52912d4';

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber()
    }
}

export { CONTRACT_ADDRESS, transformCharacterData };