import type { GameItem } from './types';

const mapToGameItem = (list: string[]): GameItem[] => list.map(word => ({ prompt: word, answer: word }));

export const WORD_LIST_EASY = mapToGameItem([
  "cat", "dog", "pig", "cow", "rat", "sun", "moon", "star", "bug", "ant",
  "bat", "car", "bus", "hat", "cap", "red", "blue", "run", "jump", "play",
  "toy", "boy", "girl", "mom", "dad", "tree", "bird", "fish", "frog", "bear",
  "bee", "fly", "fox", "owl", "man", "map", "box", "cup", "bed", "day",
  "one", "two", "six", "ten", "yes", "no", "hi", "bye", "up", "out"
]);

export const WORD_LIST_MEDIUM = mapToGameItem([
  "apple", "bread", "house", "mouse", "train", "plant", "water", "earth", "world", "light",
  "happy", "smile", "laugh", "green", "black", "white", "brown", "color", "paint", "paper",
  "school", "friend", "family", "sister", "brother", "mother", "father", "animal", "monkey", "tiger",
  "lion", "zebra", "snake", "ocean", "river", "beach", "grass", "cloud", "storm", "magic",
  "music", "dance", "song", "story", "book", "pencil", "clock", "watch", "shoe", "shirt"
]);

export const WORD_LIST_HARD = mapToGameItem([
  "elephant", "giraffe", "dinosaur", "computer", "keyboard", "internet", "website", "champion", "adventure", "treasure",
  "mountain", "volcano", "astronaut", "spaceship", "universe", "galaxy", "scientist", "experiment", "telescope", "microscope",
  "butterfly", "crocodile", "alligator", "kangaroo", "penguin", "dolphin", "whale", "octopus", "jellyfish", "seahorse",
  "beautiful", "wonderful", "amazing", "fantastic", "brilliant", "excellent", "awesome", "perfect", "magical", "colorful",
  "important", "together", "different", "remember", "understand", "question", "answer", "learning", "discovery", "knowledge"
]);
