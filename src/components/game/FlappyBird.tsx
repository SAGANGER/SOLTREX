import React, { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { updateHighScore, getHighScore, getCoins, updateCoins } from '../../lib/supabaseClient';
import { Language, translations } from '../../lib/translations';
import { supabase } from '../../lib/supabaseClient';

interface GameState {
  isPlaying: boolean;
  score: number;
  highScore: number;
  lastScore: number;
  coins: number;
  hasSpeedBoost: boolean;
  hasShieldBoost: boolean;
  initialRank: number | null;
  rankGain: number | null;
}

interface FlappyBirdProps {
  language: Language;
  soundEnabled: boolean;
}

// Configuration flexible des biomes
const BIOMES = [
  { name: '', minScore: 0, image: 'https://i.imgur.com/XnN2iVt.png' },
  { name: '', minScore: 2, image: 'https://i.imgur.com/XnN2iVt.png' },
  { name: '', minScore: 4, image: 'https://i.imgur.com/XnN2iVt.png' },
  { name: '', minScore: 6, image: 'https://i.imgur.com/XnN2iVt.png' },
  { name: '', minScore: 8, image: 'https://i.imgur.com/XnN2iVt.png' },
] as const;

type BiomeName = 'winter' | 'spring' | 'summer' | 'newyork' | 'yellowstone';

// Nouvelle liste de tâches variées
const TASKS = [
  { id: 1, type: 'score', goal: 10, label: 'Score 10', xp: 100 },
  { id: 2, type: 'time', goal: 30, label: 'Play 30 seconds', xp: 100 },
  { id: 3, type: 'jump', goal: 10, label: 'Jump 10 times', xp: 100 },
  { id: 4, type: 'jump', goal: 20, label: 'Jump 20 times', xp: 100 },
  { id: 5, type: 'score', goal: 20, label: 'Score 20', xp: 100 },
  { id: 6, type: 'score', goal: 40, label: 'Score 40', xp: 100 },
  { id: 7, type: 'jump', goal: 30, label: 'Jump 30 times', xp: 100 },
  { id: 8, type: 'jump', goal: 40, label: 'Jump 40 times', xp: 100 },
  { id: 9, type: 'jump', goal: 50, label: 'Jump 50 times', xp: 100 },
  { id: 10, type: 'time', goal: 60, label: 'Play 60 seconds', xp: 100 },
  { id: 11, type: 'time', goal: 120, label: 'Play 120 seconds', xp: 100 },
  { id: 12, type: 'time', goal: 240, label: 'Play 240 seconds', xp: 100 },
  { id: 13, type: 'level', goal: 2, label: 'Reach level 2', xp: 100 },
  { id: 14, type: 'level', goal: 3, label: 'Reach level 3', xp: 100 },
  { id: 15, type: 'games', goal: 3, label: 'Play 3 games', xp: 100 },
  { id: 16, type: 'games', goal: 5, label: 'Play 5 games', xp: 100 },
  { id: 17, type: 'score', goal: 100, label: 'Score  100', xp: 200 },
  { id: 18, type: 'jump', goal: 100, label: 'Jump 100 times', xp: 200 },
  { id: 19, type: 'time', goal: 180, label: 'Play 3 minutes', xp: 200 },
  { id: 20, type: 'level', goal: 5, label: 'Reach level 5', xp: 200 },
  { id: 21, type: 'score', goal: 100, label: 'Score 100', xp: 100 },
  { id: 22, type: 'jump', goal: 120, label: 'Jump 120 times', xp: 100 },
  { id: 23, type: 'time', goal: 180, label: 'Play 3 minutes', xp: 100 },
  { id: 24, type: 'score', goal: 130, label: 'Score 130', xp: 100 },
  { id: 25, type: 'jump', goal: 150, label: 'Jump 150 times', xp: 100 },
  { id: 26, type: 'time', goal: 240, label: 'Play 4 minutes', xp: 100 },
  { id: 27, type: 'score', goal: 160, label: 'Score 160', xp: 100 },
  { id: 28, type: 'jump', goal: 180, label: 'Jump 180 times', xp: 100 },
  { id: 29, type: 'score', goal: 180, label: 'Score 180', xp: 100 },
  { id: 30, type: 'time', goal: 300, label: 'Play 5 minutes', xp: 100 },

  { id: 31, type: 'score', goal: 200, label: 'Score 200', xp: 90 },
  { id: 32, type: 'jump', goal: 220, label: 'Jump 220 times', xp: 90 },
  { id: 33, type: 'time', goal: 360, label: 'Play 6 minutes', xp: 90 },
  { id: 34, type: 'score', goal: 230, label: 'Score 230', xp: 90 },
  { id: 35, type: 'jump', goal: 250, label: 'Jump 250 times', xp: 90 },
  { id: 36, type: 'time', goal: 420, label: 'Play 7 minutes', xp: 90 },
  { id: 37, type: 'score', goal: 260, label: 'Score 260', xp: 90 },
  { id: 38, type: 'jump', goal: 280, label: 'Jump 280 times', xp: 90 },
  { id: 39, type: 'score', goal: 280, label: 'Score 280', xp: 90 },
  { id: 40, type: 'time', goal: 480, label: 'Play 8 minutes', xp: 90 },

  { id: 41, type: 'score', goal: 300, label: 'Score 300', xp: 80 },
  { id: 42, type: 'jump', goal: 320, label: 'Jump 320 times', xp: 80 },
  { id: 43, type: 'time', goal: 540, label: 'Play 9 minutes', xp: 80 },
  { id: 44, type: 'score', goal: 330, label: 'Score 330', xp: 80 },
  { id: 45, type: 'jump', goal: 350, label: 'Jump 350 times', xp: 80 },
  { id: 46, type: 'time', goal: 600, label: 'Play 10 minutes', xp: 80 },
  { id: 47, type: 'score', goal: 360, label: 'Score 360', xp: 80 },
  { id: 48, type: 'jump', goal: 380, label: 'Jump 380 times', xp: 80 },
  { id: 49, type: 'score', goal: 380, label: 'Score 380', xp: 80 },
  { id: 50, type: 'time', goal: 660, label: 'Play 11 minutes', xp: 80 }
];

export const FlappyBird: React.FC<FlappyBirdProps> = ({ language, soundEnabled }) => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    lastScore: 0,
    highScore: 0,
    coins: 0,
    hasSpeedBoost: false,
    hasShieldBoost: false,
    initialRank: null,
    rankGain: null,
  });
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdRef = useRef<HTMLImageElement>();
  const pipeRef = useRef<HTMLImageElement>();
  const scoreRef = useRef<number>(0);
  const [birdPreviewY, setBirdPreviewY] = useState(250);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 500 });

  const [gameObjects, setGameObjects] = useState({
    birdY: 250,
    birdVelocity: 0,
    pipes: [] as { x: number; height: number }[],
    coins: [] as { x: number; y: number; collected: boolean }[],
  });

  const [fps, setFps] = useState(0);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  const BIRD_SIZE = Math.min(40, canvasSize.width * 0.067);
  const PIPE_WIDTH = Math.min(60, canvasSize.width * 0.1);
  const PIPE_GAP = Math.min(180, canvasSize.height * 0.36);
  const PIPE_SPAWN_DISTANCE = Math.min(300, canvasSize.width * 0.5);

  // Préchargement des images
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const birdImageRef = useRef<HTMLImageElement | null>(null);
  const pipeImageRef = useRef<HTMLImageElement | null>(null);

  // Ajout des références pour les sons
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  const scoreSoundRef = useRef<HTMLAudioElement | null>(null);
  const deathSoundRef = useRef<HTMLAudioElement | null>(null);
  const boostSoundRef = useRef<HTMLAudioElement | null>(null);

  const [activeControl, setActiveControl] = useState<'click' | 'space' | 'arrow'>('click');

  const [showHighScoreEffect, setShowHighScoreEffect] = useState(false);
  const highScoreEffectRef = useRef<number>(0);

  // Ajout d'une variable pour suivre si le high score a déjà été battu dans cette partie
  const [hasBeatenHighScore, setHasBeatenHighScore] = useState(false);

  const [userRank, setUserRank] = useState<number | null>(null);

  const [rankGainEffect, setRankGainEffect] = useState(false);
  const rankGainEffectRef = useRef<number>(0);

  // État pour la transition de biome
  const [biomeTransition, setBiomeTransition] = useState(false);
  const [biomeTransitionStart, setBiomeTransitionStart] = useState<number | null>(null);
  const BIOME_TRANSITION_DURATION = 1000; // ms
  const [currentBiome, setCurrentBiome] = useState<BiomeName>('winter');

  // Chargement dynamique des images de fond
  const biomeImages = useRef<Record<BiomeName, HTMLImageElement | null>>({
    winter: null,
    spring: null,
    summer: null,
    newyork: null,
    yellowstone: null,
  });
  const [bgLoaded, setBgLoaded] = useState<Record<BiomeName, boolean>>({
    winter: false,
    spring: false,
    summer: false,
    newyork: false,
    yellowstone: false,
  });
  const [bgX, setBgX] = useState(0);
  const BG_SCROLL_SPEED = 1.2; // Ajuste la vitesse selon le ressenti

  // Ajoute un état biomeFrom et biomeTo pour la transition
  const [biomeFrom, setBiomeFrom] = useState<BiomeName | null>(null);
  const [biomeTo, setBiomeTo] = useState<BiomeName | null>(null);

  // Ajout des états pour l'XP, le niveau et la popup de tâches
  const [userExp, setUserExp] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [showTasks, setShowTasks] = useState(false);

  const [activeTasks, setActiveTasks] = useState<number[]>([1,2,3]); // 3 premières tâches actives
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [taskProgress, setTaskProgress] = useState<{[id:number]:number}>({});

  // Suivi du temps de jeu et des sauts
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionJumps, setSessionJumps] = useState(0);

  // Suivi du nombre de boosts utilisés et de parties jouées
  const [sessionBoosts, setSessionBoosts] = useState(0);
  const [sessionGames, setSessionGames] = useState(0);

  const [collectedTasks, setCollectedTasks] = useState<number[]>([]);

  // Ajout d'un état pour compter les coins collectés pendant la partie
  const [sessionCoins, setSessionCoins] = useState(0);

  // Ajout d'une référence pour l'image du coin
  const coinImageRef = useRef<HTMLImageElement | null>(null);

  const [showShop, setShowShop] = useState(false);

  // Ajout d'un état pour la popup de gestion des boosts
  const [showBoosts, setShowBoosts] = useState(false);
  const [activeBoost, setActiveBoost] = useState<string | null>(null); // 'speed' | 'shield' | null
  const [ownedBoosts, setOwnedBoosts] = useState<string[]>([]); // ['speed', 'shield']

  // Charger le boost actif et les boosts possédés depuis la DB
  useEffect(() => {
    if (!publicKey) return;
    (async () => {
      const { data, error } = await supabase
        .from('users')
        .select('active_boost, boosts')
        .eq('wallet_address', publicKey.toString())
        .single();
      if (!error && data) {
        setActiveBoost(data.active_boost || null);
        setOwnedBoosts(data.boosts || []);
      }
    })();
  }, [publicKey, showBoosts]);

  // Fonction pour activer un boost (et le sauvegarder en DB)
  const handleActivateBoost = async (boost: string) => {
    setActiveBoost(boost);
    if (publicKey) {
      await supabase.from('users').update({ active_boost: boost }).eq('wallet_address', publicKey.toString());
    }
    setShowBoosts(false);
  };

  // Fonction pour désactiver le boost
  const handleDisableBoost = async () => {
    setActiveBoost(null);
    if (publicKey) {
      await supabase.from('users').update({ active_boost: null }).eq('wallet_address', publicKey.toString());
    }
    setShowBoosts(false);
  };

  // Fonction d'achat de boost (doit être déclarée avant SHOP_ITEMS)
  const buyBoost = async (type: 'speed' | 'shield') => {
    const cost = 50;
    if (gameState.coins >= cost) {
      if (boostSoundRef.current && soundEnabled) {
        boostSoundRef.current.currentTime = 0;
        boostSoundRef.current.play().catch((error: any) => {
          console.error('Erreur lors de la lecture du son de boost:', error);
        });
      }
      setGameState(prev => {
        const newCoins = prev.coins - cost;
        if (publicKey) updateCoins(publicKey.toString(), newCoins);
        return {
          ...prev,
          coins: newCoins,
          hasSpeedBoost: type === 'speed' ? true : prev.hasSpeedBoost,
          hasShieldBoost: type === 'shield' ? true : prev.hasShieldBoost,
        };
      });
      setSessionBoosts(b => b + 1);
      // Ajoute le boost à la DB si pas déjà possédé
      if (publicKey) {
        const { data } = await supabase
          .from('users')
          .select('boosts')
          .eq('wallet_address', publicKey.toString())
          .single();
        let boosts = data?.boosts || [];
        if (!boosts.includes(type)) {
          boosts = [...boosts, type];
          await supabase.from('users').update({ boosts }).eq('wallet_address', publicKey.toString());
          setOwnedBoosts(boosts);
        }
      }
    }
  };

  const SHOP_ITEMS = [
    {
      key: 'speed',
      name: translations[language].speed,
      price: 50,
      image: '/objects/speed.png', // à remplacer par ton image
      disabled: gameState.hasSpeedBoost,
      onBuy: () => buyBoost('speed'),
    },
    {
      key: 'shield',
      name: translations[language].shield,
      price: 50,
      image: '/objects/shield.png', // à remplacer par ton image
      disabled: gameState.hasShieldBoost,
      onBuy: () => buyBoost('shield'),
    },
  ];

  useEffect(() => {
    const updateCanvasSize = () => {
      const isMobile = window.innerWidth < 768;
      const width = isMobile ? window.innerWidth - 40 : 600;
      const height = isMobile ? window.innerHeight - 200 : 500;
      setCanvasSize({ width, height });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (gameState.isPlaying) return;
    
    const animateBird = () => {
      setBirdPreviewY(prev => {
        const newY = prev + Math.sin(Date.now() / 500) * 0.5;
        return newY;
      });
    };

    const animation = setInterval(animateBird, 16);
    return () => clearInterval(animation);
  }, [gameState.isPlaying]);

  useEffect(() => {
    const loadImages = () => {
      const birdImg = new Image();
      const pipeImg = new Image();
      
      const promises = [
        new Promise((resolve) => {
          birdImg.onload = resolve;
          birdImg.src = "https://i.imgur.com/92FkKpk.png";
        }),
        new Promise((resolve) => {
          pipeImg.onload = resolve;
          pipeImg.src = "https://i.imgur.com/KSZ7UA6.png";
        })
      ];

      Promise.all(promises).then(() => {
        birdImageRef.current = birdImg;
        pipeImageRef.current = pipeImg;
        setImagesLoaded(true);
      });
    };

    loadImages();
  }, []);

  useEffect(() => {
    const loadHighScore = async () => {
      if (!publicKey) return;
      
      try {
        const dbHighScore = await getHighScore(publicKey.toString());
        setGameState(prev => ({
          ...prev,
          highScore: dbHighScore
        }));
      } catch (error) {
        console.error('Error loading high score:', error);
      }
    };

    loadHighScore();
  }, [publicKey]);

  useEffect(() => {
    // Chargement des sons
    const loadSounds = () => {
      jumpSoundRef.current = new Audio('/sounds/jump.mp3');
      scoreSoundRef.current = new Audio('/sounds/score.mp3');
      deathSoundRef.current = new Audio('/sounds/death.mp3');
      boostSoundRef.current = new Audio('/sounds/boost.mp3');

      // Préchargement des sons
      jumpSoundRef.current.load();
      scoreSoundRef.current.load();
      deathSoundRef.current.load();
      boostSoundRef.current.load();
    };

    loadSounds();

    return () => {
      // Nettoyage des sons
      if (jumpSoundRef.current) {
        jumpSoundRef.current.pause();
        jumpSoundRef.current = null;
      }
      if (scoreSoundRef.current) {
        scoreSoundRef.current.pause();
        scoreSoundRef.current = null;
      }
      if (deathSoundRef.current) {
        deathSoundRef.current.pause();
        deathSoundRef.current = null;
      }
      if (boostSoundRef.current) {
        boostSoundRef.current.pause();
        boostSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchUserRank = async () => {
      if (!publicKey) {
        console.log('No public key available');
        return;
      }
      try {
        console.log('Fetching rank for wallet:', publicKey.toString());
        
        const { data: allScores, error: scoresError } = await supabase
          .from('high_scores')
          .select('wallet_address, score')
          .order('score', { ascending: false });

        if (scoresError) throw scoresError;

        const userIndex = allScores?.findIndex(
          (entry) => entry.wallet_address === publicKey.toString()
        );

        const rank = userIndex !== -1 ? userIndex + 1 : null;
        
        // Si on est en jeu et qu'on a un rang initial, calculer le gain de places
        if (gameState.isPlaying && gameState.initialRank !== null && rank !== null) {
          const gain = gameState.initialRank - rank;
          if (gain > 0) {
            if (gain !== gameState.rankGain) {
              setRankGainEffect(true);
              rankGainEffectRef.current = Date.now();
            }
            setGameState(prev => ({ ...prev, rankGain: gain }));
          }
        }
        
        setUserRank(rank);
      } catch (error) {
        console.error('Error fetching user rank:', error);
        setUserRank(null);
      }
    };

    fetchUserRank();
    const interval = setInterval(fetchUserRank, 5000);
    return () => clearInterval(interval);
  }, [publicKey, gameState.isPlaying, gameState.initialRank, gameState.rankGain]);

  useEffect(() => {
    BIOMES.forEach((biome) => {
      const img = new window.Image();
      img.src = biome.image;
      img.onload = () => setBgLoaded((prev) => ({ ...prev, [biome.name]: true }));
      biomeImages.current[biome.name] = img;
    });
  }, []);

  // Trouver le biome courant et le suivant
  function getCurrentBiome(score: number): any {
    let current = BIOMES[0];
    for (let i = BIOMES.length - 1; i >= 0; i--) {
      if (score >= BIOMES[i].minScore) {
        current = BIOMES[i];
        break;
      }
    }
    return current;
  }
  function getNextBiome(score: number): any {
    for (let i = 0; i < BIOMES.length; i++) {
      if (score < BIOMES[i].minScore) {
        return BIOMES[i];
      }
    }
    return null;
  }

  // Détection du passage de biome robuste avec fondu garanti
  useEffect(() => {
    const biome = getCurrentBiome(gameState.score);
    if (biomeTransition) return; // Ne rien faire si une transition est en cours
    if (biome.name !== currentBiome) {
      setBiomeFrom(currentBiome);
      setBiomeTo(biome.name);
      setBiomeTransition(true);
      setBiomeTransitionStart(Date.now());
      setTimeout(() => {
        setBiomeTransition(false);
        setCurrentBiome(biome.name);
        setBiomeFrom(null);
        setBiomeTo(null);
        // Si le score a encore changé, relancer une transition si besoin
        const newBiome = getCurrentBiome(gameState.score);
        if (newBiome.name !== biome.name) {
          setBiomeFrom(biome.name);
          setBiomeTo(newBiome.name);
          setBiomeTransition(true);
          setBiomeTransitionStart(Date.now());
        }
      }, BIOME_TRANSITION_DURATION);
    }
    // Si on redescend de biome sans transition
    if (!biomeTransition && currentBiome !== biome.name && !biomeTo) {
      setCurrentBiome(biome.name);
    }
  }, [gameState.score, currentBiome, biomeTransition, biomeTo]);

  const checkCollision = (birdY: number, pipes: { x: number; height: number }[]): boolean => {
    const birdHitbox = {
      left: 100,
      right: 100 + BIRD_SIZE,
      top: birdY,
      bottom: birdY + BIRD_SIZE
    };

    if (birdY <= 0) return true;
    if (birdY >= canvasSize.height - BIRD_SIZE) return true;

    return pipes.some(pipe => {
      const pipeTopHitbox = {
        left: pipe.x,
        right: pipe.x + PIPE_WIDTH,
        top: 0,
        bottom: pipe.height
      };

      const pipeBottomHitbox = {
        left: pipe.x,
        right: pipe.x + PIPE_WIDTH,
        top: pipe.height + PIPE_GAP,
        bottom: canvasSize.height
      };

      return (
        (birdHitbox.right > pipeTopHitbox.left &&
        birdHitbox.left < pipeTopHitbox.right &&
        birdHitbox.top < pipeTopHitbox.bottom) ||
        (birdHitbox.right > pipeBottomHitbox.left &&
        birdHitbox.left < pipeBottomHitbox.right &&
        birdHitbox.bottom > pipeBottomHitbox.top)
      );
    });
  };

  const startGame = () => {
    setGameState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      score: 0,
      initialRank: userRank,
      rankGain: null
    }));
    setShowDeathScreen(false);
    setHasBeatenHighScore(false);
    scoreRef.current = 0;
    setSessionCoins(0);
    setGameObjects(prev => ({
      ...prev,
      birdY: canvasSize.height / 2,
      birdVelocity: 0,
      pipes: [],
      coins: [],
    }));
  };

  // Modification des fonctions de lecture des sons
  const playJumpSound = () => {
    if (jumpSoundRef.current && soundEnabled) {
      jumpSoundRef.current.currentTime = 0;
      jumpSoundRef.current.play().catch(error => {
        console.error('Erreur lors de la lecture du son de saut:', error);
      });
    }
  };

  const jump = () => {
    if (!gameState.isPlaying) return;
    playJumpSound();
    setSessionJumps(j => j + 1);
    setGameObjects(prev => ({
      ...prev,
      birdVelocity: -6,
    }));
  };

  // Incrémente le nombre de parties à chaque début de partie
  useEffect(() => {
    if (gameState.isPlaying && gameState.score === 0 && gameState.lastScore === 0) {
      setSessionGames(g => g + 1);
    }
  }, [gameState.isPlaying, gameState.score, gameState.lastScore]);

  // Charger les coins depuis la DB quand le wallet change
  useEffect(() => {
    if (!publicKey) return;
    (async () => {
      const coins = await getCoins(publicKey.toString());
      setGameState(prev => ({ ...prev, coins }));
    })();
  }, [publicKey]);

  // Optimisation de la boucle de jeu
  const gameLoopRef = useRef<number>();

  useEffect(() => {
    if (!gameState.isPlaying || !canvasRef.current || !imagesLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Calcul des FPS
      const currentTime = performance.now();
      frameCountRef.current++;
      
      if (currentTime - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      // Mise à jour de la logique de jeu
      setGameObjects(prev => {
        const newBirdY = prev.birdY + prev.birdVelocity;
        const newVelocity = prev.birdVelocity + 0.4;
        
        let newPipes = [...prev.pipes];
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < PIPE_SPAWN_DISTANCE) {
          newPipes.push({ x: canvasSize.width, height: Math.random() * (canvasSize.height - PIPE_GAP - 100) + 50 });
          // Ajoute un coin avec une chance sur 2
          if (Math.random() < 0.5) {
            const coinY = Math.random() * (canvasSize.height - 80) + 40;
            prev.coins.push({ x: canvasSize.width, y: coinY, collected: false });
          }
        }

        newPipes = newPipes
          .map(pipe => ({ ...pipe, x: pipe.x - 2 }))
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        newPipes.forEach(pipe => {
          if (pipe.x + PIPE_WIDTH < 100 && pipe.x + PIPE_WIDTH > 97) {
            scoreRef.current += 1;
            const newScore = scoreRef.current;
            
            if (newScore > gameState.highScore && !hasBeatenHighScore) {
              playScoreSound();
              setShowHighScoreEffect(true);
              highScoreEffectRef.current = Date.now();
              setHasBeatenHighScore(true);
            }
            
            setGameState(prev => ({ ...prev, score: newScore }));
          }
        });

        if (checkCollision(newBirdY, newPipes)) {
          const finalScore = scoreRef.current;
          playDeathSound();
          setShowDeathScreen(true);
          setGameState(prev => {
            const newHighScore = Math.max(prev.highScore, finalScore);
            
            if (publicKey && finalScore > prev.highScore) {
              updateHighScore(publicKey.toString(), finalScore)
                .catch(error => console.error('Error updating high score:', error));
            }

            return {
              ...prev,
              isPlaying: false,
              highScore: newHighScore,
              lastScore: finalScore
            };
          });
          return prev;
        }

        // Mise à jour des coins (déplacement et collecte)
        let newCoins = prev.coins
          .map(coin => ({ ...coin, x: coin.x - 2 }))
          .filter(coin => coin.x > -30 && !coin.collected);

        // Détection de collision avec le bird
        newCoins = newCoins.map(coin => {
          if (!coin.collected &&
            100 + BIRD_SIZE > coin.x && 100 < coin.x + 30 &&
            prev.birdY + BIRD_SIZE > coin.y && prev.birdY < coin.y + 30
          ) {
            setSessionCoins(c => c + 1);
            setGameState(gs => {
              const newCoins = gs.coins + 1;
              if (publicKey) updateCoins(publicKey.toString(), newCoins);
              return { ...gs, coins: newCoins };
            });
            return { ...coin, collected: true };
          }
          return coin;
        });

        return {
          ...prev,
          birdY: newBirdY,
          birdVelocity: newVelocity,
          pipes: newPipes,
          coins: newCoins,
        };
      });

      // Rendu
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gestion du fond avec transition (toujours 1s entre deux biomes fixes)
      let bgImg: HTMLImageElement | null = biomeImages.current[currentBiome];
      let bgImgNext: HTMLImageElement | null = null;
      let fade = 0;
      if (biomeTransition && biomeFrom && biomeTo && biomeTransitionStart) {
        bgImg = biomeImages.current[biomeFrom];
        bgImgNext = biomeImages.current[biomeTo];
        fade = Math.min(1, (Date.now() - biomeTransitionStart) / BIOME_TRANSITION_DURATION);
      }
      if (bgImg) {
        const bgWidth = bgImg.width;
        const bgHeight = bgImg.height;
        const scale = canvas.height / bgHeight;
        const drawWidth = bgWidth * scale;
        let x = bgX;
        while (x < canvas.width) {
          ctx.drawImage(bgImg, x, 0, drawWidth, canvas.height);
          x += drawWidth;
        }
        x = bgX - drawWidth;
        while (x + drawWidth > 0) {
          ctx.drawImage(bgImg, x, 0, drawWidth, canvas.height);
          x -= drawWidth;
        }
      }
      if (biomeTransition && bgImgNext) {
        ctx.save();
        ctx.globalAlpha = fade;
        const bgWidth = bgImgNext.width;
        const bgHeight = bgImgNext.height;
        const scale = canvas.height / bgHeight;
        const drawWidth = bgWidth * scale;
        let x = bgX;
        while (x < canvas.width) {
          ctx.drawImage(bgImgNext, x, 0, drawWidth, canvas.height);
          x += drawWidth;
        }
        x = bgX - drawWidth;
        while (x + drawWidth > 0) {
          ctx.drawImage(bgImgNext, x, 0, drawWidth, canvas.height);
          x -= drawWidth;
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // Affichage des FPS
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`FPS: ${fps}`, canvas.width - 10, 20);
      
      if (birdImageRef.current) {
        ctx.drawImage(birdImageRef.current, 100, gameObjects.birdY, BIRD_SIZE, BIRD_SIZE);
      }

      if (pipeImageRef.current) {
        gameObjects.pipes.forEach(pipe => {
          ctx.drawImage(pipeImageRef.current!, pipe.x, 0, PIPE_WIDTH, pipe.height);
          ctx.drawImage(pipeImageRef.current!, pipe.x, pipe.height + PIPE_GAP, PIPE_WIDTH, canvasSize.height - (pipe.height + PIPE_GAP));
        });
      }

      // Effet high score
      if (showHighScoreEffect) {
        const elapsed = Date.now() - highScoreEffectRef.current;
        if (elapsed < 1000) { // Effet pendant 1 seconde
          const scale = 1 + Math.sin(elapsed / 100) * 0.2;
          ctx.save();
          ctx.translate(canvas.width / 2, 50);
          ctx.scale(scale, scale);
          ctx.fillStyle = '#FFD700';
          ctx.font = `${Math.min(32, canvasSize.width * 0.053)}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(`${scoreRef.current}`, 0, 0);
          
          // Afficher le gain de places si disponible
          if (gameState.rankGain !== null) {
            ctx.fillStyle = '#00FF00';
            ctx.font = `${Math.min(24, canvasSize.width * 0.04)}px Arial`;
            ctx.fillText(`+${gameState.rankGain}`, 40, 0);
          }
          
          ctx.restore();
        } else {
          setShowHighScoreEffect(false);
        }
      } else {
        // Score normal
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${Math.min(32, canvasSize.width * 0.053)}px Arial`;
      ctx.textAlign = 'center';
        const scoreText = `${scoreRef.current}`;
        const scoreWidth = ctx.measureText(scoreText).width;
        ctx.fillText(scoreText, canvas.width / 2, 50);

        // Afficher le gain de places si disponible
        if (gameState.rankGain !== null) {
          const elapsed = Date.now() - rankGainEffectRef.current;
          const scale = rankGainEffect ? 1 + Math.sin(elapsed / 100) * 0.3 : 1;
          if (elapsed > 1000) {
            setRankGainEffect(false);
          }

          ctx.save();
          // Position juste à droite du score
          ctx.translate(canvas.width / 2 + scoreWidth / 2 + 10, 50);
          ctx.scale(scale, scale);
          ctx.fillStyle = '#00FF00';
          ctx.font = `${Math.min(24, canvasSize.width * 0.04)}px Arial`;
          ctx.textAlign = 'left';
          ctx.fillText(`+${gameState.rankGain}`, 0, 0);
          ctx.restore();
        }
      }

      // Mettre à jour la position du fond
      setBgX((prev) => {
        const bgWidth = bgImg ? bgImg.width * (canvas.height / bgImg.height) : 0;
        let next = prev - BG_SCROLL_SPEED;
        if (bgWidth && next <= -bgWidth) {
          next += bgWidth;
        }
        return next;
      });

      // Dessiner les coins
      if (imagesLoaded) {
        const coinImg = new window.Image();
        coinImg.src = 'https://i.imgur.com/M0rthMS.png';
        gameObjects.coins.forEach(coin => {
          if (!coin.collected) {
            ctx.drawImage(coinImg, coin.x, coin.y, 30, 30);
          }
        });
      }

      

      // Affiche le nom du biome courant juste en dessous de la balance des coins avec transition d'opacité
      ctx.save();
      let biomeLabel = currentBiome.charAt(0).toUpperCase() + currentBiome.slice(1);
      let opacity = 1;
      if (biomeTransition && biomeFrom && biomeTo && biomeTransitionStart) {
        // Pendant la transition, on fait un fondu
        const fade = Math.min(1, (Date.now() - biomeTransitionStart) / BIOME_TRANSITION_DURATION);
        if (biomeTo === currentBiome) {
          opacity = fade;
        } else if (biomeFrom === currentBiome) {
          opacity = 1 - fade;
        }
      }
      ctx.globalAlpha = opacity;
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(biomeLabel, 16, 54);
      ctx.restore();

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, publicKey, canvasSize, imagesLoaded, gameObjects, showHighScoreEffect, rankGainEffect, biomeTransition, biomeTransitionStart]);

  // Modification de la fonction pour jouer le son de score
  const playScoreSound = () => {
    if (scoreSoundRef.current && soundEnabled) {
      scoreSoundRef.current.currentTime = 0;
      scoreSoundRef.current.play().catch(error => {
        console.error('Erreur lors de la lecture du son:', error);
      });
    }
  };

  // Ajout d'une fonction pour jouer le son de mort
  const playDeathSound = () => {
    if (deathSoundRef.current && soundEnabled) {
      deathSoundRef.current.currentTime = 0;
      deathSoundRef.current.play().catch(error => {
        console.error('Erreur lors de la lecture du son de mort:', error);
      });
    }
  };

  // Charger l'XP et le niveau du joueur au chargement
  useEffect(() => {
    if (!publicKey) return;
    (async () => {
      const { data, error } = await supabase
        .from('users')
        .select('exp, level')
        .eq('wallet_address', publicKey.toString())
        .single();
      if (!error && data) {
        setUserExp(data.exp || 0);
        setUserLevel(data.level || 0);
      }
    })();
  }, [publicKey]);

  // Fonction pour ajouter de l'XP
  const addExp = async (amount: number) => {
    let newExp = userExp + amount;
    let newLevel = userLevel;
    if (newExp >= 200) {
      newExp = newExp - 200;
      newLevel += 1;
    }
    setUserExp(newExp);
    setUserLevel(newLevel);
    await supabase
      .from('users')
      .update({ exp: newExp, level: newLevel })
      .eq('wallet_address', publicKey.toString());
  };

  // Timer pour le temps de jeu
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gameState.isPlaying) {
      timer = setInterval(() => {
        setSessionSeconds(s => s + 1);
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [gameState.isPlaying]);

  // Remise à zéro à chaque nouvelle partie
  useEffect(() => {
    if (gameState.isPlaying) {
      setSessionSeconds(0);
      setSessionJumps(0);
      setTaskProgress({});
    }
  }, [gameState.isPlaying]);

  // Mise à jour de la progression des tâches (corrigée : seules les tâches actives sont suivies)
  useEffect(() => {
    let newProgress = { ...taskProgress };
    activeTasks.forEach(id => {
      const task = TASKS.find(t => t.id === id);
      if (!task) return;
      if (task.type === 'score') newProgress[id] = Math.min(gameState.score, task.goal);
      if (task.type === 'jump') newProgress[id] = Math.min(sessionJumps, task.goal);
      if (task.type === 'time') newProgress[id] = Math.min(sessionSeconds, task.goal);
      if (task.type === 'boost') newProgress[id] = Math.min(sessionBoosts, task.goal);
      if (task.type === 'games') newProgress[id] = Math.min(sessionGames, task.goal);
      if (task.type === 'level') newProgress[id] = Math.min(userLevel, task.goal);
    });
    setTaskProgress(newProgress);
  }, [gameState.score, sessionJumps, sessionSeconds, sessionBoosts, sessionGames, userLevel, activeTasks]);

  // Quand une tâche est terminée et collectée, la remplacer par la suivante non faite
  useEffect(() => {
    let changed = false;
    let newActive = [...activeTasks];
    let newCompleted = [...completedTasks];
    let newCollected = [...collectedTasks];
    activeTasks.forEach((id, idx) => {
      const task = TASKS.find(t => t.id === id);
      if (!task) return;
      // Si la tâche a été collectée, on la remplace
      if (taskProgress[id] >= task.goal && collectedTasks.includes(id)) {
        newCompleted.push(id);
        // Remplacer par la prochaine tâche non faite
        const next = TASKS.find(t => !newActive.includes(t.id) && !newCompleted.includes(t.id) && !newCollected.includes(t.id));
        if (next) {
          newActive[idx] = next.id;
        }
        changed = true;
      }
    });
    if (changed) {
      setActiveTasks(newActive);
      setCompletedTasks(newCompleted);
    }
  }, [taskProgress, activeTasks, completedTasks, collectedTasks]);

  // Fonction de collecte d'XP
  const handleCollect = async (id: number) => {
    const task = TASKS.find(t => t.id === id);
    if (!task) return;
    await addExp(task.xp);
    setCollectedTasks(prev => [...prev, id]);
  };

  // Quand la partie se termine, consomme le boost actif (si présent)
  useEffect(() => {
    if (!gameState.isPlaying && activeBoost) {
      (async () => {
        if (publicKey) {
          // Retire le boost utilisé du tableau boosts
          const { data } = await supabase
            .from('users')
            .select('boosts')
            .eq('wallet_address', publicKey.toString())
            .single();
          let boosts = data?.boosts || [];
          boosts = boosts.filter((b: string) => b !== activeBoost);
          await supabase
            .from('users')
            .update({ boosts, active_boost: null })
            .eq('wallet_address', publicKey.toString());
          setOwnedBoosts(boosts);
          setActiveBoost(null);
        }
      })();
    }
  }, [gameState.isPlaying]);

  if (!gameState.isPlaying && !showDeathScreen) {
    return (
      <div className="flex flex-col items-center space-y-4 sm:space-y-6 p-4 sm:p-6 bg-space-light/40 rounded-xl backdrop-blur-xl border border-space-accent/10 w-full max-w-md mx-auto mt-[-2rem] transition-all duration-300 hover:border-space-accent/30 hover:backdrop-blur-lg hover:shadow-[0_0_15px_-3px_rgba(153,69,255,0.3)]">
        <div className="text-center w-full">
          <h2 style={{ color: 'white' }} className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Flappy Blimpy</h2>
          
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="bg-space-dark/80 p-2 sm:p-4 rounded-xl border border-space-accent/20 transform hover:scale-105 transition-all duration-200">
              <p className="text-white text-xs mb-1">{translations[language].lastScore}</p>
<p className="text-lg sm:text-xl font-bold text-white">{gameState.lastScore}</p>
            </div>
            <div className="bg-space-dark/80 p-2 sm:p-4 rounded-xl border border-space-accent/20 transform hover:scale-105 transition-all duration-200">
              <p className="text-space-text/80 text-xs mb-1">{translations[language].highScore}</p>
              <p className="text-lg sm:text-xl font-bold text-space-accent">{gameState.highScore}</p>
            </div>
            <div className="bg-space-dark/80 p-2 sm:p-4 rounded-xl border border-space-accent/20 transform hover:scale-105 transition-all duration-200">
              <p className="text-space-text/80 text-xs mb-1">My Rank</p>
              <p className="text-lg sm:text-xl font-bold text-space-text-light">
                {userRank ? `#${userRank}` : '-'}
              </p>
            </div>
          </div>

          <div className="relative w-16 sm:w-24 h-16 sm:h-24 mx-auto mb-4 sm:mb-8">
            {birdImageRef.current && (
              <img
                src={birdImageRef.current.src}
                alt="Bird"
                className="absolute w-12 sm:w-16 h-12 sm:h-16 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translateY(${birdPreviewY % 10}px)`,
                  transition: 'transform 0.3s ease-in-out'
                }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-3 sm:space-y-4 w-full">
          <div className="flex items-center w-full mb-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-black text-xs font-bold mr-2 shadow-md select-none">
  {userLevel}
</span>

            <div className="relative flex-1 h-4 bg-space-dark rounded-full overflow-hidden mx-2">
              <div
                className="absolute left-0 top-0 h-4 bg-space-accent transition-all duration-300"
                style={{ width: `${Math.min((userExp / 200) * 100, 100)}%` }}
              />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-space-text-light/80 select-none pointer-events-none">
                XP: {userExp}/200
              </span>
            </div>
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-black text-xs font-bold mr-2 shadow-md select-none">{userLevel + 1}</span>
            <button
  className="ml-4 px-3 py-1 rounded bg-white text-black text-xs font-bold hover:bg-gray-100 transition"
  onClick={() => setShowTasks(true)}
>
  View Tasks
</button>

          </div>
          {showTasks && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
              <div className="bg-space-light p-4 rounded-xl shadow-xl w-full max-w-xs border border-space-accent/20">
               <h2 className="text-lg font-bold mb-4 text-space-accent text-center tracking-wide">Tasks</h2>
                <div className="space-y-3">
                  {activeTasks.map(id => {
                    const task = TASKS.find(t => t.id === id);
                    if (!task) return null;
                    const progress = taskProgress[id] || 0;
                    const percent = Math.min((progress / task.goal) * 100, 100);
                    const done = progress >= task.goal;
                    const collected = collectedTasks.includes(id);
                    return (
                      <div key={id} className={`flex items-center p-2 rounded-lg border ${done ? (collected ? 'border-green-500 bg-green-900/30' : 'border-yellow-400 bg-yellow-900/20') : 'border-space-accent/20 bg-space-dark/80'} shadow transition-all`}> 
                        <div className="flex-1">
                          <div className="font-medium text-space-text-light mb-0.5 text-xs">{task.label}</div>
                          <div className="w-full h-2 bg-space-light/30 rounded-full overflow-hidden mb-0.5">
                            <div className="h-2 bg-space-accent transition-all duration-300" style={{ width: `${percent}%` }} />
                          </div>
                          <div className="text-[10px] text-space-text/70">{progress} / {task.goal}</div>
                        </div>
                        <div className="ml-2 flex flex-col items-end">
                          <span className="text-[10px] text-yellow-400 font-bold">+{task.xp} XP</span>
                          {done && !collected && (
                            <button className="mt-1 px-2 py-0.5 rounded bg-space-accent text-white text-[10px] font-bold hover:bg-space-accent-light transition" onClick={() => handleCollect(id)}>Collect</button>
                          )}
                          {done && collected && <span className="text-green-400 text-[10px] mt-0.5">Done !</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="mt-5 w-full py-1.5 rounded bg-space-accent text-white font-bold text-sm hover:bg-space-accent-light transition" onClick={() => setShowTasks(false)}>Fermer</button>
              </div>
            </div>
          )}
          <div className="flex justify-center space-x-2 w-full">
            
          </div>

          {/* SHOP POPUP */}
          {showShop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300 animate-fade-in" style={{animation: 'fadeIn 0.3s'}}>
              <div className="bg-space-light/95 rounded-xl shadow-xl border border-space-accent/30 p-3 max-w-xs w-full h-[220px] relative flex flex-col items-center opacity-0 animate-shop-popup">
                <button
                  className="absolute top-2 right-2 text-space-accent hover:text-red-500 text-xl font-bold transition"
                  onClick={() => setShowShop(false)}
                  aria-label="Close shop"
                >
                  ×
                </button>
                <h2 className="text-xl font-bold text-space-accent mb-4 tracking-wide text-center">Boosts</h2>
                <div className="w-full flex flex-row items-center justify-center gap-2 pt-2 pb-2">
                  {SHOP_ITEMS.map(item => (
                    <div key={item.key} className={`flex flex-col items-center bg-space-dark/80 rounded-lg border border-space-accent/20 shadow-lg p-2 w-[100px] transition-all duration-200 ${item.disabled ? 'opacity-60' : 'hover:scale-105'}`}>
                      <img src={item.image} alt={item.name} className="w-8 h-8 mb-2 rounded bg-space-light object-contain" />
                      <div className="font-bold text-sm text-space-text-light mb-1">{item.name}</div>
                      <div className="flex items-center mb-2">
                        <img src="/objects/coin.png" alt="coin" className="w-4 h-4 mr-1" />
                        <span className="text-yellow-400 font-bold text-xs">{item.price}</span>
                      </div>
                      <button
                        onClick={item.onBuy}
                        disabled={gameState.coins < item.price || item.disabled}
                        className={`px-2 py-1 rounded text-white font-bold text-xs transition-all duration-200 w-full ${
                          gameState.coins < item.price || item.disabled
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-space-accent hover:bg-space-accent/90 hover:scale-105'
                        }`}
                      >
                        Acheter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s forwards; }
                @keyframes shopPopup { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-shop-popup { animation: shopPopup 0.35s cubic-bezier(.4,2,.3,1) forwards; }
              `}</style>
            </div>
          )}
          {/* BOOSTS POPUP */}
          {showBoosts && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300 animate-fade-in" style={{animation: 'fadeIn 0.3s'}}>
              <div className="bg-space-light/95 rounded-xl shadow-xl border border-space-accent/30 p-3 max-w-xs w-full h-[420px] relative flex flex-col items-center opacity-0 animate-shop-popup">
                <button
                  className="absolute top-2 right-2 text-space-accent hover:text-red-500 text-xl font-bold transition"
                  onClick={() => setShowBoosts(false)}
                  aria-label="Close boosts"
                >
                  ×
                </button>
                <h2 className="text-xl font-bold text-space-accent mb-4 tracking-wide text-center">My Boosts</h2>
                <div className="w-full flex flex-col items-center gap-3 overflow-y-auto max-h-[340px] pt-2 pb-2">
                  {ownedBoosts.length === 0 && (
                    <div className="text-space-text/70 text-center">You have no boosts yet.</div>
                  )}
                  {ownedBoosts.map(boost => (
                    <div key={boost} className={`flex flex-col items-center bg-space-dark/80 rounded-lg border border-space-accent/20 shadow-lg p-2 w-[90px] transition-all duration-200 ${activeBoost === boost ? 'ring-2 ring-space-accent' : ''}`}>
                      <img src={`/objects/${boost}.png`} alt={boost} className="w-7 h-7 mb-2 rounded bg-space-light object-contain" />
                      <div className="font-bold text-xs text-space-text-light mb-1">{boost.charAt(0).toUpperCase() + boost.slice(1)} Boost</div>
                      {activeBoost === boost ? (
                        <button
                          onClick={handleDisableBoost}
                          className="px-2 py-1 rounded text-white font-bold text-xs transition-all duration-200 w-full bg-red-500 hover:bg-red-600"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateBoost(boost)}
                          className="px-2 py-1 rounded text-white font-bold text-xs transition-all duration-200 w-full bg-space-accent hover:bg-space-accent/90"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s forwards; }
                @keyframes shopPopup { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-shop-popup { animation: shopPopup 0.35s cubic-bezier(.4,2,.3,1) forwards; }
              `}</style>
            </div>
          )}
          <div className="flex justify-center space-x-3 sm:space-x-4 mt-2">
            <button
  onClick={startGame}
  className="px-3 sm:px-6 py-2 sm:py-2.5 bg-white text-black rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 font-bold text-xs sm:text-base w-32 sm:w-36"
>
  {translations[language].play}
</button>



            <button
              onClick={() => navigate('/leaderboard')}
              className="px-3 sm:px-6 py-2 sm:py-2.5 bg-space-dark/80 text-white rounded-xl hover:bg-space-dark transition-all duration-200 hover:scale-105 font-bold text-xs sm:text-base w-32 sm:w-36 flex items-center justify-center space-x-1 sm:space-x-2"
            >
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{translations[language].leaderboard}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={jump}
        onKeyDown={(e) => {
          if (e.code === 'Space') jump();
        }}
        tabIndex={0}
        className="rounded-xl border border-space-accent/10 mx-auto"
        style={{ backgroundColor: '#0A0A0A' }}
      />

      {showDeathScreen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl opacity-0 animate-fade-in">
    <div className="bg-space-light/90 p-4 sm:p-8 rounded-lg border border-space-accent/20 text-center transform scale-95 animate-scale-in flex flex-col items-center">
      <h3 className="text-xl sm:text-2xl font-bold text-space-text-light mb-2 sm:mb-4">{translations[language].gameOver}</h3>
      <p className="text-sm sm:text-base text-space-text mb-4 sm:mb-6">{translations[language].highScore}: {gameState.highScore}</p>
      <div className="flex space-x-2 sm:space-x-4">
        <button
  onClick={startGame}
  className="px-3 sm:px-6 py-2 sm:py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 text-sm sm:text-base"
>
  {translations[language].playAgain}
</button>

        <button
          onClick={() => {
            setGameState(prev => ({ ...prev, isPlaying: false }));
            setShowDeathScreen(false);
          }}
          className="px-3 sm:px-6 py-2 sm:px-3 bg-space-dark text-space-text-light rounded-lg hover:bg-space-dark/80 transition-all duration-200 hover:scale-105 text-sm sm:text-base"
        >
          {translations[language].home}
        </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
