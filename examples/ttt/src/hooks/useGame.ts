import { useState, useEffect, useCallback } from "react";
import { create } from "zustand";

export type Player = {
  address: string;
  symbol: "X" | "O";
};

export type Cell = {
  id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export type Move = {
  cell: Cell;
  player: Player;
};

export type Game = {
  x: Player | null;
  o: Player | null;
  moves: Move[];
  winner: Player | null;
};

export type Maybe<T> =
  | {
      ok: true;
      value: T;
      err?: undefined;
    }
  | {
      ok: false;
      value?: undefined;
      err: string;
    };

const useGameStore = create<{
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

export const useGame = () => {
  const { game, setGame } = useGameStore();

  const move = useCallback(
    (props: { move: Move }): Maybe<Game> => {
      let next: Game;

      if (game.moves.length === 0) {
        if (props.move.player.symbol !== "X") {
          return { ok: false, err: "ERR_FIRST_MOVE_MUST_BE_X" };
        }

        next = {
          ...game,
          moves: [props.move],
        };

        next = {
          ...next,
          winner: getWinner(next),
        };
      } else {
        const lastMove = game.moves[game.moves.length - 1];

        if (lastMove.player.symbol === props.move.player.symbol) {
          return { ok: false, err: "ERR_PLAYER_MUST_ALTERNATE" };
        }

        const isCellFilled = Boolean(
          game.moves.find((s) => s.cell.id === props.move.cell.id),
        );

        if (isCellFilled) {
          return { ok: false, err: "ERR_CELL_IS_FILLED" };
        }

        next = {
          ...game,
          moves: [...game.moves, props.move],
        };

        next = {
          ...next,
          winner: getWinner(next),
        };
      }

      console.log("useGame :: setting game from move", next, props);
      setGame(next);

      return { ok: true, value: next };
    },
    [game, setGame],
  );

  const join = useCallback(
    (props: { player: Player }): Maybe<Game> => {
      console.log("useGame :: join", props, game);
      let next: Game;

      if (props.player.symbol === "X") {
        if (game?.x !== null) {
          return { ok: false, err: "ERR_X_IS_TAKEN" };
        }

        next = {
          ...game,
          x: props.player,
        };
      } else if (props.player.symbol === "O") {
        if (game?.o !== null) {
          return { ok: false, err: "ERR_O_IS_TAKEN" };
        }

        next = {
          ...game,
          o: props.player,
        };
      } else {
        throw new Error("ERR_INVALID_SYMBOL");
      }

      next = {
        ...next,
        winner: getWinner(next),
      };

      console.log("useGame :: setting game from join", next, props);
      setGame(next);

      return { ok: true, value: next };
    },
    [game, setGame],
  );

  return { game, move, join };
};

const getWinner = (game: Game) => {
  const combinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combination of combinations) {
    const [a, b, c] = combination;

    const aMove = game.moves.find((move) => move.cell.id === a);
    const bMove = game.moves.find((move) => move.cell.id === b);
    const cMove = game.moves.find((move) => move.cell.id === c);

    if (aMove && bMove && cMove) {
      if (
        aMove.player.symbol === bMove.player.symbol &&
        bMove.player.symbol === cMove.player.symbol
      ) {
        return aMove.player;
      }
    }
  }

  return null;
};
