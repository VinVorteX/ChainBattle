import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Package, Flame, Droplet, Wind, Mountain, Zap, Shield, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useWallet } from "@/contexts/WalletContext";
import { NFT_CONTRACT_ADDRESS, MARKETPLACE_CONTRACT_ADDRESS, BattlePetNFTABI, MarketplaceABI } from "@/contracts/config";

console.log("NFT Contract Address:", NFT_CONTRACT_ADDRESS);
import { Link } from "react-router-dom";

type Character = {
  tokenId: number;
  name: string;
  type: "Warrior" | "Mage" | "Assassin" | "Tank" | "Ranger";
  power: number;
  defense: number;
  element: "Fire" | "Water" | "Wind" | "Earth";
  image: string;
};

export default function Mint() {
  const { toast } = useToast();
  const { provider, signer, account, isConnected } = useWallet();
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [isMinting, setIsMinting] = useState(false);

  const characterTypes = ["Warrior", "Mage", "Assassin", "Tank", "Ranger"];
  const elements = ["Fire", "Water", "Wind", "Earth"];

  useEffect(() => {
    if (isConnected && signer) {
      loadCharacters();
    }
  }, [isConnected, signer]);

  function getPokemonIdByElement(element: string, seed: number): number {
    const pokemonByElement: Record<string, number[]> = {
      Fire: [4, 5, 6, 37, 38, 58, 59, 77, 78, 126, 136, 146],
      Water: [7, 8, 9, 54, 55, 60, 61, 62, 86, 87, 116, 117, 130, 131, 134],
      Wind: [16, 17, 18, 21, 22, 25, 26, 81, 82, 100, 101, 125, 135, 145],
      Earth: [27, 28, 31, 34, 50, 51, 74, 75, 76, 95, 104, 105, 111, 112],
    };
    const elementPokemon = pokemonByElement[element] || pokemonByElement.Fire;
    return elementPokemon[seed % elementPokemon.length];
  }

  async function loadCharacters() {
    if (!signer || !account) return;

    try {
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, BattlePetNFTABI, signer);
      const marketContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, MarketplaceABI, signer);
      const tokenIds = await nftContract.tokensOfOwner(account);
      
      const chars: Character[] = [];
      for (let i = 0; i < tokenIds.length; i++) {
        const tokenId = Number(tokenIds[i]);
        
        // Skip tokens listed on marketplace
        const listing = await marketContract.listings(tokenId);
        if (listing.active) continue;
        
        const element = elements[tokenId % 4] as any;
        const type = characterTypes[tokenId % 5] as any;
        const pokemonId = getPokemonIdByElement(element, tokenId);
        
        chars.push({
          tokenId,
          name: `${type} #${tokenId}`,
          type,
          power: 50 + (tokenId % 50),
          defense: 40 + (tokenId % 60),
          element,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
        });
      }
      
      setMyCharacters(chars);
    } catch (err) {
      console.error("Load characters error:", err);
    }
  }

  async function mintCharacter() {
    if (!account) {
      toast({ title: "Connect Wallet", description: "Please connect wallet first", variant: "destructive" });
      return;
    }

    try {
      setIsMinting(true);
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, BattlePetNFTABI, signer);
      
      const tx = await nftContract.mint(account);
      toast({ title: "Minting...", description: "Transaction submitted" });
      await tx.wait();
      
      toast({ title: "Character Minted! 🎉", description: "Your new warrior is ready!" });
      await loadCharacters();
    } catch (err: any) {
      console.error("Mint error:", err);
      const errorMsg = err?.reason || err?.message || "Unknown error";
      toast({ title: "Mint Failed", description: errorMsg, variant: "destructive" });
    } finally {
      setIsMinting(false);
    }
  }

  const getElementIcon = (element: string) => {
    switch (element) {
      case "Fire": return <Flame className="w-4 h-4 text-orange-500" />;
      case "Water": return <Droplet className="w-4 h-4 text-blue-500" />;
      case "Wind": return <Wind className="w-4 h-4 text-cyan-500" />;
      case "Earth": return <Mountain className="w-4 h-4 text-amber-700" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Mint Your Warrior
            </h1>
            <p className="text-xl text-muted-foreground">
              Create unique NFT characters with Pokemon powers
            </p>
          </div>

          {/* Mint Section */}
          <Card className="p-8 mb-12">
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
              
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Mint New Character</h2>
                <p className="text-muted-foreground mb-6">
                  Each character is unique with random Pokemon, type, and element
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Random Power
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Random Defense
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Random Element
                  </div>
                </div>
              </div>

              <Button 
                onClick={mintCharacter}
                disabled={!account || isMinting}
                size="lg"
                className="bg-gradient-to-br from-primary to-accent text-xl px-12 py-8"
              >
                <Sparkles className="mr-2 h-6 w-6" />
                {isMinting ? "Minting..." : "Mint Warrior"}
              </Button>

              {!isConnected && (
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to mint
                </p>
              )}
            </div>
          </Card>

          {/* My Collection */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">My Collection ({myCharacters.length})</h2>
              <Link to="/marketplace">
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  View in Marketplace
                </Button>
              </Link>
            </div>

            {myCharacters.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">No Characters Yet</h3>
                <p className="text-muted-foreground">Mint your first warrior to get started!</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {myCharacters.map((char) => (
                  <motion.div
                    key={char.tokenId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden hover:border-primary transition-all">
                      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
                        <img 
                          src={char.image} 
                          alt={char.name}
                          className="w-full h-full object-contain p-4"
                        />
                        <div className="absolute top-2 left-2">
                          {getElementIcon(char.element)}
                        </div>
                        <Badge className="absolute top-2 right-2">#{char.tokenId}</Badge>
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{char.name}</h3>
                            <Badge variant="outline" className="mt-1">{char.type}</Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Power
                            </span>
                            <span className="font-bold">{char.power}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Defense
                            </span>
                            <span className="font-bold">{char.defense}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <Link to="/game">
                            <Button className="w-full" variant="outline">
                              Use in Battle
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
