"use client";
import { useEffect, useState } from "react";
import AppBar from "@/components/layout/AppBar";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSigner, initializeContract } from "@/lib/constants";
import { ethers } from "ethers";

interface Gift {
  tokenId: string;
  name: string;
  description: string;
  occasionType: string;
  to: string;
  amount: string;
  timestamp: string;
  isInstantGift: boolean;
  createdBy: string[];
  image: string;
  content: {
    mime: string;
    uri: string;
  };
  metadataUrl: string;
}

export default function GiftDetails({
  params,
}: {
  params: { tokenId: string };
}) {
  const { tokenId } = params;
  const [giftDetails, setGiftDetails] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(false);
  const [amountCollected, setAmountCollected] = useState<string>("");
  const [contributionAmount, setContributionAmount] = useState<string>("");
  const [isContributing, setIsContributing] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);

  const fetchGiftDetails = async () => {
    if (!tokenId) {
      console.error("Gift ID is undefined.");
      return;
    }

    setLoading(true);
    try {
      const idNumber = parseInt(tokenId, 10);
      if (isNaN(idNumber)) {
        console.error("Invalid id");
        return;
      }

      // Fetch gift details from the backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gifts/${idNumber}`
      );
      if (!response.ok) {
        console.error("Error fetching gift details:", await response.text());
        return;
      }
      const data: Gift = await response.json();

      // Fetch the collected amount from the smart contract
      const zoraGiftContract = await initializeContract();
      if (!zoraGiftContract) {
        console.error("Contract not initialized");
        return;
      }
      const collectedAmountBN = await zoraGiftContract.getCollectedAmount(
        idNumber
      );
      const collectedAmount = ethers.formatEther(collectedAmountBN);

      setAmountCollected(collectedAmount);
      setGiftDetails(data);
    } catch (error) {
      console.error("Error fetching gift details:", error);
    } finally {
      setLoading(false);
    }
  };

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
        throw new Error(
          "No signer available. Ensure you're connected to your wallet."
        );
      }
      const accountAddress = await signer.getAddress();
      setAccount(accountAddress);

      // Initialize the contract
      const zoraGiftContract = await initializeContract();
      if (!zoraGiftContract) {
        console.error("Contract not initialized.");
        setIsContributing(false);
        return;
      }

      // Parse the contribution amount
      const contributionValue = ethers.parseEther(contributionAmount);

      // Send the contribution transaction
      const tx = await zoraGiftContract.addContribution(tokenId, {
        value: contributionValue,
      });

      console.log("Transaction sent:", tx);

      // Wait for the transaction to complete
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Update the backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gifts/${tokenId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: contributionAmount,
            createdBy: accountAddress,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update the backend:", await response.text());
        alert("Failed to update the backend.");
        return;
      }

      alert(`Contributed ${contributionAmount} ETH to gift tokenId ${tokenId}`);
      setContributionAmount(""); // Reset input
      fetchGiftDetails(); // Refresh gift details
    } catch (error) {
      console.error("Error contributing to gift:", error);
      alert("Failed to contribute to the gift.");
    } finally {
      setIsContributing(false);
    }
  };

  useEffect(() => {
    fetchGiftDetails();
  }, [tokenId]);

  if (loading || !giftDetails) {
    return (
      <div>
        <AppBar />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppBar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md mt-20">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold mb-6">{giftDetails.name}</h1>
            <Image
              src={giftDetails.image}
              alt={giftDetails.name}
              width={300}
              height={300}
              className="w-full h-auto rounded-md mb-6 mx-auto"
            />
            <p className="text-lg mb-6">
              <strong>Description:</strong> {giftDetails.description}
            </p>
            <div className="text-gray-600">
              <p className="mb-2">
                <strong>To:</strong> {giftDetails.to}
              </p>
              <p className="mb-2">
                <strong>Created By:</strong> {giftDetails.createdBy.join(", ")}
              </p>
              <p className="mb-2">
                <strong>Total Amount Collected:</strong> {amountCollected} ETH
              </p>
              <p className="mb-2">
                <strong>Target Amount:</strong> {giftDetails.amount} ETH
              </p>
              <p className="mb-2">
                <strong>Occasion Type:</strong> {giftDetails.occasionType}
              </p>
              <p className="mb-2">
                <strong>End Time:</strong>{" "}
                {giftDetails.isInstantGift
                  ? "Instant Gift"
                  : new Date(parseInt(giftDetails.timestamp)).toLocaleString()}
              </p>
              <p className="mb-2">
                <strong>Is Instant Gift:</strong>{" "}
                {giftDetails.isInstantGift ? "True" : "False"}
              </p>
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
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <a
                href={giftDetails.metadataUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>View Metadata</Button>
              </a>
              <a
                href={giftDetails.content.uri}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>View Content</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
