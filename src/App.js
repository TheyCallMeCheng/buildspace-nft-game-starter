import React from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { etheres, ethers } from 'ethers';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [currentAccount, setCurrentAccount] = React.useState(null);
  const [characterNFT, setCharacterNFT] = React.useState(null);

  const checkIfWalletIsConnected = async () => {
    try{
      const { ethereum } = window;

      if(!ethereum) {
        console.log("Make sure you have Metamask!");
        return;
      } else {

        console.log("We have the ethereum object", ethereum);      
        const accounts = await ethereum.request({ method: 'eth_accounts'});
       
        if(accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found authorized account ", account);
          setCurrentAccount(account);
        }else {
          console.log("No authorized account found");
        }
      }
    }catch(e){
      console.log(e);
    }
  };

  const renderContent = () => {
    if(!currentAccount){
      return(
        <div className='connect-wallet-container'>
          <img
            src='https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv'
            alt='monty python gif'
          />
          <button 
            className='cta-button connect-wallet-button'
            onClick={connectWalletAction}
          >
            Connect wallet to get started
          </button>
        </div>
      )
    } else if(currentAccount && !characterNFT){
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if(!ethereum){
        alert("Get metamask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected ", accounts[0]);
      setCurrentAccount(accounts[0]);
    }catch(e){
      console.log(e);
    }
  }

  React.useEffect(() => {
    checkIfWalletIsConnected();
    const checkNetwork = async () => {
      try {
        if(window.ethereum.networkVersion !== "4"){
          alert("Please connect to rinkeby!");
        }
      }catch(e) {
        console.log(e)
      }
    }
  }, [])

  React.useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }
    };
  
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
