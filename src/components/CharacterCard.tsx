import { CometCard } from "@/components/ui/comet-card";
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
  common: "bg-[#1F2121]",
  rare: "bg-primary/10",
  epic: "bg-accent/10",
  legendary: "bg-gradient-to-br from-primary/20 to-accent/20",
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
    <CometCard>
      <button
        type="button"
        className={`flex w-80 cursor-pointer flex-col items-stretch rounded-[16px] border-0 p-2 saturate-0 hover:saturate-100 transition-all duration-300 ${rarityColors[rarity]}`}
        aria-label={`View character ${name}`}
        style={{
          transformStyle: "preserve-3d",
          transform: "none",
          opacity: 1,
        }}
      >
        <div className="mx-2 flex-1">
          <div className="relative mt-2 aspect-[3/4] w-full">
            {image ? (
              <img
                loading="lazy"
                className="absolute inset-0 h-full w-full rounded-[16px] bg-[#000000] object-cover contrast-75"
                alt={name}
                src={image}
                style={{
                  boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                  opacity: 1,
                }}
              />
            ) : (
              <div className="absolute inset-0 h-full w-full rounded-[16px] bg-gradient-to-br from-primary to-accent opacity-50 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-background/20" />
              </div>
            )}
            <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur">
              #{tokenId}
            </Badge>
          </div>
        </div>
        
        <div className="mt-2 flex flex-shrink-0 items-center justify-between p-4 font-mono text-white">
          <div className="text-xs flex items-center gap-2">
            <span className="font-bold">{name}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {rarity}
            </Badge>
          </div>
          <div className="text-xs text-gray-300 opacity-50">#{tokenId}</div>
        </div>

        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-300">
              <Sword className="w-3 h-3 text-destructive" />
              ATK
            </span>
            <span className="font-semibold text-white">{attack}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-300">
              <Shield className="w-3 h-3 text-primary" />
              DEF
            </span>
            <span className="font-semibold text-white">{defense}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-300">
              <Zap className="w-3 h-3 text-accent" />
              SPD
            </span>
            <span className="font-semibold text-white">{speed}</span>
          </div>
        </div>
      </button>
    </CometCard>
  );
};