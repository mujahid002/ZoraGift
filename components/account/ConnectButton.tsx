// components/ConnectButton.tsx
// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZORA_TESTNET_PARAMS } from "@/lib/networks";

interface Props {
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
}

const ConnectButton: React.FC<Props> = ({ setAccount }) => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Check if the user is already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then(handleAccountsChanged)
        .catch((err: any) => {
          console.error(err);
        });

      checkNetwork();
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setCurrentAccount(accounts[0]);
      setAccount(accounts[0]);
      checkNetwork();
    } else {
      setCurrentAccount(null);
      setAccount(null);
    }
  };

  const handleChainChanged = () => {
    checkNetwork();
    window.location.reload();
  };

  const checkNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== ZORA_TESTNET_PARAMS.chainId) {
          setIsCorrectNetwork(false);
        } else {
          setIsCorrectNetwork(true);
        }
      } catch (err) {
        console.error("Error checking network:", err);
      }
    }
  };

  const switchToZoraSepoliaTestnet = async () => {
    const { ethereum } = window;

    if (typeof ethereum === "undefined") {
      alert(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
      return;
    }

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ZORA_TESTNET_PARAMS.chainId }],
      });
      setIsCorrectNetwork(true);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ZORA_TESTNET_PARAMS],
          });
          setIsCorrectNetwork(true);
        } catch (addError) {
          console.error(
            "Failed to add the Zora Sepolia Testnet network:",
            addError
          );
          alert("Failed to add the Zora Sepolia Testnet network.");
        }
      } else {
        console.error(
          "Failed to switch to the Zora Sepolia Testnet network:",
          switchError
        );
        alert("Failed to switch to the Zora Sepolia Testnet network.");
      }
    }
  };

  const connect = async () => {
    const { ethereum } = window;

    try {
      setDisabled(true);
      if (typeof ethereum === "undefined") {
        alert("Please install MetaMask or another Ethereum-compatible wallet!");
        return;
      }

      // Request account access
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      handleAccountsChanged(accounts);

      // Check the current network and switch if necessary
      await checkNetwork();
      if (!isCorrectNetwork) {
        await switchToZoraSepoliaTestnet();
      }
    } catch (error) {
      console.error("Connection error:", error);
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
      {currentAccount ? "Disconnect" : "Connect Wallet"}
    </Button>
  );
};

export default ConnectButton;
