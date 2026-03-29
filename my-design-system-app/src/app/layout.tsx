import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Weave - Travel the Feeling",
  description: "Immersive travel landing page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gray-900 text-white">{children}</body>
    </html>
  );
}
