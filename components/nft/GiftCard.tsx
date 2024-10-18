// components/nft/GiftCard.tsx

"use client";
import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ethers } from "ethers";
import { getSigner, initializeContract } from "@/lib/constants";
import { Loader2 } from "lucide-react"; // Import Loader2 for loading animations
import { Input } from "../ui/input";

interface Gift {
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

export default function GiftCard({ gift }: { gift: Gift }) {
  const [contributionAmount, setContributionAmount] = React.useState("");
  const [account, setAccount] = React.useState<string | null>(null);
  const [isRedeemed, setIsRedeemed] = React.useState<boolean>(false);
  const [isExpired, setIsExpired] = React.useState<boolean>(false);
  const [isContributing, setIsContributing] = React.useState<boolean>(false);
  const [isRedeeming, setIsRedeeming] = React.useState<boolean>(false);

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
    const endTime = new Date(parseFloat(gift.timestamp));
    const currentTime = new Date();
    setIsExpired(currentTime > endTime);
  }, [gift.timestamp]);

  // Check if gift has been redeemed
  React.useEffect(() => {
    const checkRedeemedStatus = async () => {
      if (!gift) return;

      try {
        const zoraGiftContract = await initializeContract();
        if (!zoraGiftContract) {
          console.error("Contract not initialized");
          return;
        }

        // Assuming there is a function isGiftRedeemed(tokenId) that returns a boolean
        const amount = await zoraGiftContract.getCollectedAmount(gift.id);

        if (amount > 0) {
          setIsRedeemed(false);
        } else {
          setIsRedeemed(true);
        }
      } catch (error) {
        console.error("Error checking redeemed status:", error);
      }
    };
    checkRedeemedStatus();
  }, [gift]);

  const handleContribute = async () => {
    try {
      setIsContributing(true);

      // Validate contribution amount
      if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
        alert("Please enter a valid contribution amount.");
        setIsContributing(false);
        return;
      }

      // Get the signer
      const signer = await getSigner();
      if (!signer) {
        alert("Please connect your wallet.");
        setIsContributing(false);
        return;
      }

      // Initialize the contract with the signer
      const zoraGiftContract = await initializeContract();
      if (!zoraGiftContract) {
        console.error("ZoraGift contract not initialized.");
        setIsContributing(false);
        return;
      }

      // Parse the contribution amount to Ether
      const contributionValue = ethers.parseEther(contributionAmount);

      // Send the transaction
      const tx = await zoraGiftContract.addContribution(gift.id, {
        value: contributionValue,
      });

      console.log("Transaction sent:", tx);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      alert(`Contributed ${contributionAmount} ETH to gift ID ${gift.id}`);
      setContributionAmount(""); // Reset the input field
    } catch (error) {
      console.error("Error contributing to gift:", error);
      alert("Failed to contribute to the gift. " + error);
    } finally {
      setIsContributing(false);
    }
  };

  const handleRedeem = async () => {
    try {
      setIsRedeeming(true);

      // Get the signer and connected account
      const signer = await getSigner();
      const account = await signer?.getAddress();

      // Initialize the contract with the signer
      const zoraGiftContract = await initializeContract();
      if (!zoraGiftContract) {
        console.error("Contract not initialized");
        setIsRedeeming(false);
        return;
      }

      const tokenId = gift.id;

      // Check token ownership
      const owner = await zoraGiftContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== account?.toLowerCase()) {
        alert("You are not the owner of this token.");
        setIsRedeeming(false);
        return;
      }

      // Call the redeem function on the contract
      const tx = await zoraGiftContract.redeemGift(tokenId);
      console.log("Transaction sent:", tx);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      alert(`Gift ID ${gift.id} redeemed successfully!`);
      setIsRedeemed(true);
    } catch (error) {
      console.error("Error redeeming gift:", error);
      alert("Failed to redeem the gift. " + error);
    } finally {
      setIsRedeeming(false);
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
            To: {gift.to.slice(0, 6) + "..." + gift.to.slice(-4)}
          </p>
          <p className="text-sm text-gray-500">
            Occasion Type: {gift.occasionType}
          </p>
          <p className="text-sm text-gray-500">
            Total Amount: {gift.amount} ETH
          </p>
          <p className="text-sm text-gray-500">
            End Time: {new Date(parseFloat(gift.timestamp)).toLocaleString()}
          </p>
        </div>
      </Link>
      {account && account.toLowerCase() === gift.to.toLowerCase() ? (
        // If the connected account is the recipient
        <div className="mt-4">
          <Button
            onClick={handleRedeem}
            className="w-full"
            disabled={isRedeemed || !isExpired || isRedeeming}
          >
            {isRedeeming ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Redeeming...
              </>
            ) : isRedeemed ? (
              "Already Redeemed"
            ) : (
              "Redeem"
            )}
          </Button>
          {!isExpired && !isRedeemed && (
            <p className="text-sm text-gray-500 mt-2">
              You can redeem this gift after{" "}
              {new Date(parseFloat(gift.timestamp)).toLocaleString()}
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
          <Button
            onClick={handleContribute}
            className="mt-2 w-full"
            disabled={isContributing}
          >
            {isContributing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Contributing...
              </>
            ) : (
              "Contribute"
            )}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-red-500 mt-4">Gift Sent!</p>
      )}
    </Card>
  );
}
