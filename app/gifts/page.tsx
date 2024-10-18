// pages/gifts.tsx

"use client";
import Link from "next/link";
import AppBar from "@/components/layout/AppBar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

import GiftCard from "@/components/nft/GiftCard";
import { initializeContract } from "@/lib/constants";
import { Check } from "@/components/account/Check";

interface Creation {
  id: number;
  ipfsHash: string;
  to: string;
  name: string;
  occasionType: string;
  description: string;
  amount: string;
  timestamp: string;
  createdBy: string;
  image: string;
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
  const [error, setError] = useState<string | null>(null);

  // Fetch IPFS data and include the id in each gift
  const fetchIpfsData = async (
    gifts: { id: number; ipfsHash: string }[]
  ): Promise<Creation[]> => {
    const ipfsData = await Promise.all(
      gifts.map(async (gift) => {
        try {
          const response = await fetch(`https://ipfs.io/ipfs/${gift.ipfsHash}`);
          if (!response.ok) throw new Error("Failed to fetch IPFS data");
          const data = await response.json();
          return { ...data, id: gift.id }; // Include the id
        } catch (error) {
          console.error(`Error fetching IPFS hash ${gift.ipfsHash}:`, error);
          return null;
        }
      })
    );
    return ipfsData.filter((data): data is Creation => data !== null);
  };

  const getCreations = async () => {
    setLoadingCreations(true);
    setError(null);

    try {
      const zoraGiftContract = await initializeContract();

      if (!zoraGiftContract) {
        console.error("ZoraGift contract not initialized.");
        setError("Failed to initialize contract.");
        return;
      }

      const presentTokenId = await zoraGiftContract.getNextTokenId();
      const tokenId = Number(presentTokenId);

      if (tokenId === 0) {
        // No gifts have been created yet
        setCreations([]);
        setMyCreations([]);
        setRedeemableCreations([]);
        return;
      }

      const gifts = await Promise.all(
        Array.from({ length: tokenId }, async (_, i) => {
          const hash = await zoraGiftContract.getIpfsHash(i);
          return { id: i, ipfsHash: hash };
        })
      );

      console.log("gifts", gifts);

      const ipfsData = await fetchIpfsData(gifts);
      setCreations(ipfsData);

      if (account) {
        const accountLower = account.toLowerCase();
        const myCreations = ipfsData.filter(
          (creation) =>
            creation.createdBy &&
            creation.createdBy.toLowerCase() === accountLower
        );
        setMyCreations(myCreations);

        const redeemableCreations = ipfsData.filter(
          (creation) =>
            creation.to && creation.to.toLowerCase() === accountLower
        );
        setRedeemableCreations(redeemableCreations);
      }
    } catch (err) {
      console.error("Error fetching creations:", err);
      setError("Failed to fetch creations. Please try again later.");
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

    // Listen for account changes
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
        // Refresh the creations when account changes
        getCreations();
      });
    }
  }, [getCreations]);

  useEffect(() => {
    getCreations();
  }, [account, getCreations]);

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
            {loadingCreations ? (
              <div className="flex flex-col items-center justify-center mt-6">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="text-gray-500">Loading gifts...</p>
              </div>
            ) : error ? (
              <div className="text-center mt-6">
                <p className="text-red-500">{error}</p>
              </div>
            ) : creations && creations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {creations.map((creation, index) => (
                  <GiftCard key={index} gift={creation} />
                ))}
              </div>
            ) : (
              <div className="text-center mt-6">
                <div className="text-2xl font-semibold text-gray-500">
                  No gifts here.
                </div>
                <Link href="/gift">
                  <Button className="px-16 mt-4">Start Gifting</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Gifts by You */}
          <TabsContent value="gifts-by-you">
            {loadedAccount && !account && <Check />}
            {account && (
              <>
                {loadingCreations ? (
                  <div className="flex flex-col items-center justify-center mt-6">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p className="text-gray-500">Loading your gifts...</p>
                  </div>
                ) : error ? (
                  <div className="text-center mt-6">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : myCreations && myCreations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                    {myCreations.map((creation, index) => (
                      <GiftCard key={index} gift={creation} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center mt-6">
                    <div className="text-2xl font-semibold text-gray-500">
                      No gifts created by you.
                    </div>
                    <Link href="/gift">
                      <Button className="px-16 mt-4">Start Gifting</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Redeem Yours */}
          <TabsContent value="redeem-yours">
            {loadedAccount && !account && <Check />}
            {account && (
              <>
                {loadingCreations ? (
                  <div className="flex flex-col items-center justify-center mt-6">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p className="text-gray-500">
                      Loading your gifts to redeem...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center mt-6">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : redeemableCreations && redeemableCreations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                    {redeemableCreations.map((creation, index) => (
                      <GiftCard key={index} gift={creation} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center mt-6">
                    <div className="text-2xl font-semibold text-gray-500">
                      No gifts to redeem.
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
