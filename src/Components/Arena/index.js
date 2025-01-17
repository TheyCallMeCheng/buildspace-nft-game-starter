import React from "react"
import { Contract, ethers } from "ethers"
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants"
import myEpicGame from "../../utils/MyEpicGame.json"
import "./Arena.css"

const Arena = ({ characterNFT, setCharacterNFT, currentAccount }) => {
    const [gameContract, setGameContract] = React.useState(null)
    const [boss, setBoss] = React.useState(null)
    const [attackState, setAttackState] = React.useState('')

    React.useEffect(() => {
        const { ethereum } = window

        if(ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            )

            setGameContract(gameContract)
        } else {
            console.log("Ethereum object not found")
        }
    }, []);

    React.useEffect(() => {
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            console.log("Boss: ", bossTxn)
            setBoss(transformCharacterData(bossTxn))
        }

        const onAttackComplete = (from, newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber()
            const playerHp = newPlayerHp.toNumber()
            const sender = from.toString()

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`)

            if(currentAccount === sender.toLowerCase()){
                setBoss((prevState) => {
                    return { ...prevState, hp: bossHp}
                })
                setCharacterNFT((prevState) => {
                    return { ...prevState, hp: playerHp}
                })
            }else {
                setBoss((prevState) => {
                    return { ...prevState, hp: bossHp}
                })
            }
        }

        if(gameContract){
            fetchBoss();
        }

        return () => {
            if(gameContract){
                gameContract.off("AttackComplete", onAttackComplete)
            }
        }

    }, [gameContract]);

    const runAttackAction = async () => {
        try{
            if(gameContract) {
                setAttackState('attacking')
                console.log('Attacking boss...')
                const attackTxn = await gameContract.attackBoss();
                await attackTxn.wait()
                console.log("Attack txn: ", attackTxn)
                setAttackState('hit')
            }
        }catch (e) {
            console.log("Error attacking boss: ", e)
            setAttackState('')
        }
    }

    return (
        <div className="arena-container">
            {boss && (
                <div className="boss-container">
                    <div className={`boss-content ${attackState}`}>
                        <h2>🔥 {boss.name} 🔥</h2>
                        <div className="image-content">
                            <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
                            <div className="health-bar">
                                <progress value={boss.hp} max={boss.maxHp} />
                                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                            </div>
                        </div>
                        <div className="attack-container">
                            <button className="cta-button" onClick={runAttackAction}>
                                {`💥 Attack ${boss.name}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {characterNFT && (
                <div className="players-container">
                    <div className="player-container">
                        <h2>Your Character</h2>
                        <div className="player">
                            <div className="image-content">
                                <h2>{characterNFT.name}</h2>
                                <img
                                    src={characterNFT.imageURI}
                                    alt={`Character ${characterNFT.name}`}
                                />
                                <div className="health-bar">
                                    <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                                    <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                                </div>
                            </div>
                            <div className="stats">
                                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    
};

export default Arena;
