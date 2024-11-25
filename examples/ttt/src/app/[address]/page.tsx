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
      const player = { address, symbol: "O" } as const;
      const response = await client.join({ player });

      if (!response.ok) {
        console.error(
          `Challenger :: Could not join game hosted by address ${address}`,
          response,
        );
        return;
      }

      join({ player });
    })();
  }, [q, client]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <GameBoard
        game={game}
        onClick={(cell: Cell) => {
          // TODO
        }}
      />
    </div>
  );
}
