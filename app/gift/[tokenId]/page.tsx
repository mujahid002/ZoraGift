"use client";
import { useEffect, useState } from "react";
import AppBar from "@/components/layout/AppBar";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initializeContract } from "@/lib/constants";
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
