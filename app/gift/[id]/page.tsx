// app/gift/[id]/page.tsx

"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppBar from "@/components/layout/AppBar";
import Image from "next/image";
import { initializeContract } from "@/lib/constants";
import { Loader2 } from "lucide-react"; // Import the Loader2 icon

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

export default function GiftDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const [giftDetails, setGiftDetails] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(false);

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
      const ipfsHash = await zoraGiftContract.getIpfsHash(idNumber);
      const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
      const data = await response.json();
      setGiftDetails(data);
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
  }, [id]);

  if (loading || !giftDetails) {
    return (
      <div>
        <AppBar />
        <div className="flex items-center justify-center h-screen">
          {/* Use the Loader2 icon with animation */}
          <Loader2 className="animate-spin" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppBar />
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
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
            <p className="text-lg mb-6">{giftDetails.description}</p>
            <div className="text-gray-600">
              <p className="mb-2">
                <strong>Total Amount:</strong> {giftDetails.amount} ETH
              </p>
              <p className="mb-2">
                <strong>Occasion Type:</strong> {giftDetails.occasionType}
              </p>
              <p className="mb-2">
                <strong>To:</strong>{" "}
                {giftDetails.walletAddress.slice(0, 6) +
                  "..." +
                  giftDetails.walletAddress.slice(-4)}
              </p>
              <p className="mb-2">
                <strong>End Time:</strong>{" "}
                {new Date(giftDetails.timestamp).toLocaleString()}
              </p>
              <p className="mb-2">
                <strong>Created By:</strong> {giftDetails.createdBy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
