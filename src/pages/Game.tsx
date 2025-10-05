import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Swords, Trophy, Shield, Zap, Users, Bot, Flame, Droplet, Wind, Mountain, Target, Gamepad2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useWallet } from "@/contexts/WalletContext";
import { BattlePetNFTABI, MARKETPLACE_CONTRACT_ADDRESS, MarketplaceABI } from "@/contracts/config";
import PlatformerGame from "@/components/PlatformerGame";

const NFT_CONTRACT_ADDRESS = "0xff3Ff566E5f0cEaA7337FB1752a6A8ec5d62f362";
const GAME_CONTRACT_ADDRESS = "0x75F740d3C424452aA99d9FEe5754C50bb4F8f594";

const DEMO_MODE = false;

const NFT_CONTRACT_ABI = BattlePetNFTABI;

const GAME_CONTRACT_ABI = [
  "function battle(uint256 tokenA, uint256 tokenB) returns (bytes32)",
  "function getCharacterStats(uint256 tokenId) view returns (uint256 power, uint256 defense, uint256 wins, uint256 level)",
  "event BattleResult(bytes32 indexed battleId, uint256 winnerToken, uint256 loserToken, address winner, address loser)",
];

type Character = {
  tokenId: number;
  name: string;
  type: "Warrior" | "Mage" | "Assassin" | "Tank" | "Ranger";
  power: number;
  defense: number;
  wins: number;
  level: number;
  element: "Fire" | "Water" | "Wind" | "Earth";
  image?: string;
};

type GameMode = "menu" | "singleplayer" | "multiplayer" | "platformer";
type BattleState = "selecting" | "battling" | "result";
type BattleTurn = "player" | "opponent";

