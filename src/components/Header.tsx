import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
  IconSword,
  IconShoppingCart,
  IconRocket,
} from "@tabler/icons-react";

export const Header = () => {
  const links = [
    {
      title: "Mint",
      icon: (
        <IconRocket className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#mint",
    },
    {
      title: "Battle",
      icon: (
        <IconSword className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#battle",
    },
    {
      title: "Trade",
      icon: (
        <IconShoppingCart className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#trade",
    },
    {
      title: "Collection",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#collection",
    },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg animate-pulse-glow" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ChainBattle
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <FloatingDock
            items={links}
          />
        </nav>
        
        <Button variant="neon" size="sm">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </header>
  );
};
