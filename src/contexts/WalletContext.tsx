import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";

type WalletContextType = {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");

  useEffect(() => {
    if ((window as any).ethereum) {
      const p = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(p);

      (window as any).ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      });

      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      (window as any).ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  async function connectWallet() {
    if (!(window as any).ethereum) return;

    try {
      const p = new ethers.BrowserProvider((window as any).ethereum);
      await p.send("eth_requestAccounts", []);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      setProvider(p);
      setSigner(s);
      setAccount(addr);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }

  function disconnectWallet() {
    setAccount("");
    setSigner(null);
  }

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        account,
        connectWallet,
        disconnectWallet,
        isConnected: !!account,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
}
