import type { GameItem } from './types';

const mapToGameItem = (list: string[]): GameItem[] => list.map(word => ({ prompt: word, answer: word }));

export const NUMBER_LIST_EASY = mapToGameItem([
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "15", "20", "25", "30", "40", "50", "99"
]);

export const NUMBER_LIST_MEDIUM = mapToGameItem([
  "100", "200", "300", "400", "500", "150", "250", "350", "450", "550",
  "123", "456", "789", "987", "654", "321", "111", "222", "333", "444",
  "105", "206", "307", "408", "509", "999", "888", "777", "666", "555"
]);

export const NUMBER_LIST_HARD = mapToGameItem([
  "1000", "2000", "3000", "1234", "5678", "3456", "7890", "9999", "8888", "2500",
  "1999", "2023", "2024", "2025", "7777", "6666", "5555", "4444", "2020", "5050"
]);
