import { PinataSDK } from "pinata";

export const Upload = async (data: any) => {
    const pinata = new PinataSDK({
        pinataJwt: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
        pinataGateway: "white-underlying-coral-820.mypinata.cloud",
    });

    const res = await pinata.upload.json({
        data
    })

    return res;
}


