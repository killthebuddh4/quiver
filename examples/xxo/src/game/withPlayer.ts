import { Game, Player, Maybe } from "./types";

export const withPlayer = (game: Game, player: Player): Maybe<Game> => {
  if (player.symbol === "X") {
    if (game?.x !== null) {
      return { ok: false, err: "ERR_X_IS_TAKEN" };
    }

    return { ok: true, value: { ...game, x: player } };
  } else {
    if (game?.o !== null) {
      return { ok: false, err: "ERR_O_IS_TAKEN" };
    }

    return { ok: true, value: { ...game, o: player } };
  }
};
