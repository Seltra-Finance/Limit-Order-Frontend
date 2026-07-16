"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { seltraConfig } from "@/config/seltra.config";
import { activeChain, appKitEnabled, appKitNetworks, projectId, wagmiAdapter, wagmiConfig } from "@/lib/wallet";

if (appKitEnabled && wagmiAdapter) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [...appKitNetworks],
    defaultNetwork: appKitNetworks[activeChain.id === 43114 ? 1 : 0],
    projectId,
    metadata: {
      name: "Seltra",
      description: "Wallet-native limit orders on Avalanche.",
      url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      icons: [],
    },
    // Wallets only: no email/social login, no analytics beacon (CSP stays tight).
    features: { email: false, socials: false, analytics: false, swaps: false, onramp: false },
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#2dd4bf",
      "--w3m-border-radius-master": "2px",
      // Match the app's UI font (globals.css --font-ui); AppKit defaults to its own.
      "--w3m-font-family": "Inter, ui-sans-serif, system-ui, sans-serif",
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
