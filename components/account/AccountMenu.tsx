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

declare global {
  interface Window {
    ethereum?: any;
  }
}

const AccountMenu = () => {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // Check if the user is already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then(handleAccountsChanged)
        .catch((err: any) => {
          console.error(err);
        });

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    } else {
      console.log("Please install MetaMask!");
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount(null);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
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
    } catch (err) {
      console.error(err);
    }
  };

  const disconnect = () => {
    setAccount(null);
    window.localStorage.removeItem("wallet_connected");
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
    <div>
      <Menubar className="rounded-none border-none px-2 lg:px-4">
        {account ? (
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
          <Button variant="outline" onClick={connect}>
            Connect Wallet
          </Button>
        )}
      </Menubar>
    </div>
  );
};

export default AccountMenu;