export default function Game() {
  const { toast } = useToast();
  const { provider, signer, account, isConnected } = useWallet();
  
  const [gameMode, setGameMode] = useState<GameMode>("menu");
  const [battleState, setBattleState] = useState<BattleState>("selecting");
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [opponentChar, setOpponentChar] = useState<Character | null>(null);
  const [battleResult, setBattleResult] = useState<{ winner: Character; loser: Character; details: string } | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isBattling, setIsBattling] = useState(false);
  const [demoMode, setDemoMode] = useState(DEMO_MODE);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [currentTurn, setCurrentTurn] = useState<BattleTurn>("player");
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [superAttackReady, setSuperAttackReady] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  const characterTypes = ["Warrior", "Mage", "Assassin", "Tank", "Ranger"];
  const elements = ["Fire", "Water", "Wind", "Earth"];

  useEffect(() => {
    if (DEMO_MODE) {
      loadDemoCharacters();
    } else if (isConnected && signer) {
      loadCharacters();
    }
  }, [isConnected, signer]);



  function getPokemonByElement(element: string, seed: number): { id: number; power: number; defense: number } {
    // Pokemon organized by element type with their base stats
    const pokemonByElement: Record<string, Array<{ id: number; power: number; defense: number }>> = {
      Fire: [
        { id: 4, power: 52, defense: 43 },   // Charmander
        { id: 5, power: 64, defense: 58 },   // Charmeleon
        { id: 6, power: 84, defense: 78 },   // Charizard
        { id: 37, power: 41, defense: 40 },  // Vulpix
        { id: 38, power: 76, defense: 75 },  // Ninetales
        { id: 58, power: 70, defense: 45 },  // Growlithe
        { id: 59, power: 110, defense: 80 }, // Arcanine
        { id: 77, power: 85, defense: 70 },  // Ponyta
        { id: 78, power: 100, defense: 70 }, // Rapidash
        { id: 126, power: 95, defense: 57 }, // Magmar
        { id: 136, power: 130, defense: 60 },// Flareon
        { id: 146, power: 100, defense: 90 },// Moltres
      ],
      Water: [
        { id: 7, power: 48, defense: 65 },   // Squirtle
        { id: 8, power: 63, defense: 80 },   // Wartortle
        { id: 9, power: 83, defense: 100 },  // Blastoise
        { id: 54, power: 52, defense: 48 },  // Psyduck
        { id: 55, power: 82, defense: 78 },  // Golduck
        { id: 60, power: 50, defense: 40 },  // Poliwag
        { id: 61, power: 65, defense: 65 },  // Poliwhirl
        { id: 62, power: 95, defense: 95 },  // Poliwrath
        { id: 86, power: 45, defense: 55 },  // Seel
        { id: 87, power: 70, defense: 80 },  // Dewgong
        { id: 116, power: 40, defense: 70 }, // Horsea
        { id: 117, power: 65, defense: 95 }, // Seadra
        { id: 130, power: 125, defense: 79 },// Gyarados
        { id: 131, power: 85, defense: 80 }, // Lapras
        { id: 134, power: 110, defense: 95 },// Vaporeon
      ],
      Wind: [
        { id: 16, power: 45, defense: 40 },  // Pidgey
        { id: 17, power: 60, defense: 55 },  // Pidgeotto
        { id: 18, power: 80, defense: 75 },  // Pidgeot
        { id: 21, power: 60, defense: 30 },  // Spearow
        { id: 22, power: 90, defense: 65 },  // Fearow
        { id: 25, power: 55, defense: 40 },  // Pikachu
        { id: 26, power: 90, defense: 55 },  // Raichu
        { id: 81, power: 35, defense: 70 },  // Magnemite
        { id: 82, power: 60, defense: 95 },  // Magneton
        { id: 100, power: 30, defense: 50 }, // Voltorb
        { id: 101, power: 50, defense: 70 }, // Electrode
        { id: 125, power: 83, defense: 57 }, // Electabuzz
        { id: 135, power: 110, defense: 65 },// Jolteon
        { id: 145, power: 90, defense: 85 }, // Zapdos
      ],
      Earth: [
        { id: 27, power: 75, defense: 85 },  // Sandshrew
        { id: 28, power: 100, defense: 110 },// Sandslash
        { id: 31, power: 92, defense: 87 },  // Nidoqueen
        { id: 34, power: 102, defense: 77 }, // Nidoking
        { id: 50, power: 55, defense: 25 },  // Diglett
        { id: 51, power: 100, defense: 60 }, // Dugtrio
        { id: 74, power: 80, defense: 100 }, // Geodude
        { id: 75, power: 95, defense: 115 }, // Graveler
        { id: 76, power: 120, defense: 130 },// Golem
        { id: 95, power: 45, defense: 160 }, // Onix
        { id: 104, power: 50, defense: 95 }, // Cubone
        { id: 105, power: 80, defense: 110 },// Marowak
        { id: 111, power: 85, defense: 95 }, // Rhyhorn
        { id: 112, power: 130, defense: 120 },// Rhydon
      ],
    };

    const elementPokemon = pokemonByElement[element] || pokemonByElement.Fire;
    return elementPokemon[seed % elementPokemon.length];
  }

  function getPokemonData(element: string, tokenId: number): { image: string; power: number; defense: number } {
    const pokemon = getPokemonByElement(element, tokenId);
    return {
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
      power: pokemon.power,
      defense: pokemon.defense,
    };
  }

  function loadDemoCharacters() {
    const char1 = getPokemonData("Fire", 2); // Charizard
    const char2 = getPokemonData("Water", 2); // Blastoise
    const char3 = getPokemonData("Wind", 4); // Pikachu
    
    const demoChars: Character[] = [
      {
        tokenId: 1,
        name: "Warrior #1",
        type: "Warrior",
        power: char1.power,
        defense: char1.defense,
        wins: 5,
        level: 2,
        element: "Fire",
        image: char1.image,
      },
      {
        tokenId: 2,
        name: "Mage #2",
        type: "Mage",
        power: char2.power,
        defense: char2.defense,
        wins: 8,
        level: 3,
        element: "Water",
        image: char2.image,
      },
      {
        tokenId: 3,
        name: "Assassin #3",
        type: "Assassin",
        power: char3.power,
        defense: char3.defense,
        wins: 3,
        level: 2,
        element: "Wind",
        image: char3.image,
      },
    ];
    setMyCharacters(demoChars);
  }

  async function loadCharacters() {
    if (!signer || !account) return;

    try {
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, BattlePetNFTABI, signer);
      const marketContract = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, MarketplaceABI, signer);
      const tokenIds = await nftContract.tokensOfOwner(account);
      
      console.log("Token IDs:", tokenIds);
      
      const chars: Character[] = [];
      for (let i = 0; i < tokenIds.length; i++) {
        const tokenId = Number(tokenIds[i]);
        
        // Skip tokens listed on marketplace
        const listing = await marketContract.listings(tokenId);
        if (listing.active) continue;
        
        const element = elements[tokenId % 4] as any;
        const type = characterTypes[tokenId % 5] as any;
        const pokemonData = getPokemonData(element, tokenId);
        
        chars.push({
          tokenId,
          name: `${type} #${tokenId}`,
          type,
          power: pokemonData.power,
          defense: pokemonData.defense,
          wins: 0,
          level: 1,
          element,
          image: pokemonData.image,
        });
      }
      
      console.log("Loaded characters:", chars);
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

    if (demoMode) {
      setIsMinting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newTokenId = myCharacters.length + 1;
      const element = elements[(myCharacters.length) % 4] as any;
      const pokemonData = getPokemonData(element, newTokenId);
      
      const newChar: Character = {
        tokenId: newTokenId,
        name: `${characterTypes[(myCharacters.length) % 5]} #${newTokenId}`,
        type: characterTypes[(myCharacters.length) % 5] as any,
        power: pokemonData.power,
        defense: pokemonData.defense,
        wins: 0,
        level: 1,
        element,
        image: pokemonData.image,
      };
      setMyCharacters([...myCharacters, newChar]);
      setIsMinting(false);
      toast({ title: "Character Minted! 🎉", description: "Your new warrior is ready! (Demo)" });
      return;
    }

    try {
      setIsMinting(true);
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, BattlePetNFTABI, signer);
      
      console.log("Calling mint with account:", account);
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

  function generateAIOpponent() {
    const tokenId = Math.floor(Math.random() * 1000);
    const wins = Math.floor(Math.random() * 15);
    const level = Math.floor(wins / 3) + 1;
    const element = elements[tokenId % 4] as any;
    const pokemonData = getPokemonData(element, tokenId);

    return {
      tokenId,
      name: `AI ${characterTypes[tokenId % 5]} #${tokenId}`,
      type: characterTypes[tokenId % 5] as any,
      power: pokemonData.power,
      defense: pokemonData.defense,
      wins,
      level,
      element,
      image: pokemonData.image,
    };
  }

  function startSinglePlayer() {
    if (myCharacters.length === 0) {
      toast({ title: "No Characters", description: "Mint a character first!", variant: "destructive" });
      return;
    }
    setGameMode("singleplayer");
    setBattleState("selecting");
    setSelectedChar(null);
    setOpponentChar(null);
    setBattleResult(null);
  }

  function startPlatformer() {
    if (myCharacters.length === 0) {
      toast({ title: "No Characters", description: "Mint a character first!", variant: "destructive" });
      return;
    }
    setGameMode("platformer");
    setBattleState("selecting");
    setSelectedChar(null);
    setBattleResult(null);
  }

  function startMultiplayer() {
    if (myCharacters.length === 0) {
      toast({ title: "No Characters", description: "Mint a character first!", variant: "destructive" });
      return;
    }
    setGameMode("multiplayer");
    setBattleState("selecting");
    setSelectedChar(null);
    setOpponentChar(null);
    setBattleResult(null);
  }

  function selectMyCharacter(char: Character) {
    setSelectedChar(char);
    if (gameMode === "singleplayer") {
      setOpponentChar(generateAIOpponent());
    }
  }

  function startBattle() {
    if (!selectedChar || !opponentChar) return;
    const playerAvg = (selectedChar.power + selectedChar.defense) / 2;
    const opponentAvg = (opponentChar.power + opponentChar.defense) / 2;
    const winner = playerAvg > opponentAvg ? selectedChar : opponentChar;
    const loser = playerAvg > opponentAvg ? opponentChar : selectedChar;
    const details = `${winner.name} wins! (Avg: ${playerAvg > opponentAvg ? playerAvg.toFixed(1) : opponentAvg.toFixed(1)} vs ${playerAvg > opponentAvg ? opponentAvg.toFixed(1) : playerAvg.toFixed(1)})`;
    setBattleResult({ winner, loser, details });
    setBattleState("result");
    if (winner.tokenId === selectedChar.tokenId) {
      toast({ title: "Victory! 🎉", description: "Your character's stats were higher!" });
      setMyCharacters(prev => prev.map(c => 
        c.tokenId === selectedChar.tokenId ? { ...c, wins: c.wins + 1, level: Math.floor((c.wins + 1) / 3) + 1 } : c
      ));
    } else {
      toast({ title: "Defeated", description: "Opponent had better stats!", variant: "destructive" });
    }
  }

  async function performAttack(isSuper: boolean = false) {
    if (!selectedChar || !opponentChar || currentTurn !== "player") return;

    const baseDamage = selectedChar.power * 0.5;
    const damage = isSuper ? baseDamage * 2.5 : baseDamage;
    const actualDamage = Math.max(5, Math.round(damage - opponentChar.defense * 0.2 + Math.random() * 10));
    
    const newOpponentHP = Math.max(0, opponentHP - actualDamage);
    setOpponentHP(newOpponentHP);
    
    const attackType = isSuper ? "SUPER ATTACK" : "Attack";
    setBattleLog(prev => [...prev, `${selectedChar.name} used ${attackType}! Dealt ${actualDamage} damage!`]);
    
    if (isSuper) setSuperAttackReady(false);
    
    if (newOpponentHP <= 0) {
      endBattle(true);
      return;
    }
    
    setCurrentTurn("opponent");
    await new Promise(resolve => setTimeout(resolve, 1500));
    opponentAttack();
  }

  async function opponentAttack() {
    if (!selectedChar || !opponentChar) return;

    const baseDamage = opponentChar.power * 0.5;
    const isSuper = Math.random() > 0.7;
    const damage = isSuper ? baseDamage * 2.5 : baseDamage;
    const actualDamage = Math.max(5, Math.round(damage - selectedChar.defense * 0.2 + Math.random() * 10));
    
    const newPlayerHP = Math.max(0, playerHP - actualDamage);
    setPlayerHP(newPlayerHP);
    
    const attackType = isSuper ? "SUPER ATTACK" : "Attack";
    setBattleLog(prev => [...prev, `${opponentChar.name} used ${attackType}! Dealt ${actualDamage} damage!`]);
    
    if (newPlayerHP <= 0) {
      endBattle(false);
      return;
    }
    
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    if (newTurnCount % 3 === 0) setSuperAttackReady(true);
    
    setCurrentTurn("player");
  }

  function endBattle(playerWon: boolean) {
    const winner = playerWon ? selectedChar! : opponentChar!;
    const loser = playerWon ? opponentChar! : selectedChar!;
    const details = `${winner.name} wins with ${playerWon ? playerHP : opponentHP} HP remaining!`;
    
    setBattleResult({ winner, loser, details });
    setBattleState("result");
    
    if (playerWon) {
      toast({ title: "Victory! 🎉", description: "Your character gained experience!" });
      setMyCharacters(prev => prev.map(c => 
        c.tokenId === selectedChar!.tokenId
          ? { ...c, wins: c.wins + 1, level: Math.floor((c.wins + 1) / 3) + 1 }
          : c
      ));
    } else {
      toast({ title: "Defeated", description: "Better luck next time!", variant: "destructive" });
    }
  }



  function resetBattle() {
    setBattleState("selecting");
    setSelectedChar(null);
    setOpponentChar(null);
    setBattleResult(null);
    setPlayerHP(100);
    setOpponentHP(100);
    setBattleLog([]);
    setSuperAttackReady(false);
    setTurnCount(0);
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

  const getCharacterGradient = (type: string, element: string) => {
    const gradients: Record<string, string> = {
      "Warrior-Fire": "from-red-600 via-orange-500 to-yellow-500",
      "Warrior-Water": "from-blue-600 via-cyan-500 to-teal-500",
      "Warrior-Wind": "from-cyan-400 via-sky-500 to-blue-400",
      "Warrior-Earth": "from-amber-700 via-yellow-600 to-orange-600",
      "Mage-Fire": "from-purple-600 via-pink-500 to-red-500",
      "Mage-Water": "from-indigo-600 via-blue-500 to-cyan-400",
      "Mage-Wind": "from-violet-500 via-purple-400 to-pink-400",
      "Mage-Earth": "from-green-700 via-emerald-600 to-lime-500",
      "Assassin-Fire": "from-gray-800 via-red-900 to-black",
      "Assassin-Water": "from-slate-700 via-blue-900 to-black",
      "Assassin-Wind": "from-gray-700 via-slate-600 to-gray-800",
      "Assassin-Earth": "from-stone-800 via-amber-900 to-black",
      "Tank-Fire": "from-orange-800 via-red-700 to-gray-700",
      "Tank-Water": "from-blue-800 via-indigo-700 to-gray-700",
      "Tank-Wind": "from-sky-700 via-slate-600 to-gray-700",
      "Tank-Earth": "from-yellow-800 via-amber-700 to-stone-700",
      "Ranger-Fire": "from-lime-600 via-orange-500 to-red-500",
      "Ranger-Water": "from-teal-600 via-cyan-500 to-blue-500",
      "Ranger-Wind": "from-emerald-500 via-teal-400 to-cyan-400",
      "Ranger-Earth": "from-green-700 via-lime-600 to-yellow-500",
    };
    return gradients[`${type}-${element}`] || "from-primary to-accent";
  };

  const getCharacterIcon = (type: string) => {
    switch (type) {
      case "Warrior": return <Swords className="w-20 h-20" />;
      case "Mage": return <Sparkles className="w-20 h-20" />;
      case "Assassin": return <Zap className="w-20 h-20" />;
      case "Tank": return <Shield className="w-20 h-20" />;
      case "Ranger": return <Target className="w-20 h-20" />;
      default: return <Swords className="w-20 h-20" />;
    }
  };

  const CharacterCard = ({ char, onClick, selected }: { char: Character; onClick?: () => void; selected?: boolean }) => (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:border-primary hover:shadow-xl ${selected ? 'border-primary border-2 shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{char.name}</h3>
          <Badge variant="outline" className="mt-1">{char.type}</Badge>
        </div>
        <div className="flex items-center gap-1">
          {getElementIcon(char.element)}
          <Badge>Lv.{char.level}</Badge>
        </div>
      </div>

      <div className={`relative w-full h-48 bg-gradient-to-br ${getCharacterGradient(char.type, char.element)} rounded-lg mb-3 flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        {char.image ? (
          <img 
            src={char.image} 
            alt={char.name}
            className="relative z-10 w-full h-full object-contain p-2 drop-shadow-2xl"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className="fallback-icon hidden absolute z-10 text-white drop-shadow-lg">
          {getCharacterIcon(char.type)}
        </div>
        <div className="absolute bottom-2 right-2 text-white/40 text-3xl font-bold drop-shadow">
          #{char.tokenId}
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
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Wins
          </span>
          <span className="font-bold text-primary">{char.wins}</span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Demo Mode Toggle */}
          {DEMO_MODE && (
            <Card className="p-4 mb-4 bg-primary/10 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">🎮 Demo Mode</h3>
                  <p className="text-sm text-muted-foreground">Test the game without wallet or contracts</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDemoMode(!demoMode)}
                >
                  {demoMode ? "Disable Demo" : "Enable Demo"}
                </Button>
              </div>
            </Card>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Battle Arena
              </h1>
              <p className="text-muted-foreground mt-1">1v1 Card Battle Game - Mint, Battle, Level Up!</p>
            </div>
            
            {isConnected && (
              <div className="text-right space-y-2">
                <Badge variant="outline" className="text-sm block">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {myCharacters.length} Character{myCharacters.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          {/* Main Menu */}
          {gameMode === "menu" && (
            <div className="space-y-8">
              <Card className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Choose Game Mode</h2>
                <p className="text-muted-foreground mb-8">Select how you want to battle</p>
                
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6 hover:border-primary transition-all cursor-pointer" onClick={startSinglePlayer}>
                    <Bot className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">Single Player</h3>
                    <p className="text-sm text-muted-foreground mb-4">Battle against AI opponents</p>
                    <Button className="w-full">
                      <Bot className="mr-2 h-4 w-4" />
                      Play vs AI
                    </Button>
                  </Card>

                  <Card className="p-6 hover:border-accent transition-all cursor-pointer" onClick={startMultiplayer}>
                    <Users className="w-16 h-16 mx-auto mb-4 text-accent" />
                    <h3 className="text-xl font-bold mb-2">Multiplayer</h3>
                    <p className="text-sm text-muted-foreground mb-4">Challenge other players</p>
                    <Button className="w-full" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Play vs Player
                    </Button>
                  </Card>

                  <Card className="p-6 hover:border-green-500 transition-all cursor-pointer" onClick={startPlatformer}>
                    <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-xl font-bold mb-2">Platformer</h3>
                    <p className="text-sm text-muted-foreground mb-4">2D side-scrolling adventure</p>
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Play Platformer
                    </Button>
                  </Card>
                </div>
              </Card>

              {/* Mint Section */}
              <Card className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Mint New Character</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a unique NFT warrior with random stats (0.001 ETH)
                    </p>
                  </div>
                  <Button 
                    onClick={mintCharacter} 
                    disabled={!account || isMinting}
                    size="lg"
                    className="bg-gradient-to-br from-primary to-accent"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isMinting ? "Minting..." : "Mint Character"}
                  </Button>
                </div>
              </Card>

              {/* My Characters */}
              {myCharacters.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">My Characters</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {myCharacters.map((char) => (
                      <CharacterCard key={char.tokenId} char={char} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Platformer Game */}
          {gameMode === "platformer" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Platformer Mode
                </Badge>
                <Button variant="outline" onClick={() => setGameMode("menu")}>
                  Back to Menu
                </Button>
              </div>

              {battleState === "selecting" && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Select Your Character</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {myCharacters.map((char) => (
                      <CharacterCard 
                        key={char.tokenId} 
                        char={char} 
                        onClick={() => {
                          setSelectedChar(char);
                          setBattleState("battling");
                        }}
                        selected={selectedChar?.tokenId === char.tokenId}
                      />
                    ))}
                  </div>
                </Card>
              )}

              {battleState === "battling" && selectedChar && (
                <PlatformerGame
                  character={selectedChar}
                  onComplete={(won) => {
                    if (won) {
                      setMyCharacters(prev => prev.map(c => 
                        c.tokenId === selectedChar.tokenId
                          ? { ...c, wins: c.wins + 1, level: Math.floor((c.wins + 1) / 3) + 1 }
                          : c
                      ));
                    }
                  }}
                  onExit={() => setGameMode("menu")}
                />
              )}
            </div>
          )}

          {/* Battle Screen */}
          {(gameMode === "singleplayer" || gameMode === "multiplayer") && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {gameMode === "singleplayer" ? "🤖 Single Player" : "👥 Multiplayer"}
                </Badge>
                <Button variant="outline" onClick={() => setGameMode("menu")}>
                  Back to Menu
                </Button>
              </div>

              {battleState === "selecting" && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Select Your Character</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {myCharacters.map((char) => (
                        <CharacterCard 
                          key={char.tokenId} 
                          char={char} 
                          onClick={() => selectMyCharacter(char)}
                          selected={selectedChar?.tokenId === char.tokenId}
                        />
                      ))}
                    </div>
                  </Card>

                  {selectedChar && opponentChar && (
                    <Card className="p-6 text-center">
                      <h3 className="text-xl font-bold mb-4">Ready to Battle!</h3>
                      <Button 
                        onClick={startBattle} 
                        size="lg"
                        className="bg-gradient-to-br from-primary to-accent"
                      >
                        <Swords className="mr-2 h-5 w-5" />
                        Start Battle!
                      </Button>
                    </Card>
                  )}
                </div>
              )}

              {battleState === "battling" && selectedChar && opponentChar && (
                <div className="space-y-4">
                  {/* Battle Arena */}
                  <Card className="p-6 bg-gradient-to-b from-background to-muted">
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      {/* Player Side */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="text-lg px-4 py-2">You</Badge>
                          <Badge variant="outline" className="text-lg px-4 py-2">Lv.{selectedChar.level}</Badge>
                        </div>
                        <div className="relative">
                          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-green-500 to-green-400"
                              initial={{ width: "100%" }}
                              animate={{ width: `${playerHP}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div className="text-center text-sm font-bold mt-1">{playerHP}/100 HP</div>
                        </div>
                        <motion.div 
                          className="relative h-64 flex items-end justify-center"
                          animate={currentTurn === "player" ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <img 
                            src={selectedChar.image} 
                            alt={selectedChar.name}
                            className="w-48 h-48 object-contain drop-shadow-2xl"
                          />
                        </motion.div>
                        <div className="text-center">
                          <h3 className="font-bold text-lg">{selectedChar.name}</h3>
                          <div className="flex gap-2 justify-center mt-2">
                            {getElementIcon(selectedChar.element)}
                            <Badge variant="outline">{selectedChar.type}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Opponent Side */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="destructive" className="text-lg px-4 py-2">Opponent</Badge>
                          <Badge variant="outline" className="text-lg px-4 py-2">Lv.{opponentChar.level}</Badge>
                        </div>
                        <div className="relative">
                          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-red-500 to-red-400"
                              initial={{ width: "100%" }}
                              animate={{ width: `${opponentHP}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div className="text-center text-sm font-bold mt-1">{opponentHP}/100 HP</div>
                        </div>
                        <motion.div 
                          className="relative h-64 flex items-end justify-center"
                          animate={currentTurn === "opponent" ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <img 
                            src={opponentChar.image} 
                            alt={opponentChar.name}
                            className="w-48 h-48 object-contain drop-shadow-2xl transform scale-x-[-1]"
                          />
                        </motion.div>
                        <div className="text-center">
                          <h3 className="font-bold text-lg">{opponentChar.name}</h3>
                          <div className="flex gap-2 justify-center mt-2">
                            {getElementIcon(opponentChar.element)}
                            <Badge variant="outline">{opponentChar.type}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Battle Controls */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {currentTurn === "player" ? "Your Turn" : "Opponent's Turn"}
                      </Badge>
                      <Badge className="text-lg px-4 py-2">Turn {turnCount + 1}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Button 
                        size="lg"
                        onClick={() => performAttack(false)}
                        disabled={currentTurn !== "player"}
                        className="h-20 text-lg"
                      >
                        <Swords className="mr-2 h-6 w-6" />
                        Attack
                      </Button>
                      <Button 
                        size="lg"
                        onClick={() => performAttack(true)}
                        disabled={currentTurn !== "player" || !superAttackReady}
                        className="h-20 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        <Zap className="mr-2 h-6 w-6" />
                        Super Attack
                        {!superAttackReady && <span className="ml-2 text-xs">(Ready in {3 - (turnCount % 3)} turns)</span>}
                      </Button>
                    </div>

                    {/* Battle Log */}
                    <Card className="p-4 bg-muted max-h-32 overflow-y-auto">
                      <h4 className="font-bold mb-2 text-sm">Battle Log</h4>
                      <div className="space-y-1 text-sm">
                        {battleLog.slice(-5).map((log, i) => (
                          <div key={i} className="text-muted-foreground">{log}</div>
                        ))}
                      </div>
                    </Card>
                  </Card>
                </div>
              )}

              {battleState === "result" && battleResult && (
                <Card className="p-8">
                  <AnimatePresence>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center space-y-6"
                    >
                      <Trophy className="w-24 h-24 mx-auto text-primary animate-bounce" />
                      <h2 className="text-4xl font-bold">
                        {battleResult.winner.tokenId === selectedChar?.tokenId ? "🎉 Victory!" : "💀 Defeated"}
                      </h2>
                      <p className="text-xl text-muted-foreground">{battleResult.details}</p>

                      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
                        <div>
                          <Badge className="mb-4 bg-green-500">Winner</Badge>
                          <CharacterCard char={battleResult.winner} />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-4">Loser</Badge>
                          <CharacterCard char={battleResult.loser} />
                        </div>
                      </div>

                      <div className="flex gap-4 justify-center mt-8">
                        <Button onClick={resetBattle} size="lg">
                          Battle Again
                        </Button>
                        <Button onClick={() => setGameMode("menu")} variant="outline" size="lg">
                          Back to Menu
                        </Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
