import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Live Code Interviewer",
  description: "Live technical interview platform with real-time code editing and AI reports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#135bec",
          colorBackground: "#161b22",
          colorInputBackground: "#0d1117",
          colorInputText: "#e2e8f0",
        },
      }}
    >
      <html lang="en" className="dark">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </head>
        <body
          className={`${inter.variable} font-display antialiased`}
          style={{ backgroundColor: "#0d1117", color: "#e2e8f0" }}
          suppressHydrationWarning
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#21262d",
                color: "#e2e8f0",
                border: "1px solid #30363d",
                borderRadius: "8px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#238636", secondary: "#e2e8f0" } },
              error: { iconTheme: { primary: "#da3633", secondary: "#e2e8f0" } },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
