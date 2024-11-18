import { Livepeer } from "@livepeer/ai";

// Initialize the Livepeer client
const livepeer = new Livepeer({
    httpBearer: process.env.NEXT_PUBLIC_LIVEPEER_API_TOKEN || "",
});

// Define the interface for the API response
interface GeneratedImage {
    url: string;
    seed: number;
    nsfw: boolean;
}

interface TextToImageResponse {
    images: GeneratedImage[];
}

/**
 * Generates an image based on a text prompt using Livepeer AI API.
 * @param prompt - The text description to generate the image.
 * @returns A promise that resolves to the URL of the generated image.
 * @throws An error if the API call fails or no images are returned.
 */
export async function generateImage(prompt: string): Promise<string> {
    try {
        console.log("API Token:", process.env.NEXT_PUBLIC_LIVEPEER_API_TOKEN);

        const modelId: string = "SG161222/RealVisXL_V4.0_Lightning";

        // Send the prompt to the API
        const res = await livepeer.generate.textToImage({
            modelId: modelId,
            prompt,
        });

        // Log the raw response
        console.log("API Response:", res);

        // Check if the response contains the images field
        if (!res || !("images" in res)) {
            throw new Error("Unexpected response format from the Livepeer API.");
        }

        // Cast the response to the expected structure
        const responseValue = res as TextToImageResponse;

        // Validate and return the first image URL
        const images = responseValue.images;
        if (images && images.length > 0) {
            return images[0].url;
        } else {
            throw new Error("No images returned from the API.");
        }
    } catch (error) {
        console.error("Error in generateImage:", error);
        throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
    }
}
