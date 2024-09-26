import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "./globals.css";
// import MagicProvider from "@/components/providers/MagicProvider";

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
      {/* <MagicProvider> */}
      <body className={chakra_petch.className}> {children}</body>
      {/* </MagicProvider> */}
    </html>
  );
}
