// import { PinataSDK } from "pinata";

import { PinataSDK } from "pinata-web3";

import axios from 'axios';
import FormData from 'form-data';

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


export const Upload = async (data: Metadata) => {
    try {
        // Initialize the Pinata SDK
        const pinata = new PinataSDK({
            pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
            pinataGateway: "white-underlying-coral-820.mypinata.cloud",
        });

        // Convert the metadata object to a JSON string
        const jsonString = JSON.stringify(data);

        // Create a File object from the JSON string
        // Note: The File API is available in browser environments
        const file = new File(
            [jsonString],
            `ZG-${new Date().getTime().toString()}.json`,
            { type: "application/json" }
        );

        // Upload the file to Pinata
        const upload = await pinata.upload.file(file);

        console.log(upload);

        // Return the upload result
        return upload.IpfsHash;
    } catch (error) {
        console.error(error);
        throw new Error("Unable to upload metadata");
    }
};



export const handleUpload = async (metadata: Metadata): Promise<string> => {
    try {
        // Convert metadata to JSON string
        const jsonString = JSON.stringify(metadata);

        // Create a Buffer from the JSON string
        const fileBuffer = Buffer.from(jsonString, 'utf-8');

        // Create a new FormData instance
        const formData = new FormData();

        // Append the file to the form data
        formData.append('file', fileBuffer, {
            filename: `ZG-${new Date().getDate().toString()}`,
            contentType: 'application/json',
        });

        // Append Pinata metadata and options if needed
        const pinataMetadata = {
            name: `ZG-${new Date().getTime().toString()}`,
        };
        formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

        const pinataOptions = {
            cidVersion: 1,
        };
        formData.append('pinataOptions', JSON.stringify(pinataOptions));

        // Get headers from formData
        const headers = {
            ...formData.getHeaders(),
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`, // Use server-side env variable
        };

        // Send the POST request to Pinata
        const res = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                maxContentLength: Infinity,
                headers: headers,
            }
        );

        console.log(res.data);
        return res.data.IpfsHash;
    } catch (e) {
        console.error(e);
        throw new Error('Unable to upload metadata');
    }
};




