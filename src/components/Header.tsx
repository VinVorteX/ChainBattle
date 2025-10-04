import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export const Header = () => {
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
          <a href="#mint" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Mint
          </a>
          <a href="#battle" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Battle
          </a>
          <a href="#trade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Trade
          </a>
          <a href="#collection" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Collection
          </a>
        </nav>
        
        <Button variant="neon" size="sm">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </header>
  );
};
