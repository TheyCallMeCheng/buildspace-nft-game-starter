import React from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json"
import LoadingIndicator from "../LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {

    const [characters, setCharacters] = React.useState([])
    const [gameContract, setGameContract] = React.useState(null)
    const [mintingCharacter, setMintingCharacter] = React.useState(false)

    React.useEffect(() => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            )

            setGameContract(gameContract);
        }else {
            console.log("Ethereum object not found");
        }
    }, [])

    React.useEffect(() => {
        const getCharacters = async () => {
            try{
                console.log("Getting contract characters to mint");
    
                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log("CharactersTXN: ", charactersTxn);

                const characters = charactersTxn.map((charactersData) => 
                    transformCharacterData(charactersData)
                )

                setCharacters(characters)
            }catch(e) {
                console.log("error:", e)
            }
        }

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`)    
            if(gameContract){
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log("Character NFT: ", characterNFT)
                setCharacterNFT(transformCharacterData(characterNFT))
            }
        }

        

        if(gameContract){
            getCharacters()
            gameContract.on("CharacterNFTMinted", onCharacterMint)
        }

        return () => {
            if(gameContract){
                gameContract.off("CharacterNFTMinted", onCharacterMint)
            }
        }
    }, [gameContract])

    const renderCharacters = () => 
        characters.map((character, index) => (
            <div className="character-item" key={character.name}>
                <div className="name-container">
                    <p>
                        {character.name}
                    </p>
                </div>
                <img src={character.imageURI} alt={character.name} />
                <button
                    type="button"
                    className="character-mint-button"
                    onClick={()=> mintCharacterNFTaction(index)}
                >
                    {`Mint ${character.name}`}
                </button>
            </div>
        ));

    const mintCharacterNFTaction = async (characterId) => {
        try{
            setMintingCharacter(true)
            console.log("Minting character in progress...")
            const mintTxn = await gameContract.mintCharacterNFT(characterId)
            await mintTxn.wait();
            console.log("mintTxn: ", mintTxn)            
        }catch(e) {
            console.log(e);
            setMintingCharacter(false);
        }
    }

    
    return(
        <div className="select-character-container">
            <h2>
                Mint your Hero, Choose Wisely.
            </h2>
            {characters.length > 0 && (
                <div className="character-grid"> {renderCharacters()}</div>
            )}

            {mintingCharacter && (
                <div className="loading">
                    <div className="indicator">
                        <LoadingIndicator />
                        <p>Minting in progress...</p>
                    </div>
                    <img
                        src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
                        alt="Minting loading indicator"
                    />
                </div>
            )}
        </div>
    ); 
};

export default SelectCharacter;