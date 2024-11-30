import { Game } from "./types";

export const withWinner = (game: Game) => {
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
        return {
          ...game,
          winner: aMove.player,
        };
      }
    }
  }

  return game;
};
