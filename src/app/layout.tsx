import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import PaletteProvider from "@/components/PaletteProvider";

const ebGaramond = EB_Garamond({ 
  subsets: ["latin"],
  variable: "--font-heading"
});

const ibmPlex = IBM_Plex_Sans({ 
  weight: ['400', '500', '600'],
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "St Henry Catholic Church",
  description: "Welcome to St Henry Catholic Church - A vibrant community of faith in Brigham City, Utah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ebGaramond.variable} ${ibmPlex.variable}`}>
        <PaletteProvider>
          {children}
        </PaletteProvider>
      </body>
    </html>
  );
}
