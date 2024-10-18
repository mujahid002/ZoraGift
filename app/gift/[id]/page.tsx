// app/gift/[id]/page.tsx

"use client";
import { useEffect, useState } from "react";
import AppBar from "@/components/layout/AppBar";
import Image from "next/image";
import { initializeContract, ZORAGIFT_ADDRESS } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";

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
  isInstantGift: boolean;
  content: {
    mime: string;
    uri: string;
  };
}

export default function GiftDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const [giftDetails, setGiftDetails] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState<string>("");
  const [amountCollected, setAmountCollected] = useState<string>("");
  const [explorerUrl, setExplorerUrl] = useState<string>("");

  const fetchGiftDetails = async () => {
    setLoading(true);
    try {
      const idNumber = parseInt(id, 10);
      if (isNaN(idNumber)) {
        console.error("Invalid id");
        return;
      }
      const zoraGiftContract = await initializeContract();
      if (!zoraGiftContract) {
        console.error("Contract not initialized");
        return;
      }

      // Get the IPFS hash for the given token ID
      const ipfsHash = await zoraGiftContract.getIpfsHash(idNumber);

      // Fetch the metadata from IPFS
      const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
      const data = await response.json();

      // Get the collected amount for the gift
      const collectedAmountBN = await zoraGiftContract.getCollectedAmount(
        idNumber
      );
      const collectedAmount = ethers.formatEther(collectedAmountBN);

      // Set the amount collected
      setAmountCollected(collectedAmount);

      // Set the IPFS and explorer URLs
      setIpfsUrl(`https://ipfs.io/ipfs/${ipfsHash}`);
      setExplorerUrl(
        `https://sepolia.explorer.zora.energy/token/${ZORAGIFT_ADDRESS}/instance/${idNumber}`
      );

      // Map the data to our Gift interface
      const giftData: Gift = {
        id: idNumber,
        ipfsHash: ipfsHash,
        to: data.to,
        name: data.name,
        occasionType: data.occasionType,
        description: data.description,
        amount: data.amount,
        timestamp: data.timestamp,
        createdBy: data.createdBy,
        image: data.image,
        isInstantGift: data.isInstantGift,
        content: data.content,
      };

      setGiftDetails(giftData);
    } catch (error) {
      console.error("Error fetching gift details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchGiftDetails();
    }
  }, [id, fetchGiftDetails]);

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
                <strong>Created By:</strong> {giftDetails.createdBy}
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
                {/* {giftDetails.isInstantGift || giftDetails.timestamp === "0"
                  ? "Instant Gift"
                  : new Date(parseInt(giftDetails.timestamp)).toLocaleString()} */}
                {new Date(parseInt(giftDetails.timestamp)).toLocaleString()}
              </p>
              <p className="mb-2">
                <strong>Is Instant Gift:</strong>{" "}
                {giftDetails.isInstantGift ? "True" : "False"}
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                <Button>View on Explorer</Button>
              </a>
              <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
                <Button>View Metadata</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
