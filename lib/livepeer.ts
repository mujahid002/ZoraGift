export const createLivepeerAsset = async (assetName: string) => {
    const response = await fetch(
        "https://livepeer.studio/api/asset/request-upload",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVEPEER_API_T}`, // Use your Livepeer API key
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: assetName,

            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create Livepeer asset.");
    }

    const data = await response.json();
    return data;
};
