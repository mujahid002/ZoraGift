// components/nft/CreationCard.tsx

"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreationCard({ creation }: { creation: any }) {
  const [contributionAmount, setContributionAmount] = React.useState("");

  const handleContribute = async () => {
    // Implement the logic to contribute ETH to the gift
    // For example, using ethers.js or web3.js to send a transaction
    alert(`Contributed ${contributionAmount} ETH to gift ID ${creation.id}`);
  };

  return (
    <Card className="p-4">
      <Link href={`/gift/${creation.id}`}>
        <div className="cursor-pointer">
          <Image
            src={creation.imageUrl}
            alt={creation.giftName}
            width={300}
            height={300}
            className="w-full h-48 object-cover rounded-md"
          />
          <h3 className="text-lg font-semibold mt-2">{creation.giftName}</h3>
          <p className="text-sm text-gray-500">
            Total Amount: {creation.totalAmount} ETH
          </p>
          <p className="text-sm text-gray-500">
            End Time: {new Date(creation.endTime).toLocaleString()}
          </p>
        </div>
      </Link>
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
    </Card>
  );
}
