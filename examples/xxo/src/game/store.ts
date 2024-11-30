import { create } from "zustand";
import { Game } from "./types";

export const store = create<{
  game: Game;
  setGame: (game: Game) => void;
}>((set) => ({
  game: {
    x: null,
    o: null,
    moves: [],
    winner: null,
  },
  setGame: (game) => {
    set({ game });
  },
}));
