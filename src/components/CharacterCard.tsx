import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sword, Shield, Zap } from "lucide-react";

interface CharacterCardProps {
  name: string;
  attack: number;
  defense: number;
  speed: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  tokenId: string;
  image?: string;
}

const rarityColors = {
  common: "bg-muted",
  rare: "bg-primary/20 border-primary/50",
  epic: "bg-accent/20 border-accent/50",
  legendary: "bg-gradient-to-br from-primary/30 to-accent/30 border-accent",
};

export const CharacterCard = ({ 
  name, 
  attack, 
  defense, 
  speed, 
  rarity, 
  tokenId,
  image 
}: CharacterCardProps) => {
  return (
    <Card 
      className={`${rarityColors[rarity]} border-2 overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]`}
    >
      <div className="aspect-square bg-gradient-to-br from-muted to-background relative overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent opacity-50" />
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur">
          #{tokenId}
        </Badge>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{name}</h3>
          <Badge variant="outline" className="capitalize">
            {rarity}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Sword className="w-4 h-4 text-destructive" />
              Attack
            </span>
            <span className="font-semibold">{attack}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              Defense
            </span>
            <span className="font-semibold">{defense}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4 text-accent" />
              Speed
            </span>
            <span className="font-semibold">{speed}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
