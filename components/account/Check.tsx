// components/account/Check.tsx
// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZORA_TESTNET_PARAMS } from "@/lib/networks";

export function Check() {
  const [account, setAccount] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkNetwork(); // Check the network after getting the account
        } else {
          setAccount(null);
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setAccount(null);
      }
    } else {
      console.log("MetaMask is not installed!");
      setAccount(null);
    }
  };

  const checkNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        // Check if the user is connected to Zora Sepolia Testnet
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

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask or another Ethereum-compatible wallet!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]); // Set the first connected account
      await checkNetwork(); // Check the network after connecting
      if (!isCorrectNetwork) {
        await switchToZoraSepoliaTestnet();
      }
    } catch (err) {
      console.error("Error connecting to wallet:", err);
    }
  };

  const switchToZoraSepoliaTestnet = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ZORA_TESTNET_PARAMS.chainId }],
      });
      setIsCorrectNetwork(true);
    } catch (err: any) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ZORA_TESTNET_PARAMS],
          });

          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ZORA_TESTNET_PARAMS.chainId }],
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
        console.error("Failed to switch network:", err);
        alert("Failed to switch to the Zora Sepolia Testnet network.");
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkWalletConnection();
    };
    initialize();
  }, []);

  return (
    <div className="mx-4 flex p-24 shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <svg
          width="100px"
          height="100px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 16C9 16.5523 8.55228 17 8 17C7.44772 17 7 16.5523 7 16C7 15.4477 7.44772 15 8 15C8.55228 15 9 15.4477 9 16Z"
            fill="#1C274C"
          />
          <path
            d="M13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16Z"
            fill="#1C274C"
          />
          <path
            d="M17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16Z"
            fill="#1C274C"
          />
          <path
            d="M6 10V8C6 7.65929 6.0284 7.32521 6.08296 7M18 10V8C18 4.68629 15.3137 2 12 2C10.208 2 8.59942 2.78563 7.5 4.03126"
            stroke="#1C274C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M11 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15"
            stroke="#1C274C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold">Connect Wallet</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground m-2">
          {account
            ? isCorrectNetwork
              ? "Wallet connected!"
              : "Please switch to the Zora Sepolia Testnet network."
            : "You are currently not signed in. Please connect your wallet to continue."}
        </p>
        {!account && (
          <Button onClick={connectWallet} className="mt-4">
            Connect Wallet
          </Button>
        )}
        {account && !isCorrectNetwork && (
          <Button onClick={switchToZoraSepoliaTestnet} className="mt-4">
            Switch to Zora Sepolia Testnet
          </Button>
        )}
      </div>
    </div>
  );
}
