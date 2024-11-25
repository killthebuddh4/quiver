import { useState, useEffect } from "react";

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

export const useGame = () => {
  const [game, setGame] = useState<Game>({
    x: null,
    o: null,
    moves: [],
    winner: null,
  });

  const move = (props: { move: Move }): Maybe<Game> => {
    if (game.moves.length === 0) {
      if (props.move.player.symbol !== "X") {
        return { ok: false, err: "ERR_FIRST_MOVE_MUST_BE_X" };
      }

      const withMove = {
        ...game,
        moves: [props.move],
      };

      const withWinner = {
        ...withMove,
        winner: getWinner(withMove),
      };

      setGame(withWinner);

      return { ok: true, value: withWinner };
    }

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

    const withMove = {
      ...game,
      moves: [...game.moves, props.move],
    };

    const withWinner = {
      ...withMove,
      winner: getWinner(withMove),
    };

    setGame(withWinner);

    return { ok: true, value: withWinner };
  };

  const join = (props: { player: Player }): Maybe<Game> => {
    if (props.player.symbol === "X") {
      if (game?.x !== null) {
        return { ok: false, err: "ERR_X_IS_TAKEN" };
      }

      const next = {
        ...game,
        x: props.player,
      };

      setGame(next);

      return { ok: true, value: next };
    }

    if (props.player.symbol === "O") {
      if (game?.o !== null) {
        return { ok: false, err: "ERR_O_IS_TAKEN" };
      }

      const next = {
        ...game,
        o: props.player,
      };

      setGame(next);

      return { ok: true, value: next };
    }

    throw new Error("ERR_INVALID_SYMBOL");
  };

  const withWinner = {
    ...game,
    winner: getWinner(game),
  };

  return { game: { ...withWinner }, move, join };
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
