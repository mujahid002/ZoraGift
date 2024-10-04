import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ConnectButton: React.FC<Props> = ({ setAccount }) => {
  const [disabled, setDisabled] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  // Sepolia Testnet network parameters
  const ZORA_TESTNET_PARAMS = {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia.org'], // Update with the correct Sepolia RPC URL
    blockExplorerUrls: ['https://sepolia.etherscan.io/'], // Update with the correct Sepolia explorer URL
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setCurrentAccount(accounts[0]);
      setAccount(accounts[0]);
    } else {
      setCurrentAccount(null);
      setAccount(null);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const switchToSepoliaTestnet = async () => {
    const { ethereum } = window;

    if (typeof ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask and try again.');
      return;
    }

    try {
      // Try to switch to the Sepolia Testnet network
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ZORA_TESTNET_PARAMS.chainId }],
      });
    } catch (switchError: any) {
      // If the chain is not available, add it
      if (switchError.code === 4902) {
        try {
          // Add the Sepolia Testnet network
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ZORA_TESTNET_PARAMS],
          });
          // After adding, switch to the network
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ZORA_TESTNET_PARAMS.chainId }],
          });
        } catch (addError) {
          console.error('Failed to add the Sepolia Testnet network:', addError);
          alert('Failed to add the Sepolia Testnet network.');
        }
      } else {
        console.error('Failed to switch to the Sepolia Testnet network:', switchError);
        alert('Failed to switch to the Sepolia Testnet network.');
      }
    }
  };

  const connect = async () => {
    const { ethereum } = window;

    try {
      setDisabled(true);
      if (typeof ethereum === 'undefined') {
        alert('Please install MetaMask or another Ethereum-compatible wallet!');
        return;
      }

      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      handleAccountsChanged(accounts);

      // Check the current network and switch if necessary
      const chainId = await ethereum.request({ method: 'eth_chainId' });

      if (chainId !== ZORA_TESTNET_PARAMS.chainId) {
        await switchToSepoliaTestnet(); // Switch to Sepolia Testnet if not on the right network
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setDisabled(false);
    }
  };

  const disconnect = () => {
    setCurrentAccount(null);
    setAccount(null);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={currentAccount ? disconnect : connect}
      className="rounded-lg px-8 font-semibold"
    >
      {currentAccount ? 'Disconnect' : 'Connect Wallet'}
    </Button>
  );
};

export default ConnectButton;
