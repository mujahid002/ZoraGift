// lib/generateImage.ts

// import { Livepeer } from "@livepeer/ai";
import { LivepeerCore } from "@livepeer/ai/core";
import { generateTextToImage } from "@livepeer/ai/funcs/generateTextToImage";

// Define interfaces for the API response
interface GeneratedImage {
  url: string;
  seed: number;
  nsfw: boolean;
}

interface TextToImageResponse {
  images: GeneratedImage[];
}

const livepeer = new LivepeerCore({
  httpBearer: process.env.NEXT_PUBLIC_LIVEPEER_API_TOKEN || "",
});

// const livepeer = new Livepeer({
//     httpBearer: process.env.NEXT_PUBLIC_LIVEPEER_API_TOKEN || "",
//   });

export async function generateImage(prompt: string): Promise<string> {
  const res = await generateTextToImage(livepeer, {
    modelId: "black-forest-labs/FLUX.1-dev",
    // modelId: "SG161222/RealVisXL_V4.0_Lightning",
    prompt,
  });

  // const res = await livepeer.generate.textToImage({
  //     prompt,
  //   });

  console.log(res)

  if (!res.ok) {
    console.error("Unable to Generate image")
  }



  // Cast the response value to the expected type
  const responseValue = res.value?.imageResponse as unknown as TextToImageResponse;

  const images = responseValue.images;

  if (images && images.length > 0) {
    const imageUrl = images[0].url;
    return imageUrl;
  } else {
    throw new Error("No images returned from the API.");
  }
}
