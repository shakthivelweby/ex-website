"use client";

import { DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={dmSans.className}>
        <QueryClientProvider client={queryClient}>
          <Header />
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
