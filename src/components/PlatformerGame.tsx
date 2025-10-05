import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Trophy, RotateCcw, Flame, Target } from "lucide-react";
import PixelPokemon from "@/components/PixelPokemon";

type Character = {
  tokenId: number;
  name: string;
  type: string;
  power: number;
  defense: number;
  element: string;
  image?: string;
  level: number;
  wins: number;
};

type Fighter = {
  hp: number;
  energy: number;
  x: number;
  isBlocking: boolean;
  isAttacking: boolean;
  isHit: boolean;
};

type Props = {
  character: Character;
  onComplete: (won: boolean) => void;
  onExit: () => void;
};

export default function PlatformerGame({ character, onComplete, onExit }: Props) {
  const [player, setPlayer] = useState<Fighter>({ hp: 100, energy: 0, x: 200, isBlocking: false, isAttacking: false, isHit: false });
  const [opponent, setOpponent] = useState<Fighter>({ hp: 100, energy: 0, x: 800, isBlocking: false, isAttacking: false, isHit: false });
  const [round, setRound] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [opponentWins, setOpponentWins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [comboCount, setComboCount] = useState(0);
  const [damageNumbers, setDamageNumbers] = useState<Array<{id: number, x: number, y: number, damage: number, type: string}>>([]);
  const [roundTimer, setRoundTimer] = useState(60);
  const aiCooldownRef = useRef(15);
  const aiBlockChanceRef = useRef(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  const MOVE_SPEED = 8;
  const ATTACK_RANGE = 150;
  const [attackCooldown, setAttackCooldown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || roundOver || attackCooldown) return;
      const key = e.key.toLowerCase();
      setKeysPressed(prev => new Set(prev).add(key));
      if (key === "j" && !attackCooldown) lightPunch();
      if (key === "k" && !attackCooldown) heavyPunch();
      if (key === "l" && !attackCooldown) kick();
      if (key === "u" && !attackCooldown) specialMove();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => { const newSet = new Set(prev); newSet.delete(e.key.toLowerCase()); return newSet; });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [gameOver, roundOver, player, opponent, attackCooldown]);

  useEffect(() => {
    if (gameOver || roundOver) return;
    const interval = setInterval(() => {
      if (keysPressed.has("a") || keysPressed.has("arrowleft")) setPlayer(p => ({ ...p, x: Math.max(50, p.x - MOVE_SPEED) }));
      if (keysPressed.has("d") || keysPressed.has("arrowright")) setPlayer(p => ({ ...p, x: Math.min(950, p.x + MOVE_SPEED) }));
      setPlayer(p => ({ ...p, isBlocking: keysPressed.has("s") || keysPressed.has("arrowdown") }));

      const distance = Math.abs(player.x - opponent.x);
      if (distance > ATTACK_RANGE + 30) {
        setOpponent(o => ({ ...o, x: o.x > player.x ? o.x - 7 : o.x + 7, isBlocking: false }));
      } else if (distance < ATTACK_RANGE) {
        aiCooldownRef.current--;
        if (aiCooldownRef.current <= 0) {
          opponentAttack();
          aiCooldownRef.current = 12 + Math.floor(Math.random() * 10);
        }
        if (Math.random() > 0.7) {
          setOpponent(o => ({ ...o, isBlocking: true }));
          aiBlockChanceRef.current = 15;
        }
      }
      if (aiBlockChanceRef.current > 0) {
        aiBlockChanceRef.current--;
        if (aiBlockChanceRef.current === 0) setOpponent(o => ({ ...o, isBlocking: false }));
      }

      setPlayer(p => ({ ...p, energy: Math.min(100, p.energy + 0.3), isHit: false }));
      setOpponent(o => ({ ...o, energy: Math.min(100, o.energy + 0.3), isHit: false }));
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [keysPressed, player, opponent, gameOver, roundOver]);

  useEffect(() => {
    if (gameOver || roundOver) return;
    const timer = setInterval(() => {
      setRoundTimer(t => { if (t <= 1) { endRound(player.hp > opponent.hp ? "player" : "opponent"); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, roundOver, player.hp, opponent.hp]);

  const dealDamage = (damage: number, attackType: string) => {
    if (Math.abs(player.x - opponent.x) > ATTACK_RANGE || attackCooldown) return;
    setAttackCooldown(true);
    setTimeout(() => setAttackCooldown(false), 250);
    setPlayer(p => ({ ...p, isAttacking: true }));
    setTimeout(() => setPlayer(p => ({ ...p, isAttacking: false })), 200);
    if (opponent.isBlocking) damage = Math.round(damage * 0.3);
    setOpponent(o => ({ ...o, hp: Math.max(0, o.hp - damage), isHit: true }));
    const id = Date.now() + Math.random();
    setDamageNumbers(prev => [...prev, { id, x: opponent.x, y: 250, damage, type: attackType }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 800);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    setComboCount(prev => prev + 1);
    comboTimerRef.current = setTimeout(() => setComboCount(0), 1200);
    if (opponent.hp - damage <= 0) endRound("player");
  };

  const lightPunch = () => { if (!player.isAttacking) { dealDamage(8 + character.power * 0.1, "Light"); setPlayer(p => ({ ...p, energy: Math.min(100, p.energy + 5) })); } };
  const heavyPunch = () => { if (!player.isAttacking) { dealDamage(15 + character.power * 0.2, "Heavy"); setPlayer(p => ({ ...p, energy: Math.min(100, p.energy + 10) })); } };
  const kick = () => { if (!player.isAttacking) { dealDamage(12 + character.power * 0.15, "Kick"); setPlayer(p => ({ ...p, energy: Math.min(100, p.energy + 8) })); } };
  const specialMove = () => { if (!player.isAttacking && player.energy >= 50) { dealDamage(30 + character.power * 0.5, "SPECIAL"); setPlayer(p => ({ ...p, energy: p.energy - 50 })); } };

  const opponentAttack = () => {
    if (opponent.isAttacking || Math.abs(player.x - opponent.x) > ATTACK_RANGE) return;
    setOpponent(o => ({ ...o, isAttacking: true, isBlocking: false }));
    setTimeout(() => setOpponent(o => ({ ...o, isAttacking: false })), 200);
    const rand = Math.random();
    let damage = rand > 0.8 ? 22 : rand > 0.5 ? 16 : 12;
    if (opponent.energy >= 50 && Math.random() > 0.6) {
      damage = 35;
      setOpponent(o => ({ ...o, energy: Math.max(0, o.energy - 50) }));
    }
    if (player.isBlocking) damage = Math.round(damage * 0.3);
    setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - damage), isHit: true }));
    const id = Date.now() + Math.random();
    setDamageNumbers(prev => [...prev, { id, x: player.x, y: 250, damage, type: damage > 30 ? "SPECIAL" : "Hit" }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 800);
    if (player.hp - damage <= 0) endRound("opponent");
  };

  const endRound = (winner: "player" | "opponent") => {
    setRoundOver(true);
    if (winner === "player") { const newWins = playerWins + 1; setPlayerWins(newWins); if (newWins >= 2) { setGameOver(true); onComplete(true); } }
    else { const newWins = opponentWins + 1; setOpponentWins(newWins); if (newWins >= 2) { setGameOver(true); onComplete(false); } }
  };

  const nextRound = () => {
    setRound(r => r + 1); setRoundOver(false); setRoundTimer(60);
    setPlayer({ hp: 100, energy: 0, x: 200, isBlocking: false, isAttacking: false, isHit: false });
    setOpponent({ hp: 100, energy: 0, x: 800, isBlocking: false, isAttacking: false, isHit: false });
    setComboCount(0); setDamageNumbers([]); aiCooldownRef.current = 15; aiBlockChanceRef.current = 0;
  };

  const restart = () => {
    setPlayer({ hp: 100, energy: 0, x: 200, isBlocking: false, isAttacking: false, isHit: false });
    setOpponent({ hp: 100, energy: 0, x: 800, isBlocking: false, isAttacking: false, isHit: false });
    setRound(1); setPlayerWins(0); setOpponentWins(0); setGameOver(false); setRoundOver(false); setRoundTimer(60); setComboCount(0); setDamageNumbers([]); setKeysPressed(new Set()); setAttackCooldown(false); aiCooldownRef.current = 15; aiBlockChanceRef.current = 0;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-red-900/20 to-blue-900/20">
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1"><span className="font-bold text-lg">{character.name}</span><Badge className="bg-green-500">P1</Badge></div>
            <div className="relative h-6 bg-gray-800 rounded overflow-hidden border-2 border-yellow-500">
              <motion.div className="h-full bg-gradient-to-r from-green-500 to-yellow-400" animate={{ width: `${player.hp}%` }} transition={{ duration: 0.3 }} />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">{Math.round(player.hp)}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded overflow-hidden mt-1"><motion.div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" animate={{ width: `${player.energy}%` }} /></div>
          </div>
          <div className="mx-8 text-center">
            <Badge className="text-2xl px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 mb-2">ROUND {round}</Badge>
            <div className="text-4xl font-bold text-yellow-400">{roundTimer}</div>
            <div className="flex gap-2 mt-2">{[...Array(playerWins)].map((_, i) => <div key={i} className="w-4 h-4 bg-green-500 rounded-full" />)}<span className="mx-2">VS</span>{[...Array(opponentWins)].map((_, i) => <div key={i} className="w-4 h-4 bg-red-500 rounded-full" />)}</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 justify-end"><Badge variant="destructive">CPU</Badge><span className="font-bold text-lg">Opponent</span></div>
            <div className="relative h-6 bg-gray-800 rounded overflow-hidden border-2 border-yellow-500">
              <motion.div className="h-full bg-gradient-to-r from-red-500 to-orange-400 ml-auto" animate={{ width: `${opponent.hp}%` }} transition={{ duration: 0.3 }} style={{ float: 'right' }} />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">{Math.round(opponent.hp)}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded overflow-hidden mt-1"><motion.div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 ml-auto" animate={{ width: `${opponent.energy}%` }} style={{ float: 'right' }} /></div>
          </div>
        </div>
        {comboCount > 1 && <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }}><Badge className="text-xl px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500">{comboCount} HIT COMBO!</Badge></motion.div>}
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-b from-sky-400 via-blue-300 to-green-200" style={{ height: "500px" }}>
        <div className="relative w-full h-full">
          {/* Animated Sky */}
          <motion.div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100" animate={{ opacity: [0.8, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity }} />
          
          {/* Mountains - Far Background */}
          <motion.div className="absolute bottom-0 w-full h-64" animate={{ x: [0, -20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <svg viewBox="0 0 1200 300" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,300 L0,150 L200,80 L400,120 L600,60 L800,100 L1000,70 L1200,110 L1200,300 Z" fill="#4a5568" opacity="0.6" />
              <path d="M0,300 L0,180 L150,120 L350,140 L550,100 L750,130 L950,110 L1200,140 L1200,300 Z" fill="#2d3748" opacity="0.7" />
            </svg>
          </motion.div>

          {/* Mountains - Mid Background */}
          <motion.div className="absolute bottom-0 w-full h-72" animate={{ x: [0, -40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
            <svg viewBox="0 0 1200 350" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,350 L0,200 L150,100 L300,150 L450,80 L600,130 L750,90 L900,140 L1050,110 L1200,160 L1200,350 Z" fill="#1a365d" opacity="0.8" />
            </svg>
          </motion.div>

          {/* Forest Trees - Background Layer */}
          <motion.div className="absolute bottom-40 w-full flex" animate={{ x: [0, -100, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
            {[...Array(15)].map((_, i) => (
              <motion.div key={i} className="flex-shrink-0" style={{ marginLeft: i * 80 }} animate={{ y: [0, -5, 0] }} transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.2 }}>
                <svg width="60" height="120" viewBox="0 0 60 120">
                  <rect x="25" y="70" width="10" height="50" fill="#4a2511" />
                  <polygon points="30,10 10,50 50,50" fill="#2d5016" opacity="0.9" />
                  <polygon points="30,30 15,60 45,60" fill="#2d5016" opacity="0.9" />
                  <polygon points="30,50 20,70 40,70" fill="#2d5016" opacity="0.9" />
                </svg>
              </motion.div>
            ))}
          </motion.div>

          {/* Water/River */}
          <motion.div className="absolute bottom-40 w-full h-20 bg-gradient-to-b from-blue-400/60 to-blue-500/80" animate={{ opacity: [0.6, 0.8, 0.6] }} transition={{ duration: 3, repeat: Infinity }}>
            <motion.div className="w-full h-full" animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 40px)', backgroundSize: '200% 100%' }} />
            {/* Water ripples */}
            {[...Array(8)].map((_, i) => (
              <motion.div key={i} className="absolute w-16 h-2 bg-white/20 rounded-full" style={{ left: `${i * 15}%`, top: `${30 + Math.random() * 40}%` }} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.3 }} />
            ))}
          </motion.div>

          {/* Forest Trees - Foreground Layer */}
          <motion.div className="absolute bottom-40 w-full flex" animate={{ x: [0, -150, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
            {[...Array(12)].map((_, i) => (
              <motion.div key={i} className="flex-shrink-0" style={{ marginLeft: i * 100 }} animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.15 }}>
                <svg width="80" height="140" viewBox="0 0 80 140">
                  <rect x="35" y="80" width="12" height="60" fill="#3d1f0a" />
                  <polygon points="40,5 15,55 65,55" fill="#1e4620" />
                  <polygon points="40,30 20,70 60,70" fill="#1e4620" />
                  <polygon points="40,55 25,80 55,80" fill="#1e4620" />
                </svg>
              </motion.div>
            ))}
          </motion.div>

          {/* Ground/Platform */}
          <div className="absolute bottom-0 w-full h-40 bg-gradient-to-b from-green-800 to-green-900" />
          <div className="absolute bottom-40 w-full h-1 bg-yellow-600/50" />
          
          {/* Grass details on ground */}
          <div className="absolute bottom-40 w-full h-2">
            {[...Array(50)].map((_, i) => (
              <motion.div key={i} className="absolute w-1 h-4 bg-green-600" style={{ left: `${i * 2}%`, bottom: 0 }} animate={{ scaleY: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: i * 0.05 }} />
            ))}
          </div>

          <motion.div className="absolute" style={{ left: player.x, bottom: 100 }} animate={player.isAttacking ? { x: player.x + 30 } : player.isHit ? { x: [player.x, player.x - 15, player.x] } : {}} transition={{ duration: player.isAttacking ? 0.15 : 0.2 }}>
            <div className="relative w-32 h-32">
              <PixelPokemon 
                type={character.element?.toLowerCase() as any || "fire"} 
                isAttacking={player.isAttacking}
                isBlocking={player.isBlocking}
                isHit={player.isHit}
                facingRight={true}
                className="w-full h-full drop-shadow-2xl"
              />
              {player.isAttacking && (
                <>
                  <motion.div className="absolute right-0 top-1/2 -translate-y-1/2" initial={{ scale: 0, x: 0, opacity: 1 }} animate={{ scale: [0, 2, 0], x: [0, 60, 120], opacity: [1, 1, 0] }} transition={{ duration: 0.25 }}><Zap className="w-20 h-20 text-yellow-400" /></motion.div>
                  <motion.div className="absolute right-0 top-1/2 -translate-y-1/2" initial={{ scale: 0 }} animate={{ scale: [0, 3, 0], opacity: [0.8, 0.3, 0] }} transition={{ duration: 0.25 }}><div className="w-24 h-24 rounded-full bg-yellow-400" /></motion.div>
                </>
              )}
            </div>
          </motion.div>

          <AnimatePresence>{damageNumbers.map((dmg) => <motion.div key={dmg.id} className="absolute font-bold" style={{ left: dmg.x, top: dmg.y, fontSize: dmg.type === "SPECIAL" ? "48px" : "36px", color: dmg.type === "SPECIAL" ? "#ffff00" : "#ff3333", textShadow: "3px 3px 6px #000, 0 0 10px currentColor", fontWeight: 900 }} initial={{ opacity: 1, y: 0, scale: 0.5 }} animate={{ opacity: 0, y: -100, scale: dmg.type === "SPECIAL" ? 2.5 : 1.8, rotate: dmg.type === "SPECIAL" ? 360 : 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>{dmg.type === "SPECIAL" ? "★ " : ""}{dmg.damage}{dmg.type === "SPECIAL" ? " ★" : ""}</motion.div>)}</AnimatePresence>

          <motion.div className="absolute" style={{ left: opponent.x, bottom: 100 }} animate={opponent.isAttacking ? { x: opponent.x - 30 } : opponent.isHit ? { x: [opponent.x, opponent.x + 15, opponent.x] } : {}} transition={{ duration: opponent.isAttacking ? 0.15 : 0.2 }}>
            <div className="relative w-32 h-32">
              <PixelPokemon 
                type="dragon"
                isAttacking={opponent.isAttacking}
                isBlocking={opponent.isBlocking}
                isHit={opponent.isHit}
                className="w-full h-full drop-shadow-2xl"
              />
              {opponent.isAttacking && (
                <>
                  <motion.div className="absolute left-0 top-1/2 -translate-y-1/2" initial={{ scale: 0, x: 0, opacity: 1 }} animate={{ scale: [0, 2, 0], x: [0, -60, -120], opacity: [1, 1, 0] }} transition={{ duration: 0.25 }}><Flame className="w-20 h-20 text-red-500" /></motion.div>
                  <motion.div className="absolute left-0 top-1/2 -translate-y-1/2" initial={{ scale: 0 }} animate={{ scale: [0, 3, 0], opacity: [0.8, 0.3, 0] }} transition={{ duration: 0.25 }}><div className="w-24 h-24 rounded-full bg-red-500" /></motion.div>
                </>
              )}
            </div>
          </motion.div>

          {(roundOver || gameOver) && (
            <motion.div className="absolute inset-0 bg-black/90 flex items-center justify-center" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="p-12 text-center space-y-6">
                {gameOver ? (<><h2 className="text-6xl font-bold">{playerWins > opponentWins ? "🏆 YOU WIN!" : "💀 YOU LOSE"}</h2><p className="text-2xl">Final Score: {playerWins} - {opponentWins}</p><div className="flex gap-4 justify-center"><Button onClick={restart} size="lg"><RotateCcw className="mr-2 h-5 w-5" />Rematch</Button><Button onClick={onExit} variant="outline" size="lg">Exit</Button></div></>) : (<><h2 className="text-5xl font-bold text-yellow-400">{player.hp > opponent.hp ? "ROUND WIN!" : "ROUND LOST"}</h2><Button onClick={nextRound} size="lg" className="text-xl px-8 py-6">Next Round</Button></>)}
              </Card>
            </motion.div>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-red-900/20 to-blue-900/20">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Target className="w-5 h-5" />Fighting Controls:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          <Badge variant="outline" className="py-2">A/D: Move</Badge>
          <Badge variant="outline" className="py-2">S: Block</Badge>
          <Badge variant="outline" className="py-2">J: Light Punch</Badge>
          <Badge variant="outline" className="py-2">K: Heavy Punch</Badge>
          <Badge variant="outline" className="py-2">L: Kick</Badge>
          <Badge className="py-2 bg-gradient-to-r from-purple-600 to-pink-600 col-span-2 md:col-span-1">U: Special (50 Energy)</Badge>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">Win 2 rounds to victory! Build combos and use special moves strategically!</div>
      </Card>
    </div>
  );
}
