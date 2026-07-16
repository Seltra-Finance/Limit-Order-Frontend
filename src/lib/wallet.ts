import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { avalanche as appkitAvalanche, avalancheFuji as appkitFuji } from "@reown/appkit/networks";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { createConfig, http, type Config } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { seltraConfig } from "@/config/seltra.config";

const chain = seltraConfig.chainId === 43114 ? avalanche : avalancheFuji;
export const projectId = seltraConfig.walletConnectProjectId;

// With a Reown project id we run AppKit (its modal owns wallet discovery,
// deep links, and WalletConnect); without one — dev before the id exists —
// we fall back to plain wagmi connectors and the hand-built dialog.
// The flag is env-inlined at build time, so server and client always agree.
export const appKitEnabled = projectId !== "";

export const appKitNetworks = [appkitFuji, appkitAvalanche] as const;

const transports = {
  [avalancheFuji.id]: http(seltraConfig.chainId === 43113 ? seltraConfig.rpcUrl : undefined),
  [avalanche.id]: http(seltraConfig.chainId === 43114 ? seltraConfig.rpcUrl : undefined),
};

export const wagmiAdapter = appKitEnabled
  ? new WagmiAdapter({
      projectId,
      networks: [...appKitNetworks],
      transports,
      ssr: true,
    })
  : null;

export const wagmiConfig: Config =
  wagmiAdapter?.wagmiConfig ??
  createConfig({
    chains: [avalancheFuji, avalanche],
    connectors: [
      injected({ shimDisconnect: true }),
      coinbaseWallet({ appName: "Seltra" }),
      ...(projectId ? [walletConnect({ projectId, showQrModal: true })] : []),
    ],
    transports,
    ssr: true,
  });

export const activeChain = chain;
