"use client";
import Link from "next/link";
import AppBar from "@/components/layout/AppBar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

import GiftCard from "@/components/nft/GiftCard";
import { Check } from "@/components/account/Check";

interface Creation {
  tokenId: string; // Assuming tokenId is a string
  name: string;
  description: string;
  occasionType: string;
  to: string;
  amount: string[];
  timestamp: string;
  createdBy: string[];
  image: string;
  isInstantGift: boolean;
  metadataUrl: string;
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

  const fetchAllGifts = async () => {
    setLoadingCreations(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gifts`);
      if (!response.ok) {
        throw new Error("Failed to fetch gifts from backend.");
      }
      const data: Creation[] = await response.json();
      setCreations(data);

      if (account) {
        const accountLower = account.toLowerCase();
        const userCreations = data.filter(
          (gift) =>
            gift.createdBy &&
            gift.createdBy.some(
              (creator) => creator.toLowerCase() === accountLower
            )
        );
        setMyCreations(userCreations);

        const userRedeemable = data.filter(
          (gift) => gift.to && gift.to.toLowerCase() === accountLower
        );
        setRedeemableCreations(userRedeemable);
      }
    } catch (err) {
      console.error("Error fetching gifts:", err);
      setError("Failed to fetch gifts. Please try again later.");
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
        fetchAllGifts(); // Refresh gifts when account changes
      });
    }
  }, []);

  useEffect(() => {
    fetchAllGifts();
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
                {creations.map((creation) => (
                  <GiftCard key={creation.tokenId} gift={creation} />
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
                    {myCreations.map((creation) => (
                      <GiftCard key={creation.tokenId} gift={creation} />
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
                    {redeemableCreations.map((creation) => (
                      <GiftCard key={creation.tokenId} gift={creation} />
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
