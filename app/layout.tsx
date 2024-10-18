import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "./globals.css";

const chakra_petch = Chakra_Petch({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "ZoraGift",
  description: "Gift with Onchain Memories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <title>ZoraGift</title>
      <meta
        name="description"
        content="Generative AI from Livepeer & Minting experience from Zora"
      />

      {/* <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/public/favicon.ico" /> */}
      <body className={chakra_petch.className}> {children}</body>
    </html>
  );
}
