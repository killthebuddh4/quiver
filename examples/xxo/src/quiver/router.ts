import { Move, Player } from "../game/types";
import { withPlayer } from "../game/withPlayer";
import { withMove } from "../game/withMove";
import { store } from "../game/store";
import { q } from "./q";

const join = (props: { player: Player }) => {
  const game = store.getState().game;
  const next = withPlayer(game, props.player);

  if (next.ok) {
    store.setState({ game: next.value });
  }

  return next;
};

const move = (props: { move: Move }) => {
  const game = store.getState().game;
  const next = withMove(game, props.move);

  if (next.ok) {
    store.setState({ game: next.value });
  }

  return next;
};

const router = q.router().function("move", move).function("join", join);

export type Router = typeof router;

q.serve(router);
