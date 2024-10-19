// components/account/AccountMenu.tsx
// @ts-nocheck
"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZORA_TESTNET_PARAMS } from "@/lib/networks";

const AccountMenu = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      // Check network when accounts change
      checkNetwork();
    } else {
      setAccount(null);
    }
  };

  const handleChainChanged = () => {
    checkNetwork();
    window.location.reload();
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // Check if the user is already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then(handleAccountsChanged)
        .catch((err: string) => {
          console.error(err);
        });

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Check network on load
      checkNetwork();
    } else {
      console.log("Please install MetaMask!");
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
  }, []);

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
    if (!ethereum) {
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
      // @ts-ignore
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
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask or another Ethereum-compatible wallet!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      handleAccountsChanged(accounts);
      await checkNetwork();
      if (!isCorrectNetwork) {
        await switchToZoraSepoliaTestnet();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const disconnect = () => {
    setAccount(null);
  };

  const switchAccount = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask or another Ethereum-compatible wallet!");
        return;
      }

      // Prompt the user to select an account
      const accounts = await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      if (accounts) {
        const updatedAccounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        handleAccountsChanged(updatedAccounts);
      }
    } catch (err) {
      console.error("Error switching accounts:", err);
    }
  };

  const shortenAddress = (address: string) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  return (
    <div className="text-lg">
      <Menubar className="rounded-none border-none px-2 lg:px-4">
        {account ? (
          isCorrectNetwork ? (
            <MenubarMenu>
              <MenubarTrigger className="flex items-center p-2 border border-purple-600 rounded-full">
                <div className="flex text-sm font-semibold">
                  {shortenAddress(account)}
                </div>
              </MenubarTrigger>
              <MenubarContent forceMount>
                <MenubarItem inset onSelect={switchAccount}>
                  Switch Account
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem inset onSelect={disconnect}>
                  Disconnect
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          ) : (
            <Button variant="outline" onClick={switchToZoraSepoliaTestnet}>
              Switch to Zora Sepolia Testnet
            </Button>
          )
        ) : (
          <Button className="text-lg" variant="outline" onClick={connect}>
            Connect Wallet
          </Button>
        )}
      </Menubar>
    </div>
  );
};

export default AccountMenu;
