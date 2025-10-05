import { motion } from "motion/react";

type PixelPokemonProps = {
  type: "fire" | "water" | "grass" | "electric" | "dragon";
  isAttacking?: boolean;
  isBlocking?: boolean;
  isHit?: boolean;
  className?: string;
  facingRight?: boolean;
};

export default function PixelPokemon({ type, isAttacking, isBlocking, isHit, className = "", facingRight = false }: PixelPokemonProps) {
  const getPokemonSprite = () => {
    const backSprites: Record<string, string> = {
      fire: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/6.gif",
      water: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/9.gif",
      grass: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/3.gif",
      electric: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/25.gif",
      dragon: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/149.gif"
    };
    const frontSprites: Record<string, string> = {
      fire: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/6.gif",
      water: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/9.gif",
      grass: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/3.gif",
      electric: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif",
      dragon: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/149.gif"
    };
    return facingRight ? backSprites[type] || backSprites.fire : frontSprites[type] || frontSprites.fire;
  };

  return (
    <motion.div
      className="relative"
      animate={{
        scale: isBlocking ? 0.9 : 1,
        x: isAttacking ? [0, 15, 0] : isHit ? [0, -15, 0] : 0,
        rotate: isHit ? [0, -5, 5, 0] : 0
      }}
      transition={{ duration: 0.3 }}
    >
      <img 
        src={getPokemonSprite()} 
        alt={type}
        className={className}
        style={{ imageRendering: "pixelated" }}
      />
      {isBlocking && (
        <motion.div
          className="absolute inset-0 border-4 border-blue-400 rounded-lg bg-blue-500/20"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
      )}
      {isAttacking && (
        <motion.div
          className="absolute inset-0 bg-yellow-400/30 rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.2, 1] }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.div>
  );
}
