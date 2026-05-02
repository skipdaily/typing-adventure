import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Trophy, Timer, Target, Star, Volume2, ArrowLeft, ShoppingBag, X, Gift, User, Lock, LogOut, BarChart3 } from 'lucide-react';
import { EQUATIONS_LIST, FLIPPER_LIST, EMOJI_LIST, SCRAMBLE_LIST, OPPOSITES_LIST, GameItem } from './data';
import { DEFAULT_AVATARS, DEFAULT_BACKGROUNDS, SECRET_BACKGROUNDS, SHOP_AVATARS, SHOP_BACKGROUNDS } from './shopData';

const mapToGameItem = (list: string[]): GameItem[] => list.map(word => ({ prompt: word, answer: word }));

const WORD_LIST_EASY = mapToGameItem([
  "cat", "dog", "pig", "cow", "rat", "sun", "moon", "star", "bug", "ant",
  "bat", "car", "bus", "hat", "cap", "red", "blue", "run", "jump", "play",
  "toy", "boy", "girl", "mom", "dad", "tree", "bird", "fish", "frog", "bear",
  "bee", "fly", "fox", "owl", "man", "map", "box", "cup", "bed", "day",
  "one", "two", "six", "ten", "yes", "no", "hi", "bye", "up", "out"
]);

const WORD_LIST_MEDIUM = mapToGameItem([
  "apple", "bread", "house", "mouse", "train", "plant", "water", "earth", "world", "light",
  "happy", "smile", "laugh", "green", "black", "white", "brown", "color", "paint", "paper",
  "school", "friend", "family", "sister", "brother", "mother", "father", "animal", "monkey", "tiger",
  "lion", "zebra", "snake", "ocean", "river", "beach", "grass", "cloud", "storm", "magic",
  "music", "dance", "song", "story", "book", "pencil", "clock", "watch", "shoe", "shirt"
]);

const WORD_LIST_HARD = mapToGameItem([
  "elephant", "giraffe", "dinosaur", "computer", "keyboard", "internet", "website", "champion", "adventure", "treasure",
  "mountain", "volcano", "astronaut", "spaceship", "universe", "galaxy", "scientist", "experiment", "telescope", "microscope",
  "butterfly", "crocodile", "alligator", "kangaroo", "penguin", "dolphin", "whale", "octopus", "jellyfish", "seahorse",
  "beautiful", "wonderful", "amazing", "fantastic", "brilliant", "excellent", "awesome", "perfect", "magical", "colorful",
  "important", "together", "different", "remember", "understand", "question", "answer", "learning", "discovery", "knowledge"
]);

const NUMBER_LIST_EASY = mapToGameItem([
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "15", "20", "25", "30", "40", "50", "99"
]);

const NUMBER_LIST_MEDIUM = mapToGameItem([
  "100", "200", "300", "400", "500", "150", "250", "350", "450", "550",
  "123", "456", "789", "987", "654", "321", "111", "222", "333", "444",
  "105", "206", "307", "408", "509", "999", "888", "777", "666", "555"
]);

const NUMBER_LIST_HARD = mapToGameItem([
  "1000", "2000", "3000", "1234", "5678", "3456", "7890", "9999", "8888", "2500",
  "1999", "2023", "2024", "2025", "7777", "6666", "5555", "4444", "2020", "5050"
]);

const MATH_LIST_EASY = mapToGameItem([
  "1/2", "1/4", "3/4", "0.5", "0.1", "1.5", "2.0", "line", "dot", "ray",
  "cube", "cone", "area", "math", "add", "sum", "box", "half"
]);

const MATH_LIST_MEDIUM = mapToGameItem([
  "1/3", "2/5", "3/8", "0.25", "0.75", "1.25", "3.14", "angle", "circle", "square",
  "vertex", "side", "base", "prism", "shape", "equal", "minus"
]);

const MATH_LIST_HARD = mapToGameItem([
  "3.1415", "5/16", "7/8", "0.333", "decimal", "fraction", "geometry", "polygon",
  "triangle", "rectangle", "cylinder", "perimeter", "volume", "diameter", "radius", "equation"
]);

const TIME_LIMIT = 60; // 60 seconds
const USERS_STORAGE_KEY = 'typingAdventureUsers';
const CURRENT_USER_STORAGE_KEY = 'typingAdventureCurrentUser';
const SUPABASE_SESSION_STORAGE_KEY = 'typingAdventureSupabaseSession';
const ENV = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
const SUPABASE_URL = ENV.VITE_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY = ENV.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

type GameState = 'LOBBY' | 'COUNTDOWN' | 'PLAYING' | 'GAMEOVER';
type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'words' | 'numbers' | 'math' | 'equations' | 'flipper' | 'emoji' | 'scramble' | 'opposites';
type AuthMode = 'login' | 'create';

interface ModeStats {
  gamesPlayed: number;
  bestScore: number;
  bestAccuracy: number;
  totalPoints?: number;
}

interface GameHistoryEntry {
  mode: GameMode;
  difficulty: Difficulty;
  score: number;
  accuracy: number;
  date: string;
}

interface UserAccount {
  id?: string;
  username: string;
  password?: string;
  sessionToken?: string;
  createdAt: string;
  avatar: string;
  selectedBg: string;
  coins: number;
  ownedAvatars: string[];
  ownedBackgrounds: string[];
  unlockedThemes: string[];
  totalPointsEarned: number;
  gamesPlayed: number;
  bestScore: number;
  bestAccuracy: number;
  achievements: string[];
  modeStats: Partial<Record<GameMode, ModeStats>>;
  recentGames: GameHistoryEntry[];
}

interface LeaderboardEntry {
  name: string;
  score: number;
  accuracy: number;
  avatar: string;
  date: string;
}

type LeaderboardData = Record<string, LeaderboardEntry[]>;
type UserAccounts = Record<string, UserAccount>;

const normalizeUsername = (name: string) => name.trim().toLowerCase();

const supabaseRpc = async <T,>(functionName: string, payload: Record<string, unknown>): Promise<T> => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase is not configured.');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let message = 'Supabase request failed.';
    try {
      const error = await response.json();
      message = error.message || error.details || message;
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  return response.json();
};

const dashboardToUser = (dashboard: any, sessionToken?: string): UserAccount => ({
  id: dashboard.id,
  username: dashboard.username,
  sessionToken,
  createdAt: dashboard.createdAt || new Date().toISOString(),
  avatar: dashboard.avatar || '🐶',
  selectedBg: dashboard.selectedBg || 'paper',
  coins: dashboard.coins || 0,
  ownedAvatars: dashboard.ownedAvatars || [],
  ownedBackgrounds: dashboard.ownedBackgrounds || [],
  unlockedThemes: dashboard.unlockedThemes || [],
  totalPointsEarned: dashboard.totalPointsEarned || 0,
  gamesPlayed: dashboard.gamesPlayed || 0,
  bestScore: dashboard.bestScore || 0,
  bestAccuracy: dashboard.bestAccuracy ?? 100,
  achievements: dashboard.achievements || [],
  modeStats: dashboard.modeStats || {},
  recentGames: (dashboard.recentGames || []).map((game: any) => ({
    mode: game.mode,
    difficulty: game.difficulty,
    score: game.score || 0,
    accuracy: game.accuracy ?? 100,
    date: game.date ? new Date(game.date).toLocaleString() : ''
  }))
});

const leaderboardRowToUser = (row: any, mode: GameMode): UserAccount => ({
  username: row.username,
  createdAt: '',
  avatar: row.avatar || '🐶',
  selectedBg: 'paper',
  coins: 0,
  ownedAvatars: [],
  ownedBackgrounds: [],
  unlockedThemes: [],
  totalPointsEarned: row.total_points_earned || 0,
  gamesPlayed: row.games_played || 0,
  bestScore: row.best_score || 0,
  bestAccuracy: row.best_accuracy ?? 100,
  achievements: Array.from({ length: Number(row.achievements_count || 0) }, (_, index) => `Achievement ${index + 1}`),
  modeStats: {
    [mode]: {
      gamesPlayed: row.games_played || 0,
      bestScore: row.best_score || 0,
      bestAccuracy: row.best_accuracy ?? 100
    }
  },
  recentGames: []
});

const createNewUser = (username: string, password: string): UserAccount => ({
  username: username.trim(),
  password,
  createdAt: new Date().toISOString(),
  avatar: '🐶',
  selectedBg: 'paper',
  coins: 0,
  ownedAvatars: [],
  ownedBackgrounds: [],
  unlockedThemes: [],
  totalPointsEarned: 0,
  gamesPlayed: 0,
  bestScore: 0,
  bestAccuracy: 100,
  achievements: ['First Profile'],
  modeStats: {},
  recentGames: []
});

