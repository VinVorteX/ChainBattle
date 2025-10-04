import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Tag, Flame, Droplet, Wind, Mountain, TrendingUp, Filter, Package, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NFT_CONTRACT_ADDRESS, MARKETPLACE_CONTRACT_ADDRESS, BattlePetNFTABI, MarketplaceABI } from "@/contracts/config";
import { useWallet } from "@/contexts/WalletContext";

const DEMO_MODE = true;

type MarketListing = {
  listingId: number;
  tokenId: number;
  name: string;
  type: "Warrior" | "Mage" | "Assassin" | "Tank" | "Ranger";
  power: number;
  defense: number;
  level: number;
  element: "Fire" | "Water" | "Wind" | "Earth";
  image: string;
  price: string;
  seller: string;
  isOwned: boolean;
};

export default function Marketplace() {
  const { toast } = useToast();
  const { provider, signer, account, isConnected } = useWallet();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [myListings, setMyListings] = useState<MarketListing[]>([]);
  const [myCollection, setMyCollection] = useState<MarketListing[]>([]);
  const [sellPrice, setSellPrice] = useState<string>("0.05");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterElement, setFilterElement] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("price-low");

  useEffect(() => {
    loadMarketplace();
    if (isConnected && signer) {
      loadMyCollection();
      loadMarketplaceListings();
    }
  }, [isConnected, signer]);

  function loadMarketplace() {
    // Demo marketplace listings
    const demoListings: MarketListing[] = [
      {
        listingId: 1,
        tokenId: 6,
        name: "Charizard #6",
        type: "Warrior",
        power: 84,
        defense: 78,
        level: 3,
        element: "Fire",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
        price: "0.05",
        seller: "0x1234...5678",
        isOwned: false,
      },
      {
        listingId: 2,
        tokenId: 9,
        name: "Blastoise #9",
        type: "Tank",
        power: 83,
        defense: 100,
        level: 4,
        element: "Water",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
        price: "0.08",
        seller: "0xabcd...efgh",
        isOwned: false,
      },
      {
        listingId: 3,
        tokenId: 25,
        name: "Pikachu #25",
        type: "Assassin",
        power: 55,
        defense: 40,
        level: 2,
        element: "Wind",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
        price: "0.02",
        seller: "0x9876...4321",
        isOwned: false,
      },
      {
        listingId: 4,
        tokenId: 59,
        name: "Arcanine #59",
        type: "Warrior",
        power: 110,
        defense: 80,
        level: 5,
        element: "Fire",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png",
        price: "0.15",
        seller: "0x5555...6666",
        isOwned: false,
      },
      {
        listingId: 5,
        tokenId: 130,
        name: "Gyarados #130",
        type: "Warrior",
        power: 125,
        defense: 79,
        level: 6,
        element: "Water",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png",
        price: "0.20",
        seller: "0x7777...8888",
        isOwned: false,
      },
      {
        listingId: 6,
        tokenId: 76,
        name: "Golem #76",
        type: "Tank",
        power: 120,
        defense: 130,
        level: 5,
        element: "Earth",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/76.png",
        price: "0.12",
        seller: "0x3333...4444",
        isOwned: false,
      },
    ];
    setListings(demoListings);
  }

  async function loadMyCollection() {
    if (!signer || !account) return;

    try {
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, BattlePetNFTABI, signer);
      const tokenIds: bigint[] = await nftContract.tokensOfOwner(addr);
      
      const collection: MarketListing[] = [];
      for (const id of tokenIds) {
        const tokenId = Number(id);
        const element = ["Fire", "Water", "Wind", "Earth"][tokenId % 4] as any;
        const type = ["Warrior", "Mage", "Assassin", "Tank", "Ranger"][tokenId % 5] as any;
        
        collection.push({
          listingId: tokenId,
          tokenId,
          name: `${type} #${tokenId}`,
          type,
          power: 50 + (tokenId % 50),
          defense: 40 + (tokenId % 60),
          level: Math.floor(tokenId / 10) + 1,
          element,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${(tokenId % 150) + 1}.png`,
          price: "0",
          seller: account,
          isOwned: true,
        });
      }
      setMyCollection(collection);
    } catch (err) {
      console.error("Load collection error:", err);
    }
  }

  async function loadMarketplaceListings() {
    if (!signer) return;

    try {
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, BattlePetNFTABI, signer);
      const marketContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, MarketplaceABI, signer);
      
      // Get all NFTs and check which are listed
      const totalSupply = await nftContract.balanceOf(MARKETPLACE_CONTRACT_ADDRESS);
      const marketListings: MarketListing[] = [];
      
      // Check listings for token IDs (adjust range based on your NFT supply)
      for (let tokenId = 1; tokenId <= 100; tokenId++) {
        try {
          const price: bigint = await marketContract.listings(tokenId);
          if (price > 0n) {
            const seller = await marketContract.tokenSellers(tokenId);
            const element = ["Fire", "Water", "Wind", "Earth"][tokenId % 4] as any;
            const type = ["Warrior", "Mage", "Assassin", "Tank", "Ranger"][tokenId % 5] as any;
            
            marketListings.push({
              listingId: tokenId,
              tokenId,
              name: `${type} #${tokenId}`,
              type,
              power: 50 + (tokenId % 50),
              defense: 40 + (tokenId % 60),
              level: Math.floor(tokenId / 10) + 1,
              element,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${(tokenId % 150) + 1}.png`,
              price: ethers.formatEther(price),
              seller,
              isOwned: false,
            });
          }
        } catch {}
      }
      setListings(marketListings);
    } catch (err) {
      console.error("Load marketplace error:", err);
    }
  }

  async function buyNFT(listing: MarketListing) {
    if (!account) {
      toast({ title: "Connect Wallet", description: "Please connect wallet first", variant: "destructive" });
      return;
    }

    if (DEMO_MODE) {
      toast({ title: "Processing...", description: `Buying ${listing.name} for ${listing.price} ETH` });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setListings(prev => prev.filter(l => l.listingId !== listing.listingId));
      setMyCollection(prev => [...prev, { ...listing, isOwned: true }]);
      toast({ title: "Purchase Successful! 🎉", description: `You now own ${listing.name}` });
      return;
    }

    try {
      toast({ title: "Processing...", description: "Buying NFT..." });
      const marketContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, MarketplaceABI, signer);
      const tx = await marketContract.buyItem(listing.tokenId, {
        value: ethers.parseEther(listing.price)
      });
      await tx.wait();
      toast({ title: "Purchase Successful! 🎉", description: `You now own ${listing.name}` });
      await loadMyCollection();
      await loadMarketplaceListings();
    } catch (err: any) {
      toast({ title: "Purchase Failed", description: err?.message, variant: "destructive" });
    }
  }

  async function listNFT(nft: MarketListing, price: string) {
    if (!account) {
      toast({ title: "Connect Wallet", description: "Please connect wallet first", variant: "destructive" });
      return;
    }

    if (DEMO_MODE) {
      toast({ title: "Listing NFT...", description: "Creating marketplace listing" });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMyCollection(prev => prev.filter(n => n.listingId !== nft.listingId));
      const newListing = {
        ...nft,
        price,
        seller: account,
        listingId: Date.now(),
        isOwned: false,
      };
      setListings(prev => [newListing, ...prev]);
      toast({ title: "Listed! 🏷️", description: `Your NFT is now on sale for ${price} ETH` });
      return;
    }

    try {
      toast({ title: "Approving NFT...", description: "Step 1/2" });
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, BattlePetNFTABI, signer);
      const approveTx = await nftContract.approve(MARKETPLACE_CONTRACT_ADDRESS, nft.tokenId);
      await approveTx.wait();

      toast({ title: "Listing NFT...", description: "Step 2/2" });
      const marketContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, MarketplaceABI, signer);
      const listTx = await marketContract.listForSale(nft.tokenId, ethers.parseEther(price));
      await listTx.wait();

      toast({ title: "Listed! 🏷️", description: `Your NFT is now on sale for ${price} ETH` });
      await loadMyCollection();
      await loadMarketplaceListings();
    } catch (err: any) {
      toast({ title: "Listing Failed", description: err?.message, variant: "destructive" });
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

  const filteredListings = listings
    .filter(l => filterType === "all" || l.type === filterType)
    .filter(l => filterElement === "all" || l.element === filterElement)
    .sort((a, b) => {
      if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === "power") return b.power - a.power;
      if (sortBy === "level") return b.level - a.level;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NFT Marketplace
              </h1>
              <p className="text-muted-foreground mt-1">Buy and sell character NFTs</p>
            </div>
            
            {isConnected && (
              <Badge variant="outline" className="text-sm px-4 py-2">
                {account.slice(0, 6)}...{account.slice(-4)}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Listings</div>
              <div className="text-2xl font-bold">{listings.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Floor Price</div>
              <div className="text-2xl font-bold">0.02 ETH</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Volume (24h)</div>
              <div className="text-2xl font-bold">2.5 ETH</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Owners</div>
              <div className="text-2xl font-bold">156</div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="marketplace" className="mb-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="marketplace">🛒 Marketplace</TabsTrigger>
              <TabsTrigger value="collection">📦 My Collection ({myCollection.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace">
          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" />
              <h3 className="font-bold">Filters</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Type</label>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value="all">All Types</option>
                  <option value="Warrior">Warrior</option>
                  <option value="Mage">Mage</option>
                  <option value="Assassin">Assassin</option>
                  <option value="Tank">Tank</option>
                  <option value="Ranger">Ranger</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Element</label>
                <select 
                  value={filterElement} 
                  onChange={(e) => setFilterElement(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value="all">All Elements</option>
                  <option value="Fire">🔥 Fire</option>
                  <option value="Water">💧 Water</option>
                  <option value="Wind">💨 Wind</option>
                  <option value="Earth">🌍 Earth</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="power">Power: High to Low</option>
                  <option value="level">Level: High to Low</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Marketplace Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <motion.div
                key={listing.listingId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group">
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
                    <img 
                      src={listing.image} 
                      alt={listing.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform"
                    />
                    <Badge className="absolute top-2 right-2">
                      Lv.{listing.level}
                    </Badge>
                    <div className="absolute top-2 left-2">
                      {getElementIcon(listing.element)}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{listing.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">{listing.type}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Power:</span>
                        <span className="font-bold ml-1">{listing.power}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Defense:</span>
                        <span className="font-bold ml-1">{listing.defense}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="text-xl font-bold text-primary">{listing.price} ETH</span>
                      </div>
                      
                      <Button 
                        onClick={() => buyNFT(listing)}
                        className="w-full bg-gradient-to-br from-primary to-accent"
                        disabled={!account}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy Now
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      Seller: {listing.seller}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <Card className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No listings found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </Card>
          )}
            </TabsContent>

            <TabsContent value="collection">
              {myCollection.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No NFTs Yet</h3>
                  <p className="text-muted-foreground mb-4">Buy NFTs from the marketplace to see them here</p>
                  <Link to="/game">
                    <Button className="bg-gradient-to-br from-primary to-accent">
                      Or Mint New Character
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {myCollection.map((nft) => (
                    <Card key={nft.listingId} className="overflow-hidden border-green-500">
                      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
                        <img src={nft.image} alt={nft.name} className="w-full h-full object-contain p-4" />
                        <Badge className="absolute top-2 right-2 bg-green-500">Owned</Badge>
                        <div className="absolute top-2 left-2">{getElementIcon(nft.element)}</div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold">{nft.name}</h3>
                            <Badge variant="outline" className="text-xs mt-1">{nft.type}</Badge>
                          </div>
                          <Badge>Lv.{nft.level}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                          <div><span className="text-muted-foreground">Power:</span><span className="font-bold ml-1">{nft.power}</span></div>
                          <div><span className="text-muted-foreground">Defense:</span><span className="font-bold ml-1">{nft.defense}</span></div>
                        </div>
                        <div className="border-t pt-3 space-y-2">
                          <div className="text-sm text-muted-foreground">Purchased: <span className="font-bold text-primary">{nft.price} ETH</span></div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-gradient-to-br from-primary to-accent">
                                <DollarSign className="mr-2 h-4 w-4" />
                                Sell NFT
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>List {nft.name} for Sale</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Price (ETH)</label>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    value={sellPrice}
                                    onChange={(e) => setSellPrice(e.target.value)}
                                    placeholder="0.05"
                                  />
                                </div>
                                <Button 
                                  onClick={() => listNFT(nft, sellPrice)}
                                  className="w-full bg-gradient-to-br from-primary to-accent"
                                >
                                  List for {sellPrice} ETH
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Link to="/game"><Button className="w-full" variant="outline">Use in Battle</Button></Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
