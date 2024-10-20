import { PinataSDK } from "pinata";

import axios from 'axios';
import FormData from 'form-data';

export interface data {
    name: string;
    description: string,
    occasionType: string,
    to: string,
    amount: string,
    timestamp: string,

    isInstantGift: boolean,
    createdBy: string,
    image: string,
    content: {
        mime: string,
        uri: string,
    },
}

export const Upload = async (data: data) => {
    const pinata = new PinataSDK({
        pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
        pinataGateway: "white-underlying-coral-820.mypinata.cloud",
    });

    const res = await pinata.upload.json({
        data
    })

    return res;
}

export interface Metadata {
    name: string;
    description: string;
    occasionType: string;
    to: string;
    amount: string;
    timestamp: string;
    isInstantGift: boolean;
    createdBy?: string;
    image: string | null;
    content: {
        mime: string;
        uri: string | null;
    };
}


export const handleUpload = async (metadata: Metadata): Promise<string> => {
    try {
        // Convert metadata to JSON string
        const jsonString = JSON.stringify(metadata);

        // Create a new Blob from the JSON string
        const fileBlob = new Blob([jsonString], { type: 'application/json' });

        // Create a new FormData instance
        const formData = new FormData();

        // Append the file to the form data
        formData.append('file', fileBlob, 'metadata.json');

        // Append Pinata metadata and options if needed
        const pinataMetadata = {
            name: `ZG-${new Date().getTime().toString()}`,
        };
        formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

        const pinataOptions = {
            cidVersion: 1,
        };
        formData.append('pinataOptions', JSON.stringify(pinataOptions));

        // Send the POST request to Pinata
        const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            maxContentLength: Infinity, // Prevent axios from throwing error due to large content
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`, // Ensure this is server-side only
            },
        });

        console.log(res.data);
        return res.data.IpfsHash;
    } catch (e) {
        console.error(e);
        throw new Error('Unable to upload metadata');
    }
};



