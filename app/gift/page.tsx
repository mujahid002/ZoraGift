// pages/gift.tsx

"use client";

import React, { useState, useEffect } from "react";
import * as Form from "@radix-ui/react-form";
import AppBar from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { generateImage } from "@/lib/generateImage";
import { Modal } from "@/components/ui/modal";
import { Loader } from "@/components/ui/loader";
import { RequireAuthPlaceholder } from "@/components/account/RequireAuthPlaceholder";
import { ZORA_TESTNET_PARAMS } from "@/lib/networks";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const GiftForm: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [giftName, setGiftName] = useState("");
  const [occasionType, setOccasionType] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0.001);
  const [date, setDate] = useState("");
  const [isInstantGift, setIsInstantGift] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [account, setAccount] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]); // Wallet is connected
            checkNetwork(); // Check the network after getting the account
          } else {
            setAccount(null);
          }
        } catch (err) {
          console.error("Error fetching accounts:", err);
          setAccount(null);
        }
      }
    };

    const checkNetwork = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          if (chainId !== ZORA_TESTNET_PARAMS.chainId) {
            setIsCorrectNetwork(false);
          } else {
            setIsCorrectNetwork(true);
          }
        } catch (err) {
          console.error("Error checking network:", err);
        }
      }
    };

    checkWalletConnection();

    // Listen for account and network changes
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      checkNetwork();
    } else {
      setAccount(null);
    }
  };

  const handleChainChanged = () => {
    checkNetwork();
    window.location.reload();
  };

  const checkNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== ZORA_TESTNET_PARAMS.chainId) {
          setIsCorrectNetwork(false);
        } else {
          setIsCorrectNetwork(true);
        }
      } catch (err) {
        console.error("Error checking network:", err);
      }
    }
  };

  const switchToZoraSepoliaTestnet = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
      return;
    }

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ZORA_TESTNET_PARAMS.chainId }],
      });
      setIsCorrectNetwork(true);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ZORA_TESTNET_PARAMS],
          });
          setIsCorrectNetwork(true);
        } catch (addError) {
          console.error(
            "Failed to add the Zora Sepolia Testnet network:",
            addError
          );
          alert("Failed to add the Zora Sepolia Testnet network.");
        }
      } else {
        console.error(
          "Failed to switch to the Zora Sepolia Testnet network:",
          switchError
        );
        alert("Failed to switch to the Zora Sepolia Testnet network.");
      }
    }
  };

  const isValidEthAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEthAddress(walletAddress)) {
      alert("Invalid Ethereum address.");
      return;
    }

    if (!giftName) {
      alert("Gift Name is required.");
      return;
    }

    if (!occasionType) {
      alert("Please select an occasion.");
      return;
    }

    if (amount < 0.001) {
      alert("Amount must be at least 0.001 ETH.");
      return;
    }

    if (!isInstantGift && !date) {
      alert("Date is required for scheduled gifts.");
      return;
    }

    const timestamp = isInstantGift ? 0 : new Date(date).getTime();

    const formData = {
      walletAddress,
      giftName,
      occasionType,
      description,
      amount,
      timestamp,
      isInstantGift,
    };

    try {
      setIsLoading(true);

      // Generate prompt based on form data
      const prompt = `Generate a ${occasionType} card including the name ${giftName}`;
      const imageUrl = await generateImage(prompt);
      setGeneratedImageUrl(imageUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }

    console.log(JSON.stringify(formData));
  };

  const handleRegenerate = async () => {
    // Validate inputs similar to handleGenerate
    if (!isValidEthAddress(walletAddress)) {
      alert("Invalid Ethereum address.");
      return;
    }

    if (!giftName) {
      alert("Gift Name is required.");
      return;
    }

    if (!occasionType) {
      alert("Please select an occasion.");
      return;
    }

    if (amount < 0.001) {
      alert("Amount must be at least 0.001 ETH.");
      return;
    }

    if (!isInstantGift && !date) {
      alert("Date is required for scheduled gifts.");
      return;
    }

    const timestamp = isInstantGift ? 0 : new Date(date).getTime();

    const formData = {
      walletAddress,
      giftName,
      occasionType,
      description,
      amount,
      timestamp,
      isInstantGift,
    };

    try {
      setIsLoading(true);

      // Generate prompt based on form data
      const prompt = `Generate a ${occasionType} card including the name ${giftName}`;
      const imageUrl = await generateImage(prompt);
      setGeneratedImageUrl(imageUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }

    console.log(JSON.stringify(formData));
  };

  // Placeholder function for minting
  const handleMint = () => {
    // Implement minting functionality here
    alert("Mint functionality is not yet implemented.");
  };

  // If the wallet is not connected or on the wrong network, show RequireAuthPlaceholder component
  if (!account || !isCorrectNetwork) {
    return <RequireAuthPlaceholder />;
  }

  return (
    <div>
      <AppBar />

      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md mt-20">
          <h2 className="text-center text-3xl font-bold mb-6">
            Gift to your special one...
          </h2>
          <Form.Root onSubmit={handleGenerate} className="space-y-6">
            {/* Recipient Wallet Address */}
            <Form.Field name="walletAddress">
              <div className="flex flex-col">
                <Form.Label className="text-sm font-medium">
                  Recipient Wallet Address
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="border border-input bg-background rounded-md px-3 py-2 mt-1"
                    placeholder="0x..."
                  />
                </Form.Control>
              </div>
            </Form.Field>

            {/* Gift Name and Occasion Type */}
            <div className="flex flex-col md:flex-row md:space-x-4">
              <Form.Field name="giftName" className="flex-1">
                <div className="flex flex-col">
                  <Form.Label className="text-sm font-medium">
                    Gift Name
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      value={giftName}
                      onChange={(e) => setGiftName(e.target.value)}
                      className="border border-input bg-background rounded-md px-3 py-2 mt-1"
                      placeholder={
                        occasionType
                          ? `${occasionType} Gift`
                          : "Enter gift name"
                      }
                    />
                  </Form.Control>
                </div>
              </Form.Field>

              <Form.Field name="occasionType" className="flex-1">
                <div className="flex flex-col">
                  <Form.Label className="text-sm font-medium">
                    Occasion
                  </Form.Label>
                  <select
                    value={occasionType}
                    onChange={(e) => setOccasionType(e.target.value)}
                    className="border border-input bg-background rounded-md px-3 py-2 mt-1"
                  >
                    <option value="">Select Occasion</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </Form.Field>
            </div>

            {/* Description */}
            <Form.Field name="description">
              <div className="flex flex-col">
                <Form.Label className="text-sm font-medium">
                  Description
                </Form.Label>
                <Form.Control asChild>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border border-input bg-background rounded-md px-3 py-2 mt-1"
                    placeholder="A special gift for you."
                  />
                </Form.Control>
              </div>
            </Form.Field>

            {/* Amount in ETH and Date */}
            <div className="flex flex-col md:flex-row md:space-x-4">
              <Form.Field name="amount" className="flex-1">
                <div className="flex flex-col">
                  <Form.Label className="text-sm font-medium">
                    Amount in ETH
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value))}
                      className="border border-input bg-background rounded-md px-3 py-2 mt-1"
                      placeholder="0.001"
                    />
                  </Form.Control>
                </div>
              </Form.Field>

              <Form.Field name="date" className="flex-1">
                <div className="flex flex-col">
                  <Form.Label className="text-sm font-medium">Date</Form.Label>
                  <Form.Control asChild>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isInstantGift}
                      className={`border border-input bg-background rounded-md px-3 py-2 mt-1 ${
                        isInstantGift ? "bg-gray-200 cursor-not-allowed" : ""
                      }`}
                    />
                  </Form.Control>
                </div>
              </Form.Field>
            </div>

            {/* Instant Gift Checkbox */}
            <Form.Field name="isInstantGift">
              <div className="flex items-center">
                <Form.Control asChild>
                  <input
                    type="checkbox"
                    checked={isInstantGift}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsInstantGift(checked);
                      if (checked) {
                        setDate("");
                      }
                    }}
                    className="mr-2"
                  />
                </Form.Control>
                <Form.Label className="text-sm font-medium">
                  Send as Instant Gift
                </Form.Label>
              </div>
            </Form.Field>

            <Form.Submit asChild>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </Form.Submit>
          </Form.Root>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      {/* Modal with Generated Image */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
       

        {/* Modal Content */}
        <h2 className="text-xl font-bold mb-4">Your Generated Gift Image</h2>
        {generatedImageUrl ? (
          <img
            src={generatedImageUrl}
            alt="Generated Gift"
            className="w-full"
          />
        ) : (
          <p>Failed to load image.</p>
        )}
        <div className="mt-4 flex space-x-4">
          <Button onClick={handleMint} className="w-2/3">
            Mint on Zora
          </Button>
          <Button
            onClick={() => {
              handleRegenerate();
              setIsModalOpen(false);
            }}
            className="w-1/3"
            variant="outline"
          >
            Re-Generate
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GiftForm;
