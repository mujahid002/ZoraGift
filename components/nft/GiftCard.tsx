// components/nft/GiftCard.tsx

"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ethers } from "ethers";
import { initializeContract } from "@/lib/constants";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Gift {
  id: number;
  ipfsHash: string;
  walletAddress: string;
  name: string;
  occasionType: string;
  description: string;
  amount: string;
  timestamp: string;
  createdBy: string;
  image: string;
}

export default function GiftCard({ gift }: { gift: Gift }) {
  const [contributionAmount, setContributionAmount] = React.useState("");
  const [account, setAccount] = React.useState<string | null>(null);
  const [isRedeemed, setIsRedeemed] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isExpired, setIsExpired] = React.useState<boolean>(false);

  // Get connected account
  React.useEffect(() => {
    const getAccount = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts: string[]) => {
            setAccount(accounts.length > 0 ? accounts[0] : null);
          });
        } catch (err) {
          console.error("Error fetching accounts:", err);
        }
      }
    };
    getAccount();
  }, []);

  // Check if gift is expired
  React.useEffect(() => {
    const endTime = new Date(gift.timestamp);
    const currentTime = new Date();
    setIsExpired(currentTime > endTime);
  }, [gift.timestamp]);

  // Check if gift has been redeemed
  React.useEffect(() => {
    const checkRedeemedStatus = async () => {
      if (!gift || !account) return;

      try {
        const zoraGiftContract = await initializeContract();
        if (!zoraGiftContract) {
          console.error("Contract not initialized");
          return;
        }

        // Call the contract function to check if the gift is redeemed
        const redeemed = await zoraGiftContract.isRedeemed(gift.id);
        setIsRedeemed(redeemed);
      } catch (error) {
        console.error("Error checking redeemed status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkRedeemedStatus();
  }, [gift, account]);

  const handleContribute = async () => {
    // Implement the logic to contribute ETH to the gift
    alert(`Contributed ${contributionAmount} ETH to gift ID ${gift.id}`);
  };

  const handleRedeem = async () => {
    try {
      setIsLoading(true);
      const zoraGiftContract = await initializeContract();
      if (!zoraGiftContract) {
        console.error("Contract not initialized");
        return;
      }

      // Call the redeem function on the contract
      const tx = await zoraGiftContract.redeemGift(gift.id);
      await tx.wait();
      alert(`Gift ID ${gift.id} redeemed successfully!`);
      setIsRedeemed(true);
    } catch (error) {
      console.error("Error redeeming gift:", error);
      alert("Failed to redeem the gift.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <Link href={`/gift/${gift.id}`}>
        <div className="cursor-pointer">
          <img
            src={gift.image}
            alt={gift.name}
            width={300}
            height={300}
            className="w-full h-48 object-cover rounded-md"
          />
          <h3 className="text-lg font-semibold mt-2">Name: {gift.name}</h3>
          <p className="text-sm text-gray-500">
            To:{" "}
            {gift.walletAddress.slice(0, 6) +
              "..." +
              gift.walletAddress.slice(-4)}
          </p>
          <p className="text-sm text-gray-500">
            Occasion Type: {gift.occasionType}
          </p>
          <p className="text-sm text-gray-500">
            Total Amount: {gift.amount} ETH
          </p>
          <p className="text-sm text-gray-500">
            End Time: {new Date(gift.timestamp).toLocaleString()}
          </p>
        </div>
      </Link>
      {isLoading ? (
        <p className="text-sm text-gray-500 mt-4">Loading...</p>
      ) : account &&
        account.toLowerCase() === gift.walletAddress.toLowerCase() ? (
        // If the connected account is the recipient
        <div className="mt-4">
          <Button
            onClick={handleRedeem}
            className="w-full"
            disabled={isRedeemed || !isExpired}
          >
            {isRedeemed ? "Already Redeemed" : "Redeem"}
          </Button>
          {!isExpired && !isRedeemed && (
            <p className="text-sm text-gray-500 mt-2">
              You can redeem this gift after{" "}
              {new Date(gift.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      ) : !isExpired ? (
        // Show contribute option if gift is not expired
        <div className="mt-4">
          <Input
            type="number"
            placeholder="Amount in ETH"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
          />
          <Button onClick={handleContribute} className="mt-2 w-full">
            Contribute
          </Button>
        </div>
      ) : (
        <p className="text-sm text-red-500 mt-4">Gift Sent!</p>
      )}
    </Card>
  );
}
