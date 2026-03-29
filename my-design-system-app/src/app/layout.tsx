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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "w3c690bb7n");`,
          }}
        />
      </head>
      <body className="min-h-full bg-gray-900 text-white">{children}</body>
    </html>
  );
}