const getUserAchievements = (user: UserAccount): string[] => {
  const achievements = new Set(user.achievements);
  const playedModes = Object.keys(user.modeStats).length;

  if (user.gamesPlayed >= 1) achievements.add('First Game');
  if (user.gamesPlayed >= 10) achievements.add('10 Game Streak');
  if (user.gamesPlayed >= 25) achievements.add('Practice Pro');
  if (user.totalPointsEarned >= 500) achievements.add('500 Point Explorer');
  if (user.totalPointsEarned >= 1000) achievements.add('1,000 Point Champion');
  if (user.totalPointsEarned >= 5000) achievements.add('5,000 Point Legend');
  if (user.bestScore >= 100) achievements.add('100 Point Round');
  if (user.bestScore >= 250) achievements.add('Speed Star');
  if (user.bestAccuracy >= 95) achievements.add('Sharp Shooter');
  if (user.bestAccuracy === 100 && user.gamesPlayed > 0) achievements.add('Perfect Accuracy');
  if (playedModes >= 3) achievements.add('Mode Explorer');
  if (playedModes >= 8) achievements.add('All Modes Adventurer');
  if (user.ownedAvatars.length >= 1) achievements.add('First Character');
  if (user.ownedAvatars.length >= 10) achievements.add('Character Collector');
  if (user.ownedBackgrounds.length >= 1) achievements.add('First World');
  if (user.ownedBackgrounds.length >= 10) achievements.add('World Collector');
  if (user.unlockedThemes.length >= 1) achievements.add('Secret Finder');

  return Array.from(achievements);
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('words');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({});
  const [accounts, setAccounts] = useState<UserAccounts>({});
  const [remoteLeaderboard, setRemoteLeaderboard] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('create');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [authError, setAuthError] = useState('');
  const [showCredentialWarning, setShowCredentialWarning] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedProfileName, setSelectedProfileName] = useState<string | null>(null);
  
  const [playerName, setPlayerName] = useState('Explorer');
  const [avatar, setAvatar] = useState('🐶');
  const [selectedBg, setSelectedBg] = useState('paper');
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [floatingEgg, setFloatingEgg] = useState<{ x: number, y: number, emoji: string, id: number } | null>(null);
  
  // Shop state
  const [coins, setCoins] = useState(0);
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>([]); // Storing just the purchased ones
  const [ownedBackgrounds, setOwnedBackgrounds] = useState<string[]>([]); // Storing background IDs
  const [showShop, setShowShop] = useState(false);
  const [shopCategory, setShopCategory] = useState<'avatars' | 'backgrounds' | 'codes'>('avatars');
  const [shopCode, setShopCode] = useState('');
  const [codeMessage, setCodeMessage] = useState({ text: '', type: '' });

  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  
  const [words, setWords] = useState<GameItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  
  const [characterMood, setCharacterMood] = useState<'neutral' | 'happy' | 'oops'>('neutral');
  
  const inputRef = useRef<HTMLInputElement>(null);

  const applyUserProfile = (user: UserAccount) => {
    setPlayerName(user.username);
    setAvatar(user.avatar);
    setSelectedBg(user.selectedBg);
    setUnlockedThemes(user.unlockedThemes);
    setCoins(user.coins);
    setOwnedAvatars(user.ownedAvatars);
    setOwnedBackgrounds(user.ownedBackgrounds);
  };

  const persistAccounts = (nextAccounts: UserAccounts) => {
    setAccounts(nextAccounts);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextAccounts));
  };

  const saveCurrentUser = (user: UserAccount) => {
    const userWithAchievements = { ...user, achievements: getUserAchievements(user) };
    setCurrentUser(userWithAchievements);
    applyUserProfile(userWithAchievements);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, normalizeUsername(userWithAchievements.username));
    if (userWithAchievements.sessionToken) {
      localStorage.setItem(SUPABASE_SESSION_STORAGE_KEY, userWithAchievements.sessionToken);
    }
    setAccounts(prev => {
      const nextAccounts = { ...prev, [normalizeUsername(userWithAchievements.username)]: userWithAchievements };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextAccounts));
      return nextAccounts;
    });
  };

  const updateCurrentUser = (updater: (user: UserAccount) => UserAccount) => {
    if (!currentUser) return;
    const updated = { ...updater(currentUser) };
    saveCurrentUser(updated);
  };

  const clearAuthForm = () => {
    setAuthUsername('');
    setAuthPassword('');
    setAuthPasswordConfirm('');
    setAuthError('');
    setShowCredentialWarning(false);
  };

  const refreshRemoteLeaderboard = async (mode: GameMode = gameMode) => {
    if (!SUPABASE_ENABLED) return;

    try {
      const rows = await supabaseRpc<any[]>('list_leaderboard', {
        p_mode: mode,
        p_limit: 10
      });
      setRemoteLeaderboard(rows.map(row => leaderboardRowToUser(row, mode)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAuthSubmit = async () => {
    const normalized = normalizeUsername(authUsername);
    const username = authUsername.trim();

    if (!username || !authPassword) {
      setAuthError('Please enter a username and password.');
      return;
    }

    if (authMode === 'login') {
      if (SUPABASE_ENABLED) {
        try {
          const result = await supabaseRpc<{ sessionToken: string; player: any }>('login_player', {
            p_username: username,
            p_password: authPassword
          });
          saveCurrentUser(dashboardToUser(result.player, result.sessionToken));
          clearAuthForm();
          await refreshRemoteLeaderboard();
        } catch (error) {
          setAuthError(error instanceof Error ? error.message : 'Could not log in.');
        }
        return;
      }

      const foundUser = accounts[normalized];
      if (!foundUser || foundUser.password !== authPassword) {
        setAuthError('That username or password is not right.');
        return;
      }
      setCurrentUser(foundUser);
      applyUserProfile(foundUser);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, normalized);
      clearAuthForm();
      return;
    }

    if (!SUPABASE_ENABLED && accounts[normalized]) {
      setAuthError('That username is already taken on this browser.');
      return;
    }

    if (authPassword !== authPasswordConfirm) {
      setAuthError('Type the same password twice.');
      return;
    }

    setAuthError('');
    setShowCredentialWarning(true);
  };

  const confirmCreateUser = async () => {
    if (SUPABASE_ENABLED) {
      try {
        const result = await supabaseRpc<{ sessionToken: string; player: any }>('create_player', {
          p_username: authUsername,
          p_password: authPassword
        });
        saveCurrentUser(dashboardToUser(result.player, result.sessionToken));
        clearAuthForm();
        setGameState('LOBBY');
        await refreshRemoteLeaderboard();
      } catch (error) {
        setShowCredentialWarning(false);
        setAuthError(error instanceof Error ? error.message : 'Could not create user.');
      }
      return;
    }

    const newUser = createNewUser(authUsername, authPassword);
    saveCurrentUser(newUser);
    clearAuthForm();
    setGameState('LOBBY');
  };

  const handleLogout = async () => {
    if (SUPABASE_ENABLED && currentUser?.sessionToken) {
      try {
        await supabaseRpc<boolean>('logout_player', {
          p_session_token: currentUser.sessionToken
        });
      } catch (error) {
        console.error(error);
      }
    }

    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    localStorage.removeItem(SUPABASE_SESSION_STORAGE_KEY);
    setCurrentUser(null);
    setGameState('LOBBY');
    setShowShop(false);
    setShowDashboard(false);
    setSelectedProfileName(null);
    setPlayerName('Explorer');
    setAvatar('🐶');
    setSelectedBg('paper');
    setUnlockedThemes([]);
    setCoins(0);
    setOwnedAvatars([]);
    setOwnedBackgrounds([]);
  };

  // Load saved users
  useEffect(() => {
    if (SUPABASE_ENABLED) {
      const savedSessionToken = localStorage.getItem(SUPABASE_SESSION_STORAGE_KEY);
      if (savedSessionToken) {
        supabaseRpc<any>('get_my_dashboard', {
          p_session_token: savedSessionToken
        })
          .then(dashboard => saveCurrentUser(dashboardToUser(dashboard, savedSessionToken)))
          .catch(error => {
            console.error(error);
            localStorage.removeItem(SUPABASE_SESSION_STORAGE_KEY);
            localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
          });
      }
      refreshRemoteLeaderboard();
      return;
    }

    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    let parsedUsers: UserAccounts = {};

    if (savedUsers) {
      try {
        parsedUsers = JSON.parse(savedUsers);
        setAccounts(parsedUsers);
      } catch (e) {
        console.error(e);
      }
    }

    const savedCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (savedCurrentUser && parsedUsers[savedCurrentUser]) {
      setCurrentUser(parsedUsers[savedCurrentUser]);
      applyUserProfile(parsedUsers[savedCurrentUser]);
    }

    const savedLeaderboard = localStorage.getItem('typingLeaderboard');
    if (savedLeaderboard) {
      try {
        setLeaderboard(JSON.parse(savedLeaderboard));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    refreshRemoteLeaderboard(gameMode);
  }, [gameMode]);

  // Timer Effect
  useEffect(() => {
    let timerId: ReturnType<typeof setInterval>;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft <= 0) {
      endGame();
    }
    return () => clearInterval(timerId);
  }, [gameState, timeLeft]);

  // Countdown Effect
  useEffect(() => {
    let timerId: ReturnType<typeof setInterval>;
    if (gameState === 'COUNTDOWN' && countdown !== null && countdown > 0) {
      timerId = setInterval(() => {
        setCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (gameState === 'COUNTDOWN' && countdown === 0) {
      const msTimeout = setTimeout(() => {
        setGameState('PLAYING');
      }, 1000);
      return () => clearTimeout(msTimeout);
    }
    return () => clearInterval(timerId);
  }, [gameState, countdown]);

  // Focus Input effect
  useEffect(() => {
    if (gameState === 'PLAYING') {
      inputRef.current?.focus();
    }
  }, [gameState]);

  // Easter eggs based on name
  useEffect(() => {
    const name = playerName.toLowerCase().trim();
    if (['magic', 'ninja', 'hacker'].includes(name) && !unlockedThemes.includes(name)) {
      const newThemes = [...unlockedThemes, name];
      let nextAvatar = avatar;
      let nextBg = selectedBg;
      setUnlockedThemes(newThemes);
      
      if (name === 'magic') {
        nextAvatar = '🧙‍♂️';
        nextBg = 'magic';
        setAvatar(nextAvatar);
        setSelectedBg(nextBg);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else if (name === 'ninja') {
        nextAvatar = '🥷';
        nextBg = 'ninja';
        setAvatar(nextAvatar);
        setSelectedBg(nextBg);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#000', '#FFF', '#f43f5e'] });
      } else if (name === 'hacker') {
        nextAvatar = '👾';
        nextBg = 'hacker';
        setAvatar(nextAvatar);
        setSelectedBg(nextBg);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#22c55e'] });
      }

      if (currentUser) {
        if (SUPABASE_ENABLED && currentUser.sessionToken) {
          supabaseRpc<any>('unlock_theme', {
            p_session_token: currentUser.sessionToken,
            p_theme_id: name
          })
            .then(() => supabaseRpc<any>('update_player_style', {
              p_session_token: currentUser.sessionToken,
              p_avatar: nextAvatar,
              p_selected_bg: nextBg
            }))
            .then(dashboard => saveCurrentUser(dashboardToUser(dashboard, currentUser.sessionToken)))
            .catch(error => console.error(error));
          return;
        }

        updateCurrentUser(user => ({
          ...user,
          avatar: nextAvatar,
          selectedBg: nextBg,
          unlockedThemes: newThemes
        }));
      }
    }
  }, [playerName, unlockedThemes, currentUser]);

  // Floating easter egg event
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      setFloatingEgg(null);
      return;
    }
    
    const spawnTimer = setInterval(() => {
      // Small chance to spawn a bonus emoji every 3 seconds
      if (Math.random() > 0.8 && !floatingEgg) {
        setFloatingEgg({
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          emoji: ['🌟', '💎', '🍕', '🎁', '🚀', '👑'][Math.floor(Math.random() * 6)],
          id: Date.now()
        });
      }
    }, 3000);

    return () => clearInterval(spawnTimer);
  }, [gameState, floatingEgg]);

  useEffect(() => {
    if (floatingEgg) {
      const timer = setTimeout(() => {
        setFloatingEgg(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [floatingEgg]);

  const currentAvatars = [...DEFAULT_AVATARS];
  if (unlockedThemes.includes('magic')) currentAvatars.push('🧙‍♂️', '🧚', '🐉', '🔮');
  if (unlockedThemes.includes('ninja')) currentAvatars.push('🥷', '🏯', '🐉', '⚔️');
  if (unlockedThemes.includes('hacker')) currentAvatars.push('👾', '🤖', '👽', '🕶️');
  ownedAvatars.forEach(avatarId => {
    const shopAvatar = SHOP_AVATARS.find(a => a.id === avatarId);
    if (shopAvatar) currentAvatars.push(shopAvatar.emoji);
  });
  const uniqueAvatars = Array.from(new Set(currentAvatars));

  const currentBackgrounds = [...DEFAULT_BACKGROUNDS];
  unlockedThemes.forEach(theme => {
     const secretBg = SECRET_BACKGROUNDS.find(bg => bg.id === theme);
     if (secretBg && !currentBackgrounds.includes(secretBg)) currentBackgrounds.push(secretBg);
  });
  ownedBackgrounds.forEach(bgId => {
     const shopBg = SHOP_BACKGROUNDS.find(bg => bg.id === bgId);
     if (shopBg && !currentBackgrounds.find(b => b.id === shopBg.id)) currentBackgrounds.push(shopBg);
  });

  const startCountdown = () => {
    let list: GameItem[];
    if (gameMode === 'words') {
      if (difficulty === 'easy') list = WORD_LIST_EASY;
      else if (difficulty === 'medium') list = WORD_LIST_MEDIUM;
      else list = WORD_LIST_HARD;
    } else if (gameMode === 'numbers') {
      if (difficulty === 'easy') list = NUMBER_LIST_EASY;
      else if (difficulty === 'medium') list = NUMBER_LIST_MEDIUM;
      else list = NUMBER_LIST_HARD;
    } else if (gameMode === 'math') {
      if (difficulty === 'easy') list = MATH_LIST_EASY;
      else if (difficulty === 'medium') list = MATH_LIST_MEDIUM;
      else list = MATH_LIST_HARD;
    } else if (gameMode === 'equations') {
      list = EQUATIONS_LIST;
    } else if (gameMode === 'flipper') {
      list = FLIPPER_LIST;
    } else if (gameMode === 'emoji') {
       list = EMOJI_LIST;
    } else if (gameMode === 'scramble') {
       list = SCRAMBLE_LIST;
    } else if (gameMode === 'opposites') {
       list = OPPOSITES_LIST;
    } else {
       list = WORD_LIST_EASY;
    }

    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setWords(shuffled);
    setCurrentWordIndex(0);
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setCurrentInput('');
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setCharacterMood('neutral');
    
    setCountdown(3);
    setGameState('COUNTDOWN');
  };

  const endGame = async () => {
    setGameState('GAMEOVER');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
    });

    const currentAccuracy = getAccuracy();
    const newCoins = coins + score;
    setCoins(newCoins);

    if (SUPABASE_ENABLED && currentUser?.sessionToken) {
      try {
        const dashboard = await supabaseRpc<any>('record_game_result', {
          p_session_token: currentUser.sessionToken,
          p_mode: gameMode,
          p_difficulty: difficulty,
          p_score: score,
          p_accuracy: currentAccuracy,
          p_correct_keystrokes: correctKeystrokes,
          p_total_keystrokes: totalKeystrokes
        });
        saveCurrentUser(dashboardToUser(dashboard, currentUser.sessionToken));
        await refreshRemoteLeaderboard(gameMode);
      } catch (error) {
        console.error(error);
      }
      return;
    }

    if (currentUser) {
      const currentModeStats = currentUser.modeStats[gameMode] || {
        gamesPlayed: 0,
        bestScore: 0,
        bestAccuracy: 0
      };
      const updatedUser: UserAccount = {
        ...currentUser,
        avatar,
        selectedBg,
        coins: newCoins,
        unlockedThemes,
        ownedAvatars,
        ownedBackgrounds,
        totalPointsEarned: currentUser.totalPointsEarned + score,
        gamesPlayed: currentUser.gamesPlayed + 1,
        bestScore: Math.max(currentUser.bestScore, score),
        bestAccuracy: Math.max(currentUser.bestAccuracy, currentAccuracy),
        modeStats: {
          ...currentUser.modeStats,
          [gameMode]: {
            gamesPlayed: currentModeStats.gamesPlayed + 1,
            bestScore: Math.max(currentModeStats.bestScore, score),
            bestAccuracy: Math.max(currentModeStats.bestAccuracy, currentAccuracy)
          }
        },
        recentGames: [
          {
            mode: gameMode,
            difficulty,
            score,
            accuracy: currentAccuracy,
            date: new Date().toLocaleString()
          },
          ...currentUser.recentGames
        ].slice(0, 8)
      };
      saveCurrentUser(updatedUser);
    }

    const newEntry: LeaderboardEntry = {
      name: playerName || 'Unknown Typer',
      score,
      accuracy: currentAccuracy,
      avatar,
      date: new Date().toDateString()
    };
    
    setLeaderboard(prev => {
      const gModeList = prev[gameMode] || [];
      const newModeList = [...gModeList, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      const newLeaderboard = { ...prev, [gameMode]: newModeList };
      localStorage.setItem('typingLeaderboard', JSON.stringify(newLeaderboard));
      return newLeaderboard;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    const currentItem = words[currentWordIndex];
    if (!currentItem) return;
    
    const currentWord = currentItem.answer.toLowerCase();
    
    // Calculate if they just typed correctly or made a mistake
    if (value.length > currentInput.length) {
      setTotalKeystrokes(prev => prev + 1);
      
      const newCharIndex = value.length - 1;
      if (value[newCharIndex] === currentWord[newCharIndex]) {
        setCorrectKeystrokes(prev => prev + 1);
        setCharacterMood('happy');
      } else {
        setCharacterMood('oops');
      }
    } else if (value.length < currentInput.length) {
      setCharacterMood('neutral'); // when deleting, go neutral
    }

    setCurrentInput(value);

    // Check if word is complete
    if (value.trim() === currentWord) {
      // Correct!
      setScore(prev => prev + 10);
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 },
        startVelocity: 15,
        scalar: 0.8,
        colors: ['#10b981', '#3b82f6'] // Green and Blue for single word
      });
      setCurrentInput('');
      setCharacterMood('happy');
      
      handleNextWord();
    }
  };

  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      // Ran out of words (rare)
      let list: GameItem[];
      if (gameMode === 'words') {
        if (difficulty === 'easy') list = WORD_LIST_EASY;
        else if (difficulty === 'medium') list = WORD_LIST_MEDIUM;
        else list = WORD_LIST_HARD;
      } else if (gameMode === 'numbers') {
        if (difficulty === 'easy') list = NUMBER_LIST_EASY;
        else if (difficulty === 'medium') list = NUMBER_LIST_MEDIUM;
        else list = NUMBER_LIST_HARD;
      } else if (gameMode === 'math') {
        if (difficulty === 'easy') list = MATH_LIST_EASY;
        else if (difficulty === 'medium') list = MATH_LIST_MEDIUM;
        else list = MATH_LIST_HARD;
      } else if (gameMode === 'equations') {
        list = EQUATIONS_LIST;
      } else if (gameMode === 'flipper') {
        list = FLIPPER_LIST;
      } else if (gameMode === 'emoji') {
         list = EMOJI_LIST;
      } else if (gameMode === 'scramble') {
         list = SCRAMBLE_LIST;
      } else if (gameMode === 'opposites') {
         list = OPPOSITES_LIST;
      } else {
         list = WORD_LIST_EASY;
      }

      const shuffled = [...list].sort(() => 0.5 - Math.random());
      setWords(shuffled);
      setCurrentWordIndex(0);
    }
  }

  const handleBuyAvatar = async (id: string, price: number) => {
    if (coins >= price && !ownedAvatars.includes(id)) {
      if (SUPABASE_ENABLED && currentUser?.sessionToken) {
        try {
          const dashboard = await supabaseRpc<any>('purchase_shop_item', {
            p_session_token: currentUser.sessionToken,
            p_item_type: 'avatar',
            p_item_id: id
          });
          saveCurrentUser(dashboardToUser(dashboard, currentUser.sessionToken));
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#FFD700'] });
        } catch (error) {
          setCodeMessage({ text: error instanceof Error ? error.message : 'Could not buy character.', type: 'error' });
        }
        return;
      }

      const newCoins = coins - price;
      const newOwned = [...ownedAvatars, id];
      setCoins(newCoins);
      setOwnedAvatars(newOwned);
      if (currentUser) {
        updateCurrentUser(user => ({
          ...user,
          coins: newCoins,
          ownedAvatars: newOwned
        }));
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#FFD700'] });
    }
  };

  const handleBuyBg = async (id: string, price: number) => {
    if (coins >= price && !ownedBackgrounds.includes(id)) {
      if (SUPABASE_ENABLED && currentUser?.sessionToken) {
        try {
          const dashboard = await supabaseRpc<any>('purchase_shop_item', {
            p_session_token: currentUser.sessionToken,
            p_item_type: 'background',
            p_item_id: id
          });
          saveCurrentUser(dashboardToUser(dashboard, currentUser.sessionToken));
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#3b82f6'] });
        } catch (error) {
          setCodeMessage({ text: error instanceof Error ? error.message : 'Could not buy background.', type: 'error' });
        }
        return;
      }

      const newCoins = coins - price;
      const newOwned = [...ownedBackgrounds, id];
      setCoins(newCoins);
      setOwnedBackgrounds(newOwned);
      if (currentUser) {
        updateCurrentUser(user => ({
          ...user,
          coins: newCoins,
          ownedBackgrounds: newOwned
        }));
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#3b82f6'] });
    }
  };

  const handleRedeemCode = async () => {
    const c = shopCode.toLowerCase().trim();
    if (SUPABASE_ENABLED && currentUser?.sessionToken) {
      try {
        const dashboard = await supabaseRpc<any>('redeem_code', {
          p_session_token: currentUser.sessionToken,
          p_code: c
        });
        saveCurrentUser(dashboardToUser(dashboard, currentUser.sessionToken));
        setCodeMessage({ text: 'Code redeemed!', type: 'success' });
        setShopCode('');
        confetti({ particleCount: 50, spread: 60 });
      } catch (error) {
        setCodeMessage({ text: error instanceof Error ? error.message : 'Invalid code.', type: 'error' });
      }
      return;
    }

    if (c === 'freecoins100') {
      const newCoins = coins + 100;
      setCoins(newCoins);
      if (currentUser) {
        updateCurrentUser(user => ({
          ...user,
          coins: newCoins
        }));
      }
      setCodeMessage({ text: 'You found 100 coins!', type: 'success' });
      setShopCode('');
      confetti({ particleCount: 50, spread: 60 });
    } else {
      setCodeMessage({ text: 'Invalid code.', type: 'error' });
    }
  };

  const handleOpenProfile = async (username: string) => {
    const normalized = normalizeUsername(username);

    if (SUPABASE_ENABLED) {
      try {
        const dashboard = await supabaseRpc<any>('get_player_dashboard', {
          p_username: username
        });
        const profile = dashboardToUser(dashboard);
        setAccounts(prev => {
          const nextAccounts = { ...prev, [normalized]: profile };
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextAccounts));
          return nextAccounts;
        });
        setSelectedProfileName(normalized);
      } catch (error) {
        console.error(error);
      }
      return;
    }

    setSelectedProfileName(normalized);
  };

  const renderAuth = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto w-full bg-white rounded-[40px] p-8 md:p-12 shadow-xl border-4 border-slate-100 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-2/3 h-4 bg-indigo-500"></div>
      <div className="text-center mb-8">
        <div className="text-7xl mb-5 bounce-slow">🎒</div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-3">Magic Typing Explorer!</h1>
        <p className="text-lg md:text-xl text-slate-400 font-bold">Make a game profile to save points, prizes, and accomplishments.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => {
            setAuthMode('create');
            setAuthError('');
          }}
          className={`py-4 rounded-2xl border-4 font-black uppercase tracking-wider transition-all ${authMode === 'create' ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
        >
          Create User
        </button>
        <button
          onClick={() => {
            setAuthMode('login');
            setAuthError('');
          }}
          className={`py-4 rounded-2xl border-4 font-black uppercase tracking-wider transition-all ${authMode === 'login' ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
        >
          Log In
        </button>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500 mb-2">
            <User size={18} /> User Name
          </span>
          <input
            type="text"
            value={authUsername}
            onChange={(e) => setAuthUsername(e.target.value)}
            className="w-full text-2xl font-black text-slate-800 bg-slate-50 border-4 border-slate-100 focus:border-indigo-400 rounded-xl px-4 py-3 outline-none transition-all"
            autoComplete="username"
          />
        </label>

        <label className="block">
          <span className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500 mb-2">
            <Lock size={18} /> Password
          </span>
          <input
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            className="w-full text-2xl font-black text-slate-800 bg-slate-50 border-4 border-slate-100 focus:border-indigo-400 rounded-xl px-4 py-3 outline-none transition-all"
            autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {authMode === 'create' && (
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500 mb-2">
              <Lock size={18} /> Type Password Again
            </span>
            <input
              type="password"
              value={authPasswordConfirm}
              onChange={(e) => setAuthPasswordConfirm(e.target.value)}
              className="w-full text-2xl font-black text-slate-800 bg-slate-50 border-4 border-slate-100 focus:border-indigo-400 rounded-xl px-4 py-3 outline-none transition-all"
              autoComplete="new-password"
            />
          </label>
        )}
      </div>

      {authError && (
        <div className="mt-5 bg-rose-50 border-4 border-rose-100 text-rose-600 font-bold rounded-2xl px-4 py-3 text-center">
          {authError}
        </div>
      )}

      <button
        onClick={handleAuthSubmit}
        className="mt-8 w-full inline-flex items-center justify-center gap-3 px-8 py-5 text-2xl md:text-3xl font-black text-white bg-indigo-500 rounded-2xl hover:bg-indigo-400 transition-all border-b-8 border-indigo-600 active:border-b-0 active:translate-y-2"
      >
        {authMode === 'create' ? 'Create My User' : 'Log In'}
      </button>

      <AnimatePresence>
        {showCredentialWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 p-6 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 border-4 border-yellow-200 shadow-xl max-w-lg text-center"
            >
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">Save This Somewhere Safe</h2>
              <p className="text-lg text-slate-500 font-bold leading-relaxed mb-6">
                You cannot change your user name or password later, so write it down and save it in a safe place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowCredentialWarning(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-black px-6 py-4 rounded-2xl border-b-4 border-slate-300"
                >
                  Go Back
                </button>
                <button
                  onClick={confirmCreateUser}
                  className="flex-1 bg-yellow-400 text-yellow-950 font-black px-6 py-4 rounded-2xl border-b-4 border-yellow-600"
                >
                  I Saved It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderDashboard = (profile: UserAccount, onClose: () => void) => {
    const modeRows = Object.entries(profile.modeStats);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl mx-auto w-full bg-white rounded-[40px] p-8 md:p-12 shadow-xl border-4 border-slate-100 flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-4 bg-emerald-400"></div>
        <div className="flex justify-between items-start gap-4 mb-8">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-20 h-20 rounded-3xl bg-orange-100 border-4 border-orange-200 flex items-center justify-center text-5xl shrink-0">
              {profile.avatar}
            </div>
            <div className="min-w-0">
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 truncate">{profile.username}</h1>
              <p className="text-slate-500 font-bold mt-1">Player Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-yellow-50 border-4 border-yellow-100 rounded-3xl p-5">
            <div className="text-xs font-black uppercase text-yellow-600 mb-1">Total Points</div>
            <div className="text-4xl font-black text-yellow-700">{profile.totalPointsEarned}</div>
          </div>
          <div className="bg-indigo-50 border-4 border-indigo-100 rounded-3xl p-5">
            <div className="text-xs font-black uppercase text-indigo-500 mb-1">Best Score</div>
            <div className="text-4xl font-black text-indigo-700">{profile.bestScore}</div>
          </div>
          <div className="bg-emerald-50 border-4 border-emerald-100 rounded-3xl p-5">
            <div className="text-xs font-black uppercase text-emerald-500 mb-1">Best Accuracy</div>
            <div className="text-4xl font-black text-emerald-700">{profile.bestAccuracy}%</div>
          </div>
          <div className="bg-orange-50 border-4 border-orange-100 rounded-3xl p-5">
            <div className="text-xs font-black uppercase text-orange-500 mb-1">Games Played</div>
            <div className="text-4xl font-black text-orange-700">{profile.gamesPlayed}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-slate-50 border-4 border-slate-100 rounded-3xl p-6">
            <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
              <Trophy className="text-amber-500" /> Accomplishments
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.achievements.length === 0 ? (
                <p className="text-slate-400 font-bold">No accomplishments yet.</p>
              ) : profile.achievements.map((achievement) => (
                <span key={achievement} className="bg-white border-2 border-amber-100 text-amber-700 px-3 py-2 rounded-xl font-black text-sm">
                  {achievement}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-slate-50 border-4 border-slate-100 rounded-3xl p-6">
            <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="text-indigo-500" /> Collections
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center border-2 border-slate-100">
                <div className="text-3xl font-black text-yellow-600">{profile.coins}</div>
                <div className="text-xs uppercase font-black text-slate-400">Coins</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border-2 border-slate-100">
                <div className="text-3xl font-black text-orange-600">{profile.ownedAvatars.length}</div>
                <div className="text-xs uppercase font-black text-slate-400">Characters</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border-2 border-slate-100">
                <div className="text-3xl font-black text-blue-600">{profile.ownedBackgrounds.length}</div>
                <div className="text-xs uppercase font-black text-slate-400">Worlds</div>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 border-4 border-slate-100 rounded-3xl p-6">
            <h2 className="text-2xl font-black text-slate-800 mb-4">Mode Bests</h2>
            {modeRows.length === 0 ? (
              <p className="text-slate-400 font-bold">Play a game to start filling this in.</p>
            ) : (
              <div className="space-y-3">
                {modeRows.map(([mode, stats]) => (
                  <div key={mode} className="bg-white border-2 border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="font-black text-slate-700 uppercase">{mode}</div>
                    <div className="text-sm font-bold text-slate-500">{stats.bestAccuracy}% acc</div>
                    <div className="font-black text-yellow-600">💰 {stats.bestScore}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-slate-50 border-4 border-slate-100 rounded-3xl p-6">
            <h2 className="text-2xl font-black text-slate-800 mb-4">Recent Games</h2>
            {profile.recentGames.length === 0 ? (
              <p className="text-slate-400 font-bold">No games played yet.</p>
            ) : (
              <div className="space-y-3">
                {profile.recentGames.map((game, index) => (
                  <div key={`${game.date}-${index}`} className="bg-white border-2 border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-black text-slate-700 uppercase">{game.mode}</div>
                      <div className="font-black text-yellow-600">💰 {game.score}</div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 mt-1">{game.difficulty} · {game.accuracy}% acc · {game.date}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </motion.div>
    );
  };

  const renderShop = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto w-full bg-white rounded-[40px] p-8 md:p-12 shadow-xl border-4 border-slate-100 flex flex-col relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-4 bg-yellow-400"></div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 flex items-center gap-3">
            <ShoppingBag className="text-yellow-500" size={40} /> The Magic Shop
          </h1>
          <p className="text-lg text-slate-500 font-medium mt-2">Spend your coins on awesome upgrades!</p>
        </div>
        <button 
          onClick={() => setShowShop(false)}
          className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b-4 border-slate-100 pb-4">
        <button 
          onClick={() => setShopCategory('avatars')}
          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-wider transition-all ${shopCategory === 'avatars' ? 'bg-orange-100 text-orange-600 border-b-4 border-orange-500' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Characters
        </button>
        <button 
          onClick={() => setShopCategory('backgrounds')}
          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-wider transition-all ${shopCategory === 'backgrounds' ? 'bg-blue-100 text-blue-600 border-b-4 border-blue-500' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Backgrounds
        </button>
        <button 
          onClick={() => setShopCategory('codes')}
          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-wider transition-all ${shopCategory === 'codes' ? 'bg-green-100 text-green-600 border-b-4 border-green-500' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Codes
        </button>
      </div>

      <div className="flex-1 min-h-[300px]">
        {shopCategory === 'avatars' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SHOP_AVATARS.filter(item => item.reqCount <= ownedAvatars.length + 1).map(item => {
              const owned = ownedAvatars.includes(item.id);
              const isLocked = !owned && (item.reqCount > ownedAvatars.length);
              
              return (
                <div key={item.id} className={`p-4 rounded-3xl border-4 flex flex-col items-center justify-center text-center transition-all ${owned ? 'border-orange-200 bg-orange-50' : isLocked ? 'border-slate-200 bg-slate-200' : 'border-slate-100 bg-slate-50'}`}>
                  {isLocked ? (
                    <div className="text-6xl mb-4 opacity-20 filter blur-sm grayscale select-none">❓</div>
                  ) : (
                    <div className="text-6xl mb-4">{item.emoji}</div>
                  )}
                  {isLocked ? (
                    <div className="text-slate-500 font-bold uppercase text-xs mt-2 px-2">Buy {item.reqCount - ownedAvatars.length} more characters to reveal</div>
                  ) : owned ? (
                    <div className="text-orange-600 font-bold uppercase text-sm mt-2">Owned</div>
                  ) : (
                    <button 
                      onClick={() => handleBuyAvatar(item.id, item.price)}
                      disabled={coins < item.price}
                      className={`mt-2 px-4 py-2 rounded-xl font-bold uppercase tracking-wider border-b-4 transition-all w-full flex items-center justify-center gap-1 ${coins >= item.price ? 'bg-yellow-400 border-yellow-500 text-yellow-900 hover:bg-yellow-300 active:border-b-0 active:translate-y-1' : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'}`}
                    >
                      💰 {item.price}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {shopCategory === 'backgrounds' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SHOP_BACKGROUNDS.filter(item => item.reqCount <= ownedBackgrounds.length + 1).map(item => {
              const owned = ownedBackgrounds.includes(item.id);
              const isLocked = !owned && (item.reqCount > ownedBackgrounds.length);
              
              return (
                <div key={item.id} className={`p-4 rounded-3xl border-4 flex flex-col items-center justify-center text-center transition-all ${owned ? 'border-blue-200 bg-blue-50' : isLocked ? 'border-slate-200 bg-slate-200' : 'border-slate-100 bg-slate-50'}`}>
                  {isLocked ? (
                    <>
                      <div className="text-5xl mb-2 opacity-20 filter blur-sm grayscale select-none">🗺️</div>
                      <div className="font-black text-slate-400 mb-2">???</div>
                      <div className="text-slate-500 font-bold uppercase text-xs mt-2 px-2">Buy {item.reqCount - ownedBackgrounds.length} more backgrounds to reveal</div>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl mb-2">{item.emoji}</div>
                      <div className="font-black text-slate-700 mb-2">{item.label}</div>
                      {owned ? (
                        <div className="text-blue-600 font-bold uppercase text-sm mt-2">Owned</div>
                      ) : (
                        <button 
                          onClick={() => handleBuyBg(item.id, item.price)}
                          disabled={coins < item.price}
                          className={`mt-2 px-4 py-2 rounded-xl font-bold uppercase tracking-wider border-b-4 transition-all w-full flex items-center justify-center gap-1 ${coins >= item.price ? 'bg-yellow-400 border-yellow-500 text-yellow-900 hover:bg-yellow-300 active:border-b-0 active:translate-y-1' : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'}`}
                        >
                          💰 {item.price}
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {shopCategory === 'codes' && (
          <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center pt-8">
            <Gift className="text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-black text-slate-800 mb-2">Have a Secret Code?</h2>
            <p className="text-slate-500 font-medium mb-6">Enter it below to uncover hidden treasures!</p>
            
            <div className="flex gap-2 w-full">
              <input 
                type="text" 
                value={shopCode}
                onChange={(e) => {
                  setShopCode(e.target.value);
                  setCodeMessage({ text: '', type: '' });
                }}
                placeholder="Enter code..."
                className="flex-1 text-xl font-bold bg-slate-50 border-4 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-green-400 transition-all uppercase"
              />
              <button 
                onClick={handleRedeemCode}
                className="bg-green-500 text-white font-black uppercase tracking-wider px-6 py-3 rounded-xl border-b-4 border-green-600 hover:bg-green-400 active:border-b-0 transition-all"
              >
                Redeem
              </button>
            </div>
            {codeMessage.text && (
              <div className={`mt-4 font-bold ${codeMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {codeMessage.text}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  const getAccuracy = () => {
    if (totalKeystrokes === 0) return 100;
    return Math.round((correctKeystrokes / totalKeystrokes) * 100);
  };

  const renderLobby = () => {
    if (showShop) return renderShop();
    if (showDashboard && currentUser) return renderDashboard(currentUser, () => setShowDashboard(false));
    if (selectedProfileName && accounts[selectedProfileName]) {
      return renderDashboard(accounts[selectedProfileName], () => setSelectedProfileName(null));
    }

    const topUsers = (SUPABASE_ENABLED ? remoteLeaderboard : (Object.values(accounts) as UserAccount[]))
      .filter(user => (user.modeStats[gameMode]?.gamesPlayed || 0) > 0)
      .sort((a, b) => {
        const bStats = b.modeStats[gameMode];
        const aStats = a.modeStats[gameMode];
        return (bStats?.bestScore || 0) - (aStats?.bestScore || 0);
      })
      .slice(0, 10);
    
    return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto w-full bg-white rounded-[40px] p-8 md:p-12 shadow-xl border-4 border-slate-100 flex flex-col gap-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-2/3 h-4 bg-indigo-500"></div>

      {/* Account Actions */}
      <div className="w-full flex flex-wrap justify-end gap-3 pt-2">
        <div className="bg-yellow-100 text-yellow-700 font-black px-4 py-2 rounded-full border-2 border-yellow-200 shadow-sm flex items-center gap-2 text-lg h-fit">
          💰 {coins}
        </div>
        <button
          onClick={() => setShowDashboard(true)}
          className="bg-emerald-500 text-white font-black px-5 py-3 rounded-full border-b-4 border-emerald-700 shadow-sm hover:translate-y-1 hover:border-b-0 transition-all flex items-center gap-2"
        >
          <BarChart3 size={20} />
          Dashboard
        </button>
        <button
          onClick={() => setShowShop(true)}
          className="bg-yellow-400 text-yellow-900 font-black px-5 py-3 rounded-full border-b-4 border-yellow-600 shadow-sm hover:translate-y-1 hover:border-b-0 transition-all flex items-center gap-2"
        >
          <ShoppingBag size={20} />
          Shop
        </button>
        <button
          onClick={handleLogout}
          className="bg-slate-100 text-slate-500 font-black px-5 py-3 rounded-full border-2 border-slate-200 shadow-sm hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
      {/* Left Column: Config */}
      <div className="flex-1 flex flex-col items-center text-center w-full min-w-0">
        <div className="text-6xl mb-6 bounce-slow">🎒</div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-4 leading-tight">
          Magic Typing Explorer!
        </h1>
        <p className="text-xl text-slate-400 font-medium mb-10">Get ready to type fast and find secrets!</p>

        <div className="w-full max-w-md bg-white p-6 rounded-3xl border-b-8 border-r-8 border-indigo-100 shadow-sm mb-8">
          <label className="block text-2xl font-black uppercase tracking-tighter text-indigo-400 mb-4">
            Your Player
          </label>
          <div className="bg-slate-50 border-4 border-slate-100 rounded-xl px-4 py-4 text-center">
            <div className="text-4xl mb-2">{avatar}</div>
            <div className="text-3xl font-black text-slate-800 truncate">{playerName}</div>
            <div className="text-xs uppercase font-black tracking-wider text-slate-400 mt-2">Username and password stay locked</div>
          </div>
        </div>

        <div className="w-full max-w-md bg-white p-6 rounded-3xl border-b-8 border-r-8 border-purple-100 shadow-sm mb-8">
          <label className="block text-2xl font-black uppercase tracking-tighter text-purple-400 mb-4">
            What to play?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setGameMode('words')}
              className={`p-2 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                gameMode === 'words'
                  ? 'bg-purple-100 border-purple-400 text-purple-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-purple-200 hover:bg-purple-50'
              }`}
            >
              <span className="text-2xl mb-1">ABC</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider">Words</span>
            </button>
            <button
              onClick={() => setGameMode('numbers')}
              className={`p-2 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                gameMode === 'numbers'
                  ? 'bg-amber-100 border-amber-400 text-amber-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span className="text-2xl mb-1">123</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider">Numbers</span>
            </button>
            <button
              onClick={() => setGameMode('math')}
              className={`p-2 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                gameMode === 'math'
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span className="text-2xl mb-1">½▵</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider">Math/Geo</span>
            </button>
            <button
              onClick={() => setGameMode('equations')}
              className={`p-2 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                gameMode === 'equations'
                  ? 'bg-blue-100 border-blue-400 text-blue-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              <span className="text-2xl mb-1">+-=</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider">Solve</span>
            </button>
            <button
              onClick={() => setGameMode('flipper')}
              className={`p-2 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                gameMode === 'flipper'
                  ? 'bg-rose-100 border-rose-400 text-rose-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-rose-200 hover:bg-rose-50'
              }`}
            >
              <span className="text-2xl mb-1">🔁</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider">Flipper</span>
            </button>
            <button
              onClick={() => setGameMode('emoji')}
              className={`p-2 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                gameMode === 'emoji'
                  ? 'bg-orange-100 border-orange-400 text-orange-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-orange-200 hover:bg-orange-50'
              }`}
            >
              <span className="text-2xl mb-1">🔥🐶</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider">Emojis</span>
            </button>
            <button
              onClick={() => setGameMode('scramble')}
              className={`p-2 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                gameMode === 'scramble'
                  ? 'bg-cyan-100 border-cyan-400 text-cyan-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-cyan-200 hover:bg-cyan-50'
              }`}
            >
              <span className="text-2xl mb-1">🌪️</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider">Scramble</span>
            </button>
            <button
              onClick={() => setGameMode('opposites')}
              className={`p-2 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                gameMode === 'opposites'
                  ? 'bg-indigo-100 border-indigo-400 text-indigo-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <span className="text-2xl mb-1">↔️</span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider">Opposites</span>
            </button>
          </div>
        </div>

        <div className="w-full max-w-md bg-white p-6 rounded-3xl border-b-8 border-r-8 border-sky-100 shadow-sm mb-8">
          <label className="block text-2xl font-black uppercase tracking-tighter text-sky-400 mb-4">
            How old are you?
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setDifficulty('easy')}
              className={`p-3 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                difficulty === 'easy'
                  ? 'bg-sky-100 border-sky-400 text-sky-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-sky-200 hover:bg-sky-50'
              }`}
            >
              <span className="text-3xl mb-1">🐣</span>
              <span className="text-[11px] md:text-sm uppercase tracking-wider">3-5 yrs</span>
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`p-3 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                difficulty === 'medium'
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span className="text-3xl mb-1">🚀</span>
              <span className="text-[11px] md:text-sm uppercase tracking-wider">6-8 yrs</span>
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`p-3 rounded-2xl border-4 font-bold flex flex-col items-center justify-center transition-all ${
                difficulty === 'hard'
                  ? 'bg-rose-100 border-rose-400 text-rose-700 scale-105'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-rose-200 hover:bg-rose-50'
              }`}
            >
              <span className="text-3xl mb-1">⚡</span>
              <span className="text-[11px] md:text-sm uppercase tracking-wider">9+ yrs</span>
            </button>
          </div>
        </div>

        <div className="mb-10 w-full max-w-md">
          <label className="block text-2xl font-black uppercase tracking-tighter text-emerald-400 mb-4">
            Pick your guide!
          </label>
          <div className="flex flex-wrap justify-center gap-3">
            {uniqueAvatars.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setAvatar(emoji);
                  if (currentUser) {
                    if (SUPABASE_ENABLED && currentUser.sessionToken) {
                      supabaseRpc<any>('update_player_style', {
                        p_session_token: currentUser.sessionToken,
                        p_avatar: emoji,
                        p_selected_bg: selectedBg
                      })
                        .then(dashboard => saveCurrentUser(dashboardToUser(dashboard, currentUser.sessionToken)))
                        .catch(error => console.error(error));
                      return;
                    }

                    updateCurrentUser(user => ({
                      ...user,
                      avatar: emoji
                    }));
                  }
                }}
                className={`text-4xl w-16 h-16 rounded-lg transition-all duration-200 flex items-center justify-center font-bold ${
                  avatar === emoji 
                  ? 'bg-orange-400 scale-110 border-b-4 border-orange-600 text-white' 
                  : 'bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 hover:scale-105'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10 w-full max-w-md">
          <label className="block text-2xl font-black uppercase tracking-tighter text-blue-400 mb-4">
            Pick your world!
          </label>
          <div className="flex flex-wrap justify-center gap-3">
            {currentBackgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => {
                  setSelectedBg(bg.id);
                  if (currentUser) {
                    if (SUPABASE_ENABLED && currentUser.sessionToken) {
                      supabaseRpc<any>('update_player_style', {
                        p_session_token: currentUser.sessionToken,
                        p_avatar: avatar,
                        p_selected_bg: bg.id
                      })
                        .then(dashboard => saveCurrentUser(dashboardToUser(dashboard, currentUser.sessionToken)))
                        .catch(error => console.error(error));
                      return;
                    }

                    updateCurrentUser(user => ({
                      ...user,
                      selectedBg: bg.id
                    }));
                  }
                }}
                className={`text-3xl w-16 h-16 rounded-lg transition-all duration-200 flex items-center justify-center font-bold ${
                  selectedBg === bg.id 
                  ? 'bg-blue-400 scale-110 border-b-4 border-blue-600 text-white' 
                  : 'bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 hover:scale-105'
                }`}
                title={bg.label}
              >
                {bg.emoji}
              </button>
            ))}
          </div>
        </div>

        {unlockedThemes.length > 0 && (
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border-b-8 border-r-8 border-orange-100 shadow-sm mb-8 relative">
            <div className="absolute -top-5 -right-5 text-4xl animate-bounce">🎒</div>
            <label className="block text-xl font-black uppercase tracking-tighter text-orange-400 mb-2">
              Your Backpack
            </label>
            <p className="text-slate-500 font-medium text-sm mb-4">You found secret themes! They are now in your collections above.</p>
            <div className="flex flex-wrap gap-2">
              {unlockedThemes.map(theme => (
                <div key={theme} className="px-3 py-2 bg-orange-50 text-orange-600 rounded-xl border-2 border-orange-200 font-bold text-sm uppercase tracking-wider">
                  {theme} Unlocked!
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={startCountdown}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-5 text-3xl font-black text-white bg-indigo-500 rounded-2xl hover:bg-indigo-400 transition-all border-b-8 border-indigo-600 active:border-b-0 active:translate-y-2 mt-4"
        >
          <Play size={32} className="fill-white" />
          Start Playing!
        </button>
      </div>

      {/* Right Column: Leaderboard */}
      <div className="w-full md:w-80 flex flex-col bg-slate-50 p-6 rounded-3xl border-4 border-slate-100 md:self-stretch max-h-[600px] shrink-0">
        <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center justify-center gap-2 shrink-0">
          <Trophy className="text-amber-500" /> Top Earners
        </h2>
        {topUsers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-medium text-center">
            <div className="text-4xl mb-4 opacity-50">🌟</div>
            <p>No earners yet.<br/>Be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-4">
            {topUsers.map((entry, i) => {
              const stats = entry.modeStats[gameMode];
              return (
              <button
                key={entry.username}
                onClick={() => handleOpenProfile(entry.username)}
                className="bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100 flex items-center gap-3 text-left hover:border-amber-200 hover:scale-[1.01] transition-all"
              >
                 <div className="text-2xl">{entry.avatar}</div>
                 <div className="flex-1 min-w-0">
                   <div className="font-bold text-slate-800 truncate">{i + 1}. {entry.username}</div>
                   <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stats?.bestAccuracy || 0}% acc · {entry.achievements.length} awards</div>
                 </div>
                 <div className="font-black text-yellow-600 text-xl flex items-center gap-1">💰{stats?.bestScore || 0}</div>
              </button>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </motion.div>
  )};

  const renderCountdown = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={countdown}
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="flex flex-col items-center"
        >
          <div className="text-8xl mb-8 bounce-slow">{avatar}</div>
          <h1 className="text-9xl md:text-[150px] font-black text-indigo-600">
            {countdown === 0 ? 'GO!' : countdown}
          </h1>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderGame = () => {
    const currentItem = words[currentWordIndex];
    if (!currentItem) return null;
    
    const { prompt, answer, hint } = currentItem;
    const answerStr = answer.toLowerCase();
    const isSame = prompt === answer;
    
    // Splitting answer for colored rendering
    const characters = answerStr.split('').map((char, index) => {
      let state = 'pending'; // 'correct' | 'wrong' | 'pending'
      if (index < currentInput.length) {
        state = currentInput[index] === char ? 'correct' : 'wrong';
      }
      return { char, state };
    });

    const isMatchCorrectSoFar = answerStr.startsWith(currentInput);

    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 min-h-[768px]" onClick={() => inputRef.current?.focus()}>
        {/* Header Bar */}
        <header className="grid grid-cols-2 md:grid-cols-3 items-center bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setGameState('LOBBY')}
              className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
              title="Back to Menu"
            >
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center text-white text-2xl font-bold border-b-4 border-orange-600 shrink-0">
              {avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Player</p>
              <h2 className="text-xl font-black text-slate-800 truncate">{playerName || 'Super Typer'}</h2>
            </div>
          </div>

          <div className="flex flex-col items-center col-span-2 md:col-span-1 mt-4 md:mt-0 order-last md:order-none">
            <div className="bg-rose-50 px-6 py-2 rounded-full border-2 border-rose-200 flex items-center gap-3">
              <Timer className="w-6 h-6 text-rose-500" />
              <span className={`text-2xl font-black font-mono tracking-tighter ${timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-rose-600'}`}>{timeLeft}s</span>
            </div>
          </div>
          
          <div className="hidden md:flex justify-end gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200"></div>
            <div className="w-8 h-8 rounded-lg bg-sky-200 border border-sky-300"></div>
            <div className="w-8 h-8 rounded-lg bg-sky-300 border border-sky-400"></div>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar Stats */}
          <aside className="md:col-span-3 flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-visible">
            <div className="bg-white p-6 rounded-3xl border-b-8 border-r-8 border-yellow-100 shadow-sm min-w-[140px] flex-1 md:flex-none">
              <p className="text-xs font-black uppercase text-yellow-500 mb-1 tracking-tighter">Coins Earned</p>
              <p className="text-4xl md:text-5xl font-black text-yellow-600 flex items-center gap-1">💰{score}</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border-b-8 border-r-8 border-emerald-100 shadow-sm min-w-[140px] flex-1 md:flex-none">
              <p className="text-xs font-black uppercase text-emerald-400 mb-1 tracking-tighter">Accuracy</p>
              <p className="text-4xl md:text-5xl font-black text-emerald-600">{getAccuracy()}<span className="text-2xl">%</span></p>
            </div>

            {/* Character Guide Bubble */}
            <AnimatePresence>
              {characterMood !== 'neutral' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`mt-2 flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl border-2 shadow-sm ${
                    characterMood === 'happy' ? 'bg-orange-100 border-orange-200' : 'bg-amber-100 border-amber-200'
                  }`}
                >
                  <p className={`text-sm font-bold leading-tight ${characterMood === 'happy' ? 'text-orange-800' : 'text-amber-800'}`}>
                    {characterMood === 'happy' ? '"You\'re doing great! Keep going!"' : '"Oops! Try again!"'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

          {/* Main Typing Area */}
          <section className="col-span-1 md:col-span-9 bg-white min-h-[400px] rounded-[40px] border-4 border-slate-100 shadow-xl flex flex-col overflow-hidden relative">
            <div className="h-4 bg-indigo-500 w-2/3"></div>
            
            {floatingEgg && (
              <button
                key={floatingEgg.id}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.focus();
                  setScore(s => s + 50);
                  setFloatingEgg(null);
                  confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { x: floatingEgg.x / 100, y: floatingEgg.y / 100 },
                    colors: ['#FFD700', '#FFA500']
                  });
                }}
                className="absolute z-50 text-5xl hover:scale-125 transition-transform animate-bounce cursor-pointer"
                style={{ left: `${floatingEgg.x}%`, top: `${floatingEgg.y}%` }}
              >
                {floatingEgg.emoji}
              </button>
            )}

            <div className="p-8 md:p-12 flex-1 flex flex-col justify-center items-center relative z-10">
              
              {/* Word Display */}
              <div className="flex flex-col items-center justify-center w-full">
                {isSame ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-8" style={{ minHeight: '100px' }}>
                    {characters.map((item, idx) => {
                      let colorClasses = "text-slate-300"; // pending
                      if (item.state === 'correct') colorClasses = "text-indigo-600 border-b-4 border-indigo-200 mt-[4px]";
                      if (item.state === 'wrong') colorClasses = "text-slate-800 bg-amber-100 border-b-4 border-amber-400 mt-[4px] px-2 rounded-t-lg";

                      return (
                         <span 
                           key={idx} 
                           className={`text-6xl md:text-7xl font-mono md:font-sans font-medium transition-all duration-150 inline-block leading-none ${colorClasses}`}
                         >
                           {item.char}
                         </span>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center mb-8 gap-4">
                    <div className="text-6xl md:text-8xl font-black text-slate-800 text-center tracking-tight">
                      {prompt}
                    </div>
                    {hint && (
                      <div className="bg-amber-100 text-amber-800 px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm border-2 border-amber-200">
                        💡 Hint: {hint}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full max-w-sm relative mt-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={handleInputChange}
                  className={`w-full text-center text-4xl py-4 px-6 rounded-2xl font-bold border-4 focus:outline-none transition-colors duration-200 ${
                    isMatchCorrectSoFar || currentInput === ''
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400' 
                      : 'bg-rose-50 border-rose-300 text-rose-900 focus:border-rose-500 animate-shake'
                  }`}
                  placeholder="Type..."
                  autoFocus
                  autoCorrect="off" 
                  autoCapitalize="off"
                  spellCheck="false"
                  autoComplete="off"
                />
              </div>

              {!isSame && (
                <button 
                  onClick={() => {
                    setCurrentInput('');
                    handleNextWord();
                    inputRef.current?.focus();
                  }}
                  className="mt-8 text-slate-400 hover:text-rose-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-colors"
                >
                  <RotateCcw size={16} /> Pass (Skip)
                </button>
              )}

            </div>
          </section>
        </main>
      </div>
    );
  };

  const renderGameOver = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto w-full bg-white rounded-[40px] p-8 md:p-14 shadow-xl border-4 border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-2/3 h-4 bg-emerald-400"></div>

      <div className="text-8xl mb-6 bounce-slow">🏆</div>
      <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-2">
        Time's Up!
      </h1>
      <p className="text-2xl text-slate-400 font-medium mb-10">Amazing job, <span className="text-slate-700">{playerName}</span>!</p>

      <div className="grid grid-cols-2 gap-4 w-full mb-12">
        <div className="bg-white p-6 rounded-3xl border-b-8 border-r-8 border-yellow-100 shadow-sm flex flex-col items-center">
          <div className="text-yellow-500 font-black uppercase tracking-tighter mb-2 text-sm">Coins Earned</div>
          <div className="text-5xl md:text-6xl font-black text-yellow-600 flex items-center gap-2">💰 {score}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-b-8 border-r-8 border-emerald-100 shadow-sm flex flex-col items-center">
          <div className="text-emerald-400 font-black uppercase tracking-tighter mb-2 text-sm">Accuracy</div>
          <div className="text-5xl md:text-6xl font-black text-emerald-600">{getAccuracy()}%</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
        <button 
          onClick={() => setGameState('LOBBY')}
          className="group relative inline-flex justify-center items-center gap-3 px-8 py-5 text-2xl font-black text-slate-600 bg-slate-100 rounded-2xl border-b-8 border-slate-300 hover:bg-slate-200 transition-all active:border-b-0 active:translate-y-2"
        >
          Change Player
        </button>
        <button 
          onClick={startCountdown}
          className="group relative inline-flex justify-center items-center gap-3 px-10 py-5 text-3xl font-black text-white bg-emerald-500 rounded-2xl border-b-8 border-emerald-600 hover:bg-emerald-400 transition-all active:border-b-0 active:translate-y-2"
        >
          <RotateCcw size={32} />
          Play Again!
        </button>
      </div>
    </motion.div>
  );

  const currentBgClass = currentBackgrounds.find(bg => bg.id === selectedBg)?.className || 'bg-[#FDFCF0]';

  // Apply to body for overscroll effects
  useEffect(() => {
    document.body.className = `transition-colors duration-500 ${currentBgClass}`;
  }, [currentBgClass]);

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${currentBgClass} text-slate-800 font-sans p-4 md:p-8 flex items-center justify-center transition-colors duration-500`}>
        {renderAuth()}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentBgClass} text-slate-800 font-sans p-4 md:p-8 flex items-center justify-center transition-colors duration-500`}>
      <AnimatePresence mode="wait">
        {gameState === 'LOBBY' && <motion.div key="lobby" className="w-full">{renderLobby()}</motion.div>}
        {gameState === 'COUNTDOWN' && <motion.div key="countdown" className="w-full flex justify-center items-center">{renderCountdown()}</motion.div>}
        {gameState === 'PLAYING' && <motion.div key="game" className="w-full">{renderGame()}</motion.div>}
        {gameState === 'GAMEOVER' && <motion.div key="gameOver" className="w-full">{renderGameOver()}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
