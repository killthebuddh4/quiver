"use client";
import { GameBoard } from "@/components/GameBoard";
import { useClient } from "@/hooks/useClient";
import { useQuiver } from "@/hooks/useQuiver";
import { useRouter } from "@/hooks/useRouter";
import { useGame, Cell } from "@/hooks/useGame";
import { useEffect } from "react";

export default function Host() {
  const { q } = useQuiver();
  const { game, join, move } = useGame();
  const { client } = useClient({ address: game.o?.address });
  const { router } = useRouter();

  console.log(`Host :: Quiver started for host at address ${q?.address}`);

  useEffect(() => {
    if (q === null) {
      console.log("Host :: useEffect in Host is returning because q is null");
      return;
    }

    (async () => {
      console.log(`Host :: ${q.address} is joining game`);

      const result = join({
        player: {
          address: q.address,
          symbol: "X",
        },
      });

      console.log("Host :: joined game", result);
    })();
  }, [q]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <h1>{`Host: ${game.x?.address}`}</h1>
      <h2>{`Challenger: ${game.o?.address || "no challenger"}`}</h2>
      <GameBoard
        game={game}
        onClick={async (cell: Cell) => {
          if (game.x === null) {
            console.error("Host :: game.x is null");
            return;
          }

          if (client === null) {
            console.error("Host :: client is null");
            return;
          }

          const m = {
            cell,
            player: game.x,
          };

          const result = move({ move: m });

          if (!result.ok) {
            console.error("Host :: move failed", result);
            return;
          }

          const response = await client.move({
            move: {
              cell,
              player: game.x,
            },
          });

          if (!response.ok) {
            console.error("Host :: move failed", response);
            return;
          }

          if (!response.data.ok) {
            console.error("Host :: move failed", response.data.err);
            return;
          }
        }}
      />
    </div>
  );
}
