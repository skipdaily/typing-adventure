import type { GameItem } from './types';

const mapToGameItem = (list: string[]): GameItem[] => list.map(word => ({ prompt: word, answer: word }));

export const MATH_LIST_EASY = mapToGameItem([
  "1/2", "1/4", "3/4", "0.5", "0.1", "1.5", "2.0", "line", "dot", "ray",
  "cube", "cone", "area", "math", "add", "sum", "box", "half"
]);

export const MATH_LIST_MEDIUM = mapToGameItem([
  "1/3", "2/5", "3/8", "0.25", "0.75", "1.25", "3.14", "angle", "circle", "square",
  "vertex", "side", "base", "prism", "shape", "equal", "minus"
]);

export const MATH_LIST_HARD = mapToGameItem([
  "3.1415", "5/16", "7/8", "0.333", "decimal", "fraction", "geometry", "polygon",
  "triangle", "rectangle", "cylinder", "perimeter", "volume", "diameter", "radius", "equation"
]);
