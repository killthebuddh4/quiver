import { Game, Move, Maybe } from "./types";
import { withWinner } from "./withWinner";

export const withMove = (game: Game, move: Move): Maybe<Game> => {
  if (game.moves.length === 0) {
    if (move.player.symbol !== "X") {
      return { ok: false, err: "ERR_FIRST_MOVE_MUST_BE_X" };
    }

    return {
      ok: true,
      value: withWinner({
        ...game,
        moves: [move],
      }),
    };
  } else {
    const lastMove = game.moves[game.moves.length - 1];

    if (lastMove.player.symbol === move.player.symbol) {
      return { ok: false, err: "ERR_PLAYER_MUST_ALTERNATE" };
    }

    const isCellFilled = Boolean(
      game.moves.find((s) => s.cell.id === move.cell.id),
    );

    if (isCellFilled) {
      return { ok: false, err: "ERR_CELL_IS_FILLED" };
    }

    return {
      ok: true,
      value: withWinner({
        ...game,
        moves: [...game.moves, move],
      }),
    };
  }
};
