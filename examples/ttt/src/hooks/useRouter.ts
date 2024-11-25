import { useState, useEffect } from "react";
import { useQuiver } from "./useQuiver";
import { QuiverRouter } from "@qrpc/quiver/build/types/QuiverRouter";
import { useGame } from "./useGame";

export const useRouter = () => {
  const { q } = useQuiver();
  const { move, join } = useGame();
  const [router, setRouter] = useState<QuiverRouter<
    any,
    any,
    {
      join: typeof join;
      move: typeof move;
    }
  > | null>(null);

  useEffect(() => {
    console.log("useRouter :: useEffect in useRouter is running");

    if (q === null) {
      console.log(
        "useRouter :: useEffect in useRouter is returning because q is null",
      );
      return;
    }

    setRouter((prev) => {
      if (prev !== null) {
        return prev;
      }

      const router = q
        .router()
        .function("move", (props: Parameters<typeof move>[0]) => {
          console.log(
            `useRouter :: move function was called by ${props.move.player.address}`,
          );
          return move(props);
        })
        .function("join", (props: Parameters<typeof join>[0]) => {
          console.log(
            `useRouter :: Join function was called by ${props.player.address}`,
          );
          return join(props);
        });

      q.serve(router);

      return router;
    });
  }, [q]);

  return { router };
};
