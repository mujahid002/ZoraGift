"use client";

import React, { useState, useEffect } from "react";
import * as Form from "@radix-ui/react-form";
import AppBar from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
// import RequireAuthPlaceholder from "@/components/account/RequireAuthPlaceholder";

const GiftForm: React.FC = () => {
    const [walletAddress, setWalletAddress] = useState("");
    const [giftName, setGiftName] = useState("");
    const [occasionType, setOccasionType] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState<number>(0.001);
    const [date, setDate] = useState("");

    // const [account, setAccount] = useState<User | null>(null);
    const [loadedAccount, setLoadedAccount] = useState(false);

    useEffect(() => {
        const userJson = localStorage.getItem("user");
        const user = userJson ? JSON.parse(userJson) : null;
        // setAccount(user);
        setLoadedAccount(true);
    }, []);

    const isValidEthAddress = (address: string): boolean => {
        // Simple regex pattern for Ethereum address validation
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    const handleSubmit = (e: React.FormEvent) => {
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

        if (!date) {
            alert("Date is required.");
            return;
        }

        const timestamp = new Date(date).getTime();

        const formData = {
            walletAddress,
            giftName,
            occasionType,
            description,
            amount,
            timestamp,
        };

        console.log(JSON.stringify(formData));
    };

    return (
        <div>
            <AppBar />

            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                {/* {!account && loadedAccount && (
          <div className="mt-12">
            <RequireAuthPlaceholder />
          </div>
        )} */}
                {/* {account && ( */}
                <div className="w-full max-w-md mt-20">
                    <h2 className="text-center text-3xl font-bold mb-6">
                        Gift to your special one...
                    </h2>
                    <Form.Root onSubmit={handleSubmit} className="space-y-6">
                        {/* Wallet Address */}
                        <Form.Field name="walletAddress">
                            <div className="flex flex-col">
                                <Form.Label className="text-sm font-medium">
                                    Wallet Address
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
                                    <Form.Label className="text-sm font-medium">Gift Name</Form.Label>
                                    <Form.Control asChild>
                                        <input
                                            type="text"
                                            value={giftName}
                                            onChange={(e) => setGiftName(e.target.value)}
                                            className="border border-input bg-background rounded-md px-3 py-2 mt-1"
                                            placeholder="Enter gift name"
                                        />
                                    </Form.Control>
                                </div>
                            </Form.Field>

                            <Form.Field name="occasionType" className="flex-1">
                                <div className="flex flex-col">
                                    <Form.Label className="text-sm font-medium">Occasion</Form.Label>
                                    {/* Removed Form.Control here */}
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
                                            className="border border-input bg-background rounded-md px-3 py-2 mt-1"
                                        />
                                    </Form.Control>
                                </div>
                            </Form.Field>
                        </div>

                        <Form.Submit asChild>
                            <Button type="submit" className="w-full">
                                Submit
                            </Button>
                        </Form.Submit>
                    </Form.Root>
                </div>
                {/* )} */}
            </div>
        </div>
    );
};

export default GiftForm;
