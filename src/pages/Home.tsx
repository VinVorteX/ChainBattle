import React from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Swords, ShoppingCart, Trophy, Shield, Zap, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Full Screen Hero with Animations */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                x: [null, Math.random() * window.innerWidth],
                y: [null, Math.random() * window.innerHeight],
                scale: [null, Math.random() * 0.5 + 0.5],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        {/* Floating Pokemon Cards */}
        {[6, 9, 25, 59, 130].map((pokemonId, i) => (
          <motion.div
            key={pokemonId}
            className="absolute w-32 h-32 opacity-10"
            initial={{ 
              x: (i * 20) + '%',
              y: (i * 15) + '%',
              rotate: 0
            }}
            animate={{
              y: [(i * 15) + '%', (i * 15 + 10) + '%', (i * 15) + '%'],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img 
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
              alt=""
              className="w-full h-full object-contain"
            />
          </motion.div>
        ))}

        {/* Main Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-7xl md:text-9xl font-bold mb-6"
              animate={{
                backgroundImage: [
                  'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--accent)))',
                  'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))',
                  'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              ChainBattle
            </motion.h1>
          </motion.div>

          <motion.p 
            className="text-2xl md:text-3xl text-muted-foreground mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            The Ultimate NFT Battle Card Game
          </motion.p>

          <motion.p 
            className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Mint powerful Pokemon warriors • Battle in 1v1 arena • Trade on marketplace • All on blockchain
          </motion.p>

          <motion.div 
            className="flex flex-wrap gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link to="/game">
              <Button size="lg" className="bg-gradient-to-br from-primary to-accent text-lg px-8 py-6">
                <Swords className="mr-2 h-6 w-6" />
                Start Battle
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <ShoppingCart className="mr-2 h-6 w-6" />
                Explore Market
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="w-8 h-8 mx-auto rotate-90 text-muted-foreground" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What is ChainBattle */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-center mb-6">What is ChainBattle?</h2>
            <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto mb-12">
              ChainBattle is a blockchain-based NFT battle card game where you collect, battle, and trade unique Pokemon-inspired warriors. Every action is recorded on-chain for complete transparency and true ownership.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-12 h-12" />,
                title: "Mint NFTs",
                desc: "Create unique warrior NFTs with real Pokemon stats. Each character is one-of-a-kind with power, defense, and element attributes.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Swords className="w-12 h-12" />,
                title: "Battle Arena",
                desc: "Fight in 1v1 battles against AI or other players. Fair combat system with stats + randomness. Winners level up!",
                color: "from-red-500 to-orange-500"
              },
              {
                icon: <ShoppingCart className="w-12 h-12" />,
                title: "Marketplace",
                desc: "Trade your NFTs on our CSGO-style marketplace. Buy, sell, filter by type/element, and build your dream team.",
                color: "from-blue-500 to-cyan-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
              >
                <Card className="p-8 h-full hover:border-primary transition-all group">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Play */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <motion.h2 
            className="text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How to Play
          </motion.h2>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Connect Your Wallet",
                desc: "Connect MetaMask or use Demo Mode to start playing instantly without any wallet.",
                icon: <Shield className="w-16 h-16" />
              },
              {
                step: "02",
                title: "Mint Your Warriors",
                desc: "Create unique NFT characters with random Pokemon. Each has different power, defense, and element (Fire/Water/Wind/Earth).",
                icon: <Sparkles className="w-16 h-16" />
              },
              {
                step: "03",
                title: "Battle & Level Up",
                desc: "Choose Single Player or Multiplayer mode. Select your character and fight! Winners gain experience and level up.",
                icon: <Swords className="w-16 h-16" />
              },
              {
                step: "04",
                title: "Trade on Marketplace",
                desc: "List your NFTs for sale or buy powerful characters from other players. Filter by type, element, and price.",
                icon: <ShoppingCart className="w-16 h-16" />
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-bold mb-3">{step.title}</h3>
                      <p className="text-lg text-muted-foreground">{step.desc}</p>
                    </div>
                    <div className="flex-shrink-0 text-primary">
                      {step.icon}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ChainBattle */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.h2 
            className="text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why ChainBattle?
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: <Trophy className="w-8 h-8" />, title: "True Ownership", desc: "Your NFTs are yours forever. Trade, battle, or hold - you decide." },
              { icon: <Shield className="w-8 h-8" />, title: "Provably Fair", desc: "All battles calculated on-chain. No hidden mechanics or cheating possible." },
              { icon: <Zap className="w-8 h-8" />, title: "Real Pokemon Stats", desc: "Characters use actual Pokemon base stats for authentic gameplay." },
              { icon: <Sparkles className="w-8 h-8" />, title: "Level Up System", desc: "Win battles to gain experience and level up your warriors." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="p-6 hover:border-primary transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">Ready to Battle?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of players in the ultimate NFT battle card game
            </p>
            <Link to="/game">
              <Button size="lg" className="bg-gradient-to-br from-primary to-accent text-xl px-12 py-8">
                <Swords className="mr-2 h-6 w-6" />
                Enter the Arena
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg" />
              <span className="text-xl font-bold">ChainBattle</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 ChainBattle. Built on blockchain for true ownership.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
