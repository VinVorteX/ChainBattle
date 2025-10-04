import { Header } from "@/components/Header";
import { CharacterCard } from "@/components/CharacterCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Swords, ArrowRightLeft, Shield } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const sampleCharacters = [
    { name: "Cyber Knight", attack: 85, defense: 70, speed: 60, rarity: "epic" as const, tokenId: "001" },
    { name: "Neon Assassin", attack: 95, defense: 45, speed: 90, rarity: "legendary" as const, tokenId: "042" },
    { name: "Data Guardian", attack: 60, defense: 95, speed: 50, rarity: "rare" as const, tokenId: "128" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                On-Chain Battle Arena
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mint unique NFT warriors, battle for glory, and trade with complete transparency. 
              Every action lives on the blockchain—true ownership, proven fairness.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button variant="hero" size="lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Mint Your Warrior
              </Button>
              <Button variant="outline" size="lg">
                View Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Built on Blockchain Principles
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">True Ownership</h3>
              <p className="text-muted-foreground">
                Every character is a unique NFT. You own it completely—trade, battle, or hold forever.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-accent/50 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_hsl(var(--accent)/0.5)] transition-all">
                <Swords className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Provably Fair Battles</h3>
              <p className="text-muted-foreground">
                All combat calculations happen on-chain. No hidden mechanics, no server manipulation.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all">
                <ArrowRightLeft className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Direct Trading</h3>
              <p className="text-muted-foreground">
                Peer-to-peer trading on the blockchain. No middlemen, complete transparency.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Characters Section */}
      <section id="collection" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Warriors</h2>
            <p className="text-muted-foreground">Recently minted on-chain characters</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {sampleCharacters.map((char) => (
              <CharacterCard key={char.tokenId} {...char} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-primary">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Mint Your Character</h3>
                <p className="text-muted-foreground">
                  Connect your wallet and mint a unique NFT warrior with randomized stats. 
                  The minting transaction is recorded on-chain permanently.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold border-2 border-accent">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Battle for Glory</h3>
                <p className="text-muted-foreground">
                  Challenge other players using simple, transparent combat rules. 
                  All battle outcomes are calculated and verified on the blockchain.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border-2 border-primary">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Trade Directly</h3>
                <p className="text-muted-foreground">
                  Buy, sell, or trade your warriors peer-to-peer. 
                  Smart contracts ensure secure, trustless transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-shimmer bg-[length:200%_auto]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Shield className="w-16 h-16 mx-auto text-accent animate-pulse-glow" />
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to Enter the Arena?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join the on-chain gaming revolution. Mint, battle, and trade with complete transparency.
            </p>
            <Button variant="hero" size="lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded" />
              <span className="font-bold">ChainBattle</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A fully transparent on-chain gaming experience
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
