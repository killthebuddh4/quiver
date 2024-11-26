"use client";
import { useParams } from "next/navigation";
import { GameBoard } from "@/components/GameBoard";
import { useClient } from "@/hooks/useClient";
import { useRouter } from "@/hooks/useRouter";
import { useQuiver } from "@/hooks/useQuiver";
import { useGame } from "@/hooks/useGame";
import { Cell } from "@/hooks/useGame";
import { useEffect } from "react";

export default function Challenger() {
  const address = useParams().address as string;
  const { q } = useQuiver();
  const { router } = useRouter();
  const { client } = useClient({ address });
  const { game, move, join } = useGame();

  useEffect(() => {
    if (q === null) {
      console.log(
        "Challenger :: useEffect in Challenger is returning because q is null",
      );
      return;
    }

    if (client === null) {
      console.log(
        "Challenger :: useEffect in Challenger is returning because client is null",
      );
      return;
    }

    (async () => {
      console.log(`Challenger :: joining game hosted by address ${address}`);

      const player = { address: q.address, symbol: "O" } as const;

      const response = await client.join({ player });

      if (!response.ok) {
        console.error(
          `Challenger :: Could not join game hosted by address ${address}`,
          response,
        );
        return;
      }

      if (!response.data.ok) {
        console.error(
          `Challenger :: Could not join game hosted by address ${address}`,
          response.data.err,
        );
        return;
      }

      if (response.data.value.x === null) {
        console.error(
          `Challenger :: game hosted by address ${address} has no host`,
        );
        return;
      }

      console.log(`Challenger :: joined game hosted by address ${address}`);
      join({ player });
      join({ player: response.data.value.x });
    })();
  }, [q, client]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <GameBoard
        game={game}
        onClick={async (cell: Cell) => {
          if (game.x === null) {
            console.error("Host :: game.x is null");
            return;
          }

          if (game.o === null) {
            console.error("Host :: game.o is null");
            return;
          }

          if (client === null) {
            console.error("Host :: client is null");
            return;
          }

          const m = {
            cell,
            player: game.o,
          };

          const response = await client.move({ move: m });

          if (!response.ok) {
            console.error("Host :: move failed", response);
            return;
          }

          if (!response.data.ok) {
            console.error("Host :: move failed", response.data.err);
            return;
          }

          const result = move({ move: m });

          if (!result.ok) {
            console.error("Host :: move failed", result);
            return;
          }
        }}
      />
    </div>
  );
}
