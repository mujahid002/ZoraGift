"use client";
import Link from "next/link";
import AppBar from "@/components/layout/AppBar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAuthPlaceholder } from "@/components/account/RequireAuthPlaceholder";
import { LoaderCircle } from "lucide-react";

import CreationCard from "@/components/nft/CreationCard";
import { initializeContract } from "@/lib/constants";
import { ethers } from "ethers";

interface Creation {
  id: number;
  ipfsHash: string;
  ownerAddress: string;
  recipientAddress: string;
  giftName: string;
  imageUrl: string;
  totalAmount: string;
  endTime: number;
  [key: string]: any;
}

export default function Gifts() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [myCreations, setMyCreations] = useState<Creation[]>([]);
  const [redeemableCreations, setRedeemableCreations] = useState<Creation[]>(
    []
  );
  const [account, setAccount] = useState<string | null>(null);
  const [loadingCreations, setLoadingCreations] = useState<boolean>(false);
  const [loadedAccount, setLoadedAccount] = useState<boolean>(false);

  // Helper function to fetch IPFS data concurrently
  const fetchIpfsData = async (ipfsHashes: string[]): Promise<Creation[]> => {
    const ipfsData = await Promise.all(
      ipfsHashes.map(async (hash) => {
        try {
          // Use an alternative IPFS gateway for faster access
          const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
          if (!response.ok) throw new Error("Failed to fetch IPFS data");
          return await response.json();
        } catch (error) {
          console.error(`Error fetching IPFS hash ${hash}:`, error);
          return null;
        }
      })
    );
    return ipfsData.filter((data): data is Creation => data !== null);
  };

  const getCreations = async () => {
    setLoadingCreations(true);

    try {
      const zoraGiftContract = await initializeContract();

      if (!zoraGiftContract) {
        console.error("ZoraGift contract not initialized.");
        return;
      }

      const presentTokenId = await zoraGiftContract.getNextTokenId();
      const tokenId = Number(presentTokenId);

      const ipfsHashes: string[] = await Promise.all(
        Array.from({ length: tokenId }, async (_, i) => {
          const hash: string = await zoraGiftContract.getIpfsHash(i);
          return hash;
        })
      );

      console.log("ipfsHashes", ipfsHashes);

      const ipfsData = await fetchIpfsData(ipfsHashes);
      setCreations(ipfsData);

      if (account) {
        const accountLower = account.toLowerCase();
        const myCreations = ipfsData.filter(
          (creation) =>
            creation.ownerAddress &&
            creation.ownerAddress.toLowerCase() === accountLower
        );
        setMyCreations(myCreations);

        const redeemableCreations = ipfsData.filter(
          (creation) =>
            creation.recipientAddress &&
            creation.recipientAddress.toLowerCase() === accountLower
        );
        setRedeemableCreations(redeemableCreations);
      }
    } catch (err) {
      console.error("Error fetching creations:", err);
    } finally {
      setLoadingCreations(false);
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts: string[] = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
          }
        } catch (err) {
          console.error("Error fetching accounts:", err);
          setAccount(null);
        }
      }
      setLoadedAccount(true);
    };

    checkWalletConnection();
  }, []);

  useEffect(() => {
    getCreations();
  }, [account]);

  return (
    <div>
      <AppBar />
      <div className="container flex flex-col items-center justify-center w-full mt-20">
        <Tabs defaultValue="all-gifts" className="w-full">
          <div className="flex flex-col items-center justify-center">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="all-gifts" className="font-semibold">
                All Gifts
              </TabsTrigger>
              <TabsTrigger value="gifts-by-you" className="font-semibold">
                Gifts by You
              </TabsTrigger>
              <TabsTrigger value="redeem-yours" className="font-semibold">
                Redeem Yours
              </TabsTrigger>
            </TabsList>
          </div>

          {/* All Gifts */}
          <TabsContent value="all-gifts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              {loadingCreations && (
                <div className="col-span-full flex flex-col items-center justify-center mt-6">
                  <LoaderCircle size={32} className="animate-spin" />
                </div>
              )}
              {creations && creations.length > 0 ? (
                creations.map((creation, index) => (
                  <CreationCard
                    key={index}
                    creation={creation}
                    alt={`Image for gift ${creation.giftName}`} // Ensure alt text is provided
                  />
                ))
              ) : (
                <div className="col-span-full text-center mt-6">
                  <div className="text-2xl font-semibold text-gray-500">
                    No gifts here.
                  </div>
                  <Link href="/gift">
                    <Button className="px-16 mt-4">Start Gifting</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Gifts by You */}
          <TabsContent value="gifts-by-you">
            {loadedAccount && !account && <RequireAuthPlaceholder />}
            {account && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {loadingCreations && (
                  <div className="col-span-full flex flex-col items-center justify-center mt-6">
                    <LoaderCircle size={32} className="animate-spin" />
                  </div>
                )}
                {myCreations && myCreations.length > 0 ? (
                  myCreations.map((creation, index) => (
                    <CreationCard key={index} creation={creation} />
                  ))
                ) : (
                  <div className="col-span-full text-center mt-6">
                    <div className="text-2xl font-semibold text-gray-500">
                      No gifts created by you.
                    </div>
                    <Link href="/gift">
                      <Button className="px-16 mt-4">Create a Gift</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Redeem Yours */}
          <TabsContent value="redeem-yours">
            {loadedAccount && !account && <RequireAuthPlaceholder />}
            {account && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {loadingCreations && (
                  <div className="col-span-full flex flex-col items-center justify-center mt-6">
                    <LoaderCircle size={32} className="animate-spin" />
                  </div>
                )}
                {redeemableCreations && redeemableCreations.length > 0 ? (
                  redeemableCreations.map((creation, index) => (
                    <CreationCard key={index} creation={creation} />
                  ))
                ) : (
                  <div className="col-span-full text-center mt-6">
                    <div className="text-2xl font-semibold text-gray-500">
                      No gifts to redeem.
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
